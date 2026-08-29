#!/usr/bin/env node
import { validateRepository } from "./lib/foundation-policy.mjs";

try {
  const report = await validateRepository(new URL("../", import.meta.url).pathname);
  process.stdout.write(`verified ${report.packages.length} bundles at ${report.version} for DSH ${report.dshVersion}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
