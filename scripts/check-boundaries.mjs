#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { validateDependencyGraph, validateRepository } from "./lib/foundation-policy.mjs";

try {
  const root = new URL("../", import.meta.url).pathname;
  await validateRepository(root);
  if (process.argv.length > 2) {
    const manifests = await Promise.all(process.argv.slice(2).map(async (path) => JSON.parse(await readFile(resolve(path), "utf8"))));
    validateDependencyGraph(manifests);
  }
  process.stdout.write("boundary check passed\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
