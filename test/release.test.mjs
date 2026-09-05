import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { planNpmPublication } from "../scripts/publish-npm-set.mjs";
import { assertCandidateTag, assertPromotionEligible } from "../scripts/lib/release-policy.mjs";

const root = path.resolve(import.meta.dirname, "..");
const packages = Object.freeze(["dsh-wsr-execution", "dsh-wsr-studio", "dsh-wsr"]);

test("release policy accepts only an exact qualified candidate for the stable release-set version", () => {
  assert.doesNotThrow(() => assertCandidateTag("0.2.11-rc.1", "0.2.11"));
  assert.throws(() => assertCandidateTag("latest", "0.2.11"), /PRERELEASE_TAG_REQUIRED/u);
  assert.doesNotThrow(() => assertPromotionEligible({
    finalTag: "0.2.11",
    candidateTag: "0.2.11-rc.1",
    commit: "a".repeat(40),
    metadataSha256: `sha256:${"b".repeat(64)}`,
    qualification: {
      schemaVersion: "wsr.dsh.release-qualification@1.0.0",
      packageVersion: "0.2.11",
      candidateTag: "0.2.11-rc.1",
      commit: "a".repeat(40),
      artifactMetadataSha256: `sha256:${"b".repeat(64)}`,
      gates: {
        cleanProfile: "PASS",
        lifecycle: "PASS",
        realHarness: "PASS",
        loopbackOutage: "PASS",
        providerRouting: "PASS",
        remoteArtifacts: "PASS",
      },
    },
  }));
});

test("npm publication is ordered components before suite and fails on immutable collisions", async () => {
  const versions = { "dsh-wsr-execution": "0.2.1", "dsh-wsr-studio": "0.1.1", "dsh-wsr": "0.2.1" };
  const artifacts = packages.map((name) => ({
    package: name,
    version: versions[name],
    file: `${name}-${versions[name]}.tgz`,
    sha256: `sha256:${name.padEnd(64, "0").slice(0, 64)}`,
  }));
  const plan = await planNpmPublication(artifacts, async () => null);
  assert.deepEqual(plan.map(({ package: name, action }) => [name, action]), [
    ["dsh-wsr-execution", "publish"],
    ["dsh-wsr-studio", "publish"],
    ["dsh-wsr", "publish"],
  ]);
  await assert.rejects(
    planNpmPublication(artifacts, async () => ({ sha256: `sha256:${"f".repeat(64)}` })),
    /NPM_VERSION_DIGEST_COLLISION/u,
  );
});

