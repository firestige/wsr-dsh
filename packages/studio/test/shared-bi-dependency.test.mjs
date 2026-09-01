import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../../..");
const expectedIntegrity =
  "sha512-jHK1jASNAw0WqNMrzgOK9KWZls/DiA7q8J2shE96/Gatb2mTw+lzG7UY+8rWuh1PWfyTFuvqnS3u/hVfyCrOBw==";

test("Studio locks the immutable shared BI registry candidate without source-path escape hatches", async () => {
  const studio = JSON.parse(
    await readFile(resolve(root, "packages/studio/package.json"), "utf8"),
  );
  const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
  const installed = lock.packages["node_modules/wsr-ui-core"];

  assert.equal(studio.dependencies["wsr-ui-core"], "0.1.0-rc.0");
  assert.equal(installed.version, "0.1.0-rc.0");
  assert.equal(
    installed.resolved,
    "https://registry.npmjs.org/wsr-ui-core/-/wsr-ui-core-0.1.0-rc.0.tgz",
  );
  assert.equal(installed.integrity, expectedIntegrity);
  assert.doesNotMatch(JSON.stringify(studio.dependencies), /file:|workspace:|wsr-ui\/packages\/bi\/src/u);
});

test("the production browser entry consumes only the formal package exports", async () => {
  const source = await readFile(
    resolve(root, "packages/studio/src/client/browser-entry.js"),
    "utf8",
  );
  assert.match(source, /from "wsr-ui-core"/u);
  assert.match(source, /from "wsr-ui-core\/styles\.css"/u);
  assert.doesNotMatch(source, /wsr-ui\/packages\/bi\/src|\.\.\/\.\.\/\.\.\/wsr-ui/u);
});

test("the built Studio bundle embeds the qualified package but keeps Host React external", async () => {
  const bundle = await readFile(
    resolve(root, "packages/studio/lib/client.js"),
    "utf8",
  );
  assert.match(bundle, /node_modules\/wsr-ui-core\/dist\/index\.js/u);
  assert.match(bundle, /require\("react"\)/u);
  assert.match(bundle, /require\("react\/jsx-runtime"\)/u);
  assert.match(bundle, /data-wsr-bi-styles/u);
  assert.doesNotMatch(bundle, /react_production_min|react\.production\.min|__SECRET_INTERNALS_DO_NOT_USE/u);
  assert.doesNotMatch(bundle, /wsr-ui\/packages\/bi\/src|@wsr\/bi|file:|workspace:/u);
  assert.doesNotMatch(bundle, /rendererSelector|selectRenderer|canvasRenderer/iu);
});
