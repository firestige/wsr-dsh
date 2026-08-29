#!/usr/bin/env node
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { createProvenanceStatement, validateReleaseRequest, validateRepository } from "./lib/foundation-policy.mjs";
import { packWorkspaces } from "./lib/package-artifacts.mjs";

const root = new URL("../", import.meta.url).pathname;
const output = resolve(process.argv[2] ?? resolve(root, "artifacts/candidate"));

function git(...args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout.trim();
}

try {
  const repository = await validateRepository(root);
  const commit = git("rev-parse", "HEAD");
  const clean = git("status", "--porcelain").length === 0;
  validateReleaseRequest({
    channel: process.env.WSR_RELEASE_CHANNEL,
    clean,
    commit,
    version: repository.version,
  });
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const archives = await packWorkspaces({ root, output });
  const provenance = await createProvenanceStatement({ artifacts: archives, commit, version: repository.version });
  await writeFile(resolve(output, "provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`, { flag: "wx" });
  const compatibility = {
    schemaVersion: "wsr.dsh.release-compatibility@1.0.0",
    version: repository.version,
    dsh: repository.dshVersion,
    packages: repository.packages.map(({ name }) => name),
    promotion: "disabled-until-issue-122",
  };
  await writeFile(resolve(output, "compatibility.json"), `${JSON.stringify(compatibility, null, 2)}\n`, { flag: "wx" });
  process.stdout.write(`candidate skeleton written to ${output}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
