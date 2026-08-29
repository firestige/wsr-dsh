#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createProvenanceStatement } from "./lib/foundation-policy.mjs";

try {
  const directory = resolve(process.argv[2] ?? "artifacts/candidate");
  const recorded = JSON.parse(await readFile(resolve(directory, "provenance.json"), "utf8"));
  const rebuilt = await createProvenanceStatement({
    artifacts: recorded.subjects.map(({ name }) => resolve(directory, name)),
    commit: recorded.commit,
    version: recorded.version,
  });
  if (JSON.stringify(recorded) !== JSON.stringify(rebuilt)) throw new Error("PROVENANCE_MISMATCH");
  process.stdout.write(`verified ${rebuilt.subjects.length} provenance subjects\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
