#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertPromotionEligible } from "./lib/release-policy.mjs";

const directory = resolve(process.argv[2] ?? "artifacts/candidate");
try {
  const metadataBytes = await readFile(resolve(directory, "release-metadata.json"));
  const metadata = JSON.parse(metadataBytes);
  const qualification = JSON.parse(await readFile(resolve(directory, "release-qualification.json"), "utf8"));
  for (const artifact of metadata.packages) {
    const actual = `sha256:${createHash("sha256").update(await readFile(resolve(directory, artifact.file))).digest("hex")}`;
    if (actual !== artifact.sha256) throw new Error(`RELEASE_ARTIFACT_DIGEST_MISMATCH: ${artifact.file}`);
  }
  assertPromotionEligible({ finalTag: metadata.packageVersion, candidateTag: metadata.candidateTag, commit: metadata.commit,
    metadataSha256: `sha256:${createHash("sha256").update(metadataBytes).digest("hex")}`, qualification });
  process.stdout.write(`verified ${metadata.packages.length} qualified release artifacts\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
