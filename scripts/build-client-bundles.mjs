#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const bundles = Object.freeze([
  Object.freeze({
    id: "dsh-wsr-execution",
    entry: "packages/execution/src/client/browser-entry.js",
    output: "packages/execution/lib/client.js",
    external: [
      "react",
      "@deepseek-ai/dsh-client-ui-primitives",
      "@deepseek-ai/dsh-client-ui-workspace",
    ],
  }),
  Object.freeze({
    id: "dsh-wsr-studio",
    entry: "packages/studio/src/client/browser-entry.js",
    output: "packages/studio/lib/client.js",
    external: ["react"],
  }),
]);

for (const bundle of bundles) {
  const result = await build({
    absWorkingDir: root,
    bundle: true,
    entryPoints: [bundle.entry],
    external: bundle.external,
    format: "cjs",
    legalComments: "none",
    minify: false,
    platform: "browser",
    target: "es2022",
    write: false,
  });
  if (result.outputFiles.length !== 1) throw new Error(`CLIENT_BUNDLE_OUTPUT_INVALID: ${bundle.id}`);
  const body = result.outputFiles[0].text;
  const output = resolve(root, bundle.output);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(bundle.id)},\n  factory: (require) => {\n    const module = { exports: {} };\n    const exports = module.exports;\n${body}\n    return module.exports;\n  },\n});\n`);
}

