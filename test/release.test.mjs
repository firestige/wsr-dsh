import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { planNpmPublication } from "../scripts/publish-npm-set.mjs";
import { assertCandidateTag, assertPromotionEligible } from "../scripts/lib/release-policy.mjs";

const root = path.resolve(import.meta.dirname, "..");
const packages = Object.freeze(["dsh-wsr-execution", "dsh-wsr-studio", "dsh-wsr"]);

test("release policy accepts only an exact qualified candidate for the stable package version", () => {
  assert.doesNotThrow(() => assertCandidateTag("0.1.1-rc.1", "0.1.1"));
  assert.throws(() => assertCandidateTag("latest", "0.1.1"), /PRERELEASE_TAG_REQUIRED/u);
  assert.doesNotThrow(() => assertPromotionEligible({
    finalTag: "0.1.1",
    candidateTag: "0.1.1-rc.1",
    commit: "a".repeat(40),
    metadataSha256: `sha256:${"b".repeat(64)}`,
    qualification: {
      schemaVersion: "wsr.dsh.release-qualification@1.0.0",
      packageVersion: "0.1.1",
      candidateTag: "0.1.1-rc.1",
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
  const artifacts = packages.map((name) => ({
    package: name,
    version: "0.1.1",
    file: `${name}-0.1.1.tgz`,
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

test("release workflows reuse candidate qualification, npm OIDC, and the scoped release App", async () => {
  const candidate = await readFile(path.join(root, ".github/workflows/release-candidate.yml"), "utf8");
  const promote = await readFile(path.join(root, ".github/workflows/release-promote.yml"), "utf8");
  assert.match(candidate, /workflow_dispatch:/u);
  assert.match(candidate, /release-qualification\.json/u);
  assert.match(candidate, /qualify:clean-profile/u);
  assert.match(candidate, /qualify:real-harness/u);
  assert.match(promote, /id-token: write/u);
  assert.match(promote, /publish-npm-set\.mjs/u);
  assert.match(promote, /actions\/create-github-app-token@v2/u);
  assert.match(promote, /repositories: wsr-dsh/u);
  assert.doesNotMatch(promote, /Publishing is not enabled yet|STABLE_PROMOTION_DISABLED/u);
});

test("all three manifests use one stable version and the suite pins both components exactly", async () => {
  const manifests = await Promise.all([
    "package.json",
    "packages/execution/package.json",
    "packages/studio/package.json",
    "packages/suite/package.json",
  ].map(async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"))));
  assert.deepEqual(manifests.map(({ version }) => version), ["0.1.1", "0.1.1", "0.1.1", "0.1.1"]);
  assert.deepEqual(manifests[3].dependencies, {
    "dsh-wsr-execution": "0.1.1",
    "dsh-wsr-studio": "0.1.1",
  });
});

test("marketplace support metadata covers every package and the shared security lifecycle", async () => {
  const marketplace = JSON.parse(await readFile(path.join(root, "marketplace/packages.json"), "utf8"));
  assert.equal(marketplace.schemaVersion, "wsr.dsh.marketplace@1.0.0");
  assert.deepEqual(marketplace.packages.map(({ name }) => name), packages);
  assert.ok(marketplace.packages.every(({ version, icon, license, security }) => version === "0.1.1"
    && icon === "./icon.svg" && license === "Apache-2.0" && security === "../SECURITY.md"));
  await Promise.all(["marketplace/icon.svg", "CHANGELOG.md", "SECURITY.md", "docs/release-lifecycle.md"]
    .map((file) => readFile(path.join(root, file), "utf8")));
});
