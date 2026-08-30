#!/usr/bin/env node
import { validateRepository } from "./lib/foundation-policy.mjs";

try {
  const report = await validateRepository(new URL("../", import.meta.url).pathname);
  process.stdout.write(`verified release set ${report.version} with ${report.packages.length} independently versioned bundles for DSH ${report.dshVersion}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
