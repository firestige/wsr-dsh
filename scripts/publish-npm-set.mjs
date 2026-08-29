#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ORDER = Object.freeze(["dsh-wsr-execution", "dsh-wsr-studio", "dsh-wsr"]);

export async function planNpmPublication(artifacts, lookup) {
  const byName = new Map(artifacts.map((artifact) => [artifact.package, artifact]));
  if (byName.size !== ORDER.length || ORDER.some((name) => !byName.has(name))) throw new Error("NPM_PUBLICATION_SET_INVALID");
  const plan = [];
  for (const name of ORDER) {
    const artifact = byName.get(name);
    const published = await lookup(name, artifact.version);
    if (published !== null && published.sha256 !== artifact.sha256) {
      throw new Error(`NPM_VERSION_DIGEST_COLLISION: ${name}@${artifact.version}`);
    }
    plan.push(Object.freeze({ ...artifact, action: published === null ? "publish" : "skip" }));
  }
  return Object.freeze(plan);
}

async function registryLookup(name, version) {
  const answer = spawnSync("npm", ["view", `${name}@${version}`, "dist.tarball", "--json"], { encoding: "utf8" });
  if (answer.status !== 0) {
    if (/E404|not found/iu.test(`${answer.stdout}\n${answer.stderr}`)) return null;
    throw new Error(`NPM_LOOKUP_FAILED: ${name}@${version}: ${answer.stderr || answer.stdout}`);
  }
  const url = JSON.parse(answer.stdout);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NPM_TARBALL_FETCH_FAILED: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return { sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}` };
}

async function main() {
  const directory = resolve(process.argv[2] ?? "artifacts/candidate");
  const metadata = JSON.parse(await readFile(resolve(directory, "release-metadata.json"), "utf8"));
  const plan = await planNpmPublication(metadata.packages, registryLookup);
  for (const artifact of plan) {
    if (artifact.action === "skip") continue;
    const file = resolve(directory, artifact.file);
    if (basename(file) !== artifact.file) throw new Error(`NPM_ARTIFACT_PATH_INVALID: ${artifact.file}`);
    const answer = spawnSync("npm", ["publish", file, "--access", "public", "--provenance"], { stdio: "inherit" });
    if (answer.status !== 0) throw new Error(`NPM_PUBLISH_FAILED: ${artifact.package}`);
  }
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
