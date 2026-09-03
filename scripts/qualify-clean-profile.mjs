#!/usr/bin/env node
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { assertCompositionDump, commandFailureDetail, localSuiteOverrideYaml, localSuiteOverrides, suiteOnlyLayers } from "./lib/clean-profile-policy.mjs";
import { packWorkspaces } from "./lib/package-artifacts.mjs";

const root = new URL("../", import.meta.url).pathname;
const ownerAsset = JSON.parse(await readFile(resolve(root, "config/dsh-compatibility.json"), "utf8")).executionOwner.coordinate;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${result.error?.message ?? commandFailureDetail(result)}`.trim());
  }
  return result.stdout;
}

async function profileCase({ archives, expectedIds, ownerRequired = false, rewriteSuite = false, temporary, id }) {
  const home = resolve(temporary, `home-${id}`);
  const env = { ...process.env, DSH_HOME: home };
  const manifestPath = resolve(home, "profiles/web/package.json");
  const roots = ownerRequired ? [ownerAsset, ...archives] : archives;
  if (rewriteSuite) {
    run("dsh", ["plugin", "--profile", "web", "add", ownerAsset, ...archives.slice(0, 2), "--ignore-scripts"], { env });
    const workspacePolicyPath = resolve(home, "profiles/web/pnpm-workspace.yaml");
    const workspacePolicy = await readFile(workspacePolicyPath, "utf8");
    if (/^overrides:/mu.test(workspacePolicy)) throw new Error("CLEAN_PROFILE_OVERRIDE_COLLISION");
    const overrides = localSuiteOverrideYaml(localSuiteOverrides({ execution: archives[0], studio: archives[1] }));
    await writeFile(workspacePolicyPath, `${workspacePolicy.trimEnd()}\n${overrides}`);
    run("dsh", ["plugin", "--profile", "web", "add", archives[2], "--ignore-scripts"], { env });
  } else {
    run("dsh", ["plugin", "--profile", "web", "add", ...roots, "--ignore-scripts"], { env });
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (rewriteSuite) {
    manifest.dsh.profile.bundles = suiteOnlyLayers(manifest.dsh.profile.bundles);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  const dump = run("dsh", ["--profile", "web", "--dump-config"], { env });
  assertCompositionDump(dump, expectedIds);
  return Object.freeze({ id, bundles: manifest.dsh.profile.bundles, dependencies: manifest.dependencies });
}

const temporary = await mkdtemp(join(tmpdir(), "wsr-dsh-clean-profile-"));
try {
  const version = run("dsh", ["--version"]).trim();
  if (version !== "0.1.1-rc.2") throw new Error(`DSH_VERSION_MISMATCH: ${version}`);
  const output = resolve(temporary, "packages");
  const archives = await packWorkspaces({ root, output });
  const byName = Object.fromEntries(archives.map((path) => [
    basename(path).startsWith("dsh-wsr-execution-") ? "execution"
      : basename(path).startsWith("dsh-wsr-studio-") ? "studio" : "suite",
    path,
  ]));
  const reports = [];
  reports.push(await profileCase({
    archives: [byName.execution],
    expectedIds: ["wsr-execution"],
    ownerRequired: true,
    temporary,
    id: "execution",
  }));
  reports.push(await profileCase({ archives: [byName.studio], expectedIds: ["wsr-studio"], temporary, id: "studio" }));
  reports.push(await profileCase({
    archives: [byName.execution, byName.studio, byName.suite],
    expectedIds: ["wsr-execution", "wsr-studio"],
    ownerRequired: true,
    rewriteSuite: true,
    temporary,
    id: "suite",
  }));
  process.stdout.write(`${JSON.stringify({ dsh: version, cases: reports.map(({ id, bundles }) => ({ id, bundles })) }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