test("promotion rejects a candidate whose qualified package bytes were replaced", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wsr-dsh-promotion-swap-"));
  try {
    const artifact = "dsh-wsr-execution-0.2.9.tgz";
    await writeFile(path.join(directory, artifact), "swapped-package-bytes\n");
    const metadata = {
      schemaVersion: "wsr.dsh.release-metadata@1.0.0",
      repository: "firestige/wsr-dsh",
      commit: "a".repeat(40),
      candidateTag: "0.2.10-rc.1",
      packageVersion: "0.2.10",
      packages: [{
        package: "dsh-wsr-execution",
        version: "0.2.9",
        file: artifact,
        sha256: `sha256:${createHash("sha256").update("qualified-package-bytes\n").digest("hex")}`,
      }],
      supportFiles: [],
    };
    const metadataBytes = `${JSON.stringify(metadata, null, 2)}\n`;
    await writeFile(path.join(directory, "release-metadata.json"), metadataBytes);
    await writeFile(path.join(directory, "release-qualification.json"), `${JSON.stringify({
      schemaVersion: "wsr.dsh.release-qualification@1.0.0",
      packageVersion: metadata.packageVersion,
      candidateTag: metadata.candidateTag,
      commit: metadata.commit,
      artifactMetadataSha256: `sha256:${createHash("sha256").update(metadataBytes).digest("hex")}`,
      gates: {
        cleanProfile: "PASS",
        lifecycle: "PASS",
        realHarness: "PASS",
        loopbackOutage: "PASS",
        providerRouting: "PASS",
        remoteArtifacts: "PASS",
      },
    }, null, 2)}\n`);

    const result = spawnSync(process.execPath, [path.join(root, "scripts/verify-release-set.mjs"), directory], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /RELEASE_ARTIFACT_DIGEST_MISMATCH/u);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("release workflows reuse candidate qualification, npm OIDC, and the scoped release App", async () => {
  const candidate = await readFile(path.join(root, ".github/workflows/release-candidate.yml"), "utf8");
  const promote = await readFile(path.join(root, ".github/workflows/release-promote.yml"), "utf8");
  assert.match(candidate, /push:\s*\n\s*branches:\s*\n\s*- release\/next/u);
  assert.doesNotMatch(candidate, /workflow_dispatch:|workflow_call:/u);
  assert.match(candidate, /release\/request\.json/u);
  assert.match(candidate, /release-qualification\.json/u);
  assert.match(candidate, /qualify:clean-profile/u);
  assert.match(candidate, /qualify:real-harness/u);
  assert.match(candidate, /release:owner:verify/u);
  assert.doesNotMatch(candidate, /wsr-execution-0\.2\.2\.tgz|d07eb0aaa4e0498/u);
  assert.match(promote, /id-token: write/u);
  assert.match(promote, /publish-npm-set\.mjs/u);
  for (const workflow of [candidate, promote]) {
    assert.match(workflow, /actions\/create-github-app-token@v3/u);
    assert.match(workflow, /client-id: \$\{\{ vars\.WSR_RELEASE_CLIENT_ID \}\}/u);
    assert.doesNotMatch(workflow, /app-id:/u);
  }
  const allWorkflows = await Promise.all([
    "release-candidate.yml", "release-promote.yml", "verify.yml",
  ].map((name) => readFile(path.join(root, ".github/workflows", name), "utf8")));
  const actions = allWorkflows.join("\n");
  assert.doesNotMatch(actions, /actions\/(?:checkout|setup-node|upload-artifact)@v4\b/u);
  assert.match(promote, /repositories: wsr-dsh/u);
  assert.doesNotMatch(promote, /Publishing is not enabled yet|STABLE_PROMOTION_DISABLED/u);
});

test("only changed bundles bump and the suite declares compatible component ranges", async () => {
  const manifests = await Promise.all([
    "package.json",
    "packages/execution/package.json",
    "packages/studio/package.json",
    "packages/suite/package.json",
  ].map(async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"))));
  assert.deepEqual(manifests.map(({ version }) => version), ["0.2.11", "0.2.9", "0.1.3", "0.2.10"]);
  assert.deepEqual(manifests[3].dependencies, {
    "dsh-wsr-execution": "^0.2.9",
    "dsh-wsr-studio": "^0.1.3",
  });
});

test("marketplace support metadata covers every package and the shared security lifecycle", async () => {
  const marketplace = JSON.parse(await readFile(path.join(root, "marketplace/packages.json"), "utf8"));
  assert.equal(marketplace.schemaVersion, "wsr.dsh.marketplace@1.0.0");
  assert.deepEqual(marketplace.packages.map(({ name }) => name), packages);
  assert.deepEqual(Object.fromEntries(marketplace.packages.map(({ name, version }) => [name, version])), {
    "dsh-wsr-execution": "0.2.9", "dsh-wsr-studio": "0.1.3", "dsh-wsr": "0.2.10",
  });
  assert.ok(marketplace.packages.every(({ icon, license, security }) => icon === "./icon.svg"
    && license === "Apache-2.0" && security === "../SECURITY.md"));
  await Promise.all(["marketplace/icon.svg", "CHANGELOG.md", "SECURITY.md", "docs/release-lifecycle.md"]
    .map((file) => readFile(path.join(root, file), "utf8")));
});
