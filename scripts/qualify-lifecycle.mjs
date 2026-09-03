#!/usr/bin/env node
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { assertCompositionDump, commandFailureDetail, localSuiteOverrideYaml, localSuiteOverrides, reconcileSuiteLayers, suiteOnlyLayers } from "./lib/clean-profile-policy.mjs";
import { packWorkspaces } from "./lib/package-artifacts.mjs";

const root = resolve(new URL("../", import.meta.url).pathname);
const ownerAsset = JSON.parse(await readFile(resolve(root, "config/dsh-compatibility.json"), "utf8")).executionOwner.coordinate;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error !== undefined || result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed: ${result.error?.message ?? commandFailureDetail(result)}`);
  return result.stdout;
}

async function previousArchives(temporary) {
  const output = join(temporary, "previous");
  await mkdir(output);
  const result = {};
  for (const id of ["execution", "studio", "suite"]) {
    const staging = join(temporary, `source-${id}`);
    await cp(join(root, "packages", id), staging, { recursive: true });
    const manifestPath = join(staging, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.version = "0.0.9";
    if (id === "suite") manifest.dependencies = { "dsh-wsr-execution": "0.0.9", "dsh-wsr-studio": "0.0.9" };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    run("npm", ["pack", "--silent", "--pack-destination", output, staging]);
    const prefix = id === "suite" ? "dsh-wsr-0.0.9" : `dsh-wsr-${id}-0.0.9`;
    result[id] = join(output, (await readdir(output)).find((file) => file.startsWith(prefix)));
  }
  return result;
}

async function setSuitePolicy(home, archives, version) {
  const policyPath = join(home, "profiles/web/pnpm-workspace.yaml");
  const policy = await readFile(policyPath, "utf8");
  if (/^overrides:/mu.test(policy)) throw new Error("LIFECYCLE_OVERRIDE_COLLISION");
  await writeFile(policyPath, `${policy.trimEnd()}\n${localSuiteOverrideYaml(localSuiteOverrides(archives, version))}`);
}

function dump(env, expected) {
  const value = run("dsh", ["--profile", "web", "--dump-config"], { env });
  assertCompositionDump(value, expected);
}

async function setLayers(home, mutate) {
  const path = join(home, "profiles/web/package.json");
  const manifest = JSON.parse(await readFile(path, "utf8"));
  manifest.dsh.profile.bundles = mutate(manifest.dsh.profile.bundles);
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

const temporary = await mkdtemp(join(tmpdir(), "wsr-dsh-lifecycle-"));
try {
  if (run("dsh", ["--version"]).trim() !== "0.1.1-rc.2") throw new Error("DSH_VERSION_MISMATCH");
  const currentPaths = await packWorkspaces({ root, output: join(temporary, "current") });
  const current = Object.fromEntries(currentPaths.map((path) => [basename(path).startsWith("dsh-wsr-execution-") ? "execution" : basename(path).startsWith("dsh-wsr-studio-") ? "studio" : "suite", path]));
  const previous = await previousArchives(temporary);
  const reports = [];

  for (const id of ["execution", "studio"]) {
    const home = join(temporary, `home-${id}`);
    const env = { ...process.env, DSH_HOME: home };
    const roots = id === "execution" ? [ownerAsset, previous[id]] : [previous[id]];
    run("dsh", ["plugin", "--profile", "web", "add", ...roots, "--ignore-scripts"], { env });
    dump(env, [`wsr-${id}`]);
    run("dsh", ["plugin", "--profile", "web", "add", current[id], "--ignore-scripts"], { env });
    dump(env, [`wsr-${id}`]);
    run("dsh", ["plugin", "--profile", "web", "add", previous[id], "--ignore-scripts"], { env });
    dump(env, [`wsr-${id}`]);
    run("dsh", ["plugin", "--profile", "web", "remove", `dsh-wsr-${id}`], { env });
    const removed = run("dsh", ["--profile", "web", "--dump-config"], { env });
    if (new RegExp(`\\bid:\\s*['\"]?wsr-${id}['\"]?\\s*$`, "mu").test(removed)) throw new Error(`LIFECYCLE_REMOVE_FAILED: ${id}`);
    reports.push({ id, add: "PASS", upgrade: "PASS", rollback: "PASS", remove: "PASS" });
  }

  const home = join(temporary, "home-suite");
  const env = { ...process.env, DSH_HOME: home };
  run("dsh", ["plugin", "--profile", "web", "add", ownerAsset, current.execution, current.studio, "--ignore-scripts"], { env });
  await setSuitePolicy(home, { execution: current.execution, studio: current.studio }, { execution: "0.2.6", studio: "0.1.2" });
  run("dsh", ["plugin", "--profile", "web", "add", current.suite, "--ignore-scripts"], { env });
  await setLayers(home, suiteOnlyLayers);
  dump(env, ["wsr-execution", "wsr-studio"]);
  run("dsh", ["plugin", "--profile", "web", "add", current.suite, "--ignore-scripts"], { env });
  await setLayers(home, reconcileSuiteLayers);
  dump(env, ["wsr-execution", "wsr-studio"]);
  run("dsh", ["plugin", "--profile", "web", "remove", "dsh-wsr"], { env });
  await setLayers(home, (layers) => [...new Set([...layers.filter((name) => name !== "dsh-wsr-studio"), "dsh-wsr-execution"])]);
  dump(env, ["wsr-execution"]);
  reports.push({ id: "suite", singleToSuite: "PASS", reconcile: "PASS", suiteToSingle: "PASS", duplicateUi: "NONE" });
  process.stdout.write(`${JSON.stringify({ dsh: "0.1.1-rc.2", reports }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
