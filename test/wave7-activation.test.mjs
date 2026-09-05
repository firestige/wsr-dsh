import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const json = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));

test("Execution and Studio activate one Host and one generated browser module each", async () => {
  const execution = await json("packages/execution/package.json");
  const studio = await json("packages/studio/package.json");
  assert.equal(execution.wsr.foundationOnly, false);
  assert.equal(studio.wsr.foundationOnly, false);
  assert.equal(execution.exports["./client"], "./lib/client.js");
  assert.equal(studio.exports["./client"], "./lib/client.js");
  assert.deepEqual(execution.dsh.client, {
    inject: [
      "@deepseek-ai/dsh-client-connection",
      "@deepseek-ai/dsh-client-runtime",
      "@deepseek-ai/dsh-client-ui-conversation",
      "@deepseek-ai/dsh-client-ui-primitives",
    ],
    platform: "web",
  });
  assert.deepEqual(studio.dsh.client, {
    inject: [
      "@deepseek-ai/dsh-client-connection",
      "@deepseek-ai/dsh-client-ui-conversation",
      "@deepseek-ai/dsh-client-ui-primitives",
    ],
    platform: "web",
  });
  const ownerAsset = "https://github.com/firestige/wsr-execution/releases/download/0.2.6/wsr-execution-0.2.6.tgz";
  assert.equal(execution.dependencies?.["wsr-execution"], undefined);
  assert.equal(execution.peerDependencies["wsr-execution"], "^0.2.0");
  assert.deepEqual(execution.wsr.ownerAsset, {
    url: ownerAsset,
    sha256: "8aee92d34018a9e48ec52630faf9774f02e563b846d910a77e8adab165eb468e",
  });
  const rootManifest = await json("package.json");
  assert.equal(rootManifest.devDependencies["wsr-execution"], ownerAsset);
  assert.equal(execution.dependencies["@deepseek-ai/dsh-client-ui-workspace"], "0.1.1-rc.2");
  assert.equal(execution.wsr.ownerRevision, "0e8d937570de451f32764a99e9f6c5dfdb55474f");

  const lock = await json("package-lock.json");
  const owner = lock.packages["node_modules/wsr-execution"];
  assert.equal(owner.version, "0.2.6");
  assert.equal(owner.resolved, ownerAsset);
  assert.equal(owner.integrity, "sha512-XYU+V4ZKRF7CACm+PcvHQFbOJAoM6SgFDpR6DAEv10wl8xKNbmpYvd0hJeegZdO+beyzDZHj37D98Fsm74HSaQ==");

  const compatibility = await json("config/dsh-compatibility.json");
  assert.deepEqual(compatibility.executionOwner, {
    schemaVersion: "execution.owner-release@1.0.0",
    package: "wsr-execution",
    repository: "firestige/wsr-execution",
    version: "0.2.6",
    release: "0.2.6",
    coordinate: ownerAsset,
    assetSha256: "8aee92d34018a9e48ec52630faf9774f02e563b846d910a77e8adab165eb468e",
    revision: "0e8d937570de451f32764a99e9f6c5dfdb55474f",
    qualificationCoordinate: "https://github.com/firestige/wsr-execution/releases/download/0.2.6/release-qualification.json",
    projection: "execution.delivery-control-plane@1.0.0",
  });

  const cleanQualifier = await readFile(join(root, "scripts/qualify-clean-profile.mjs"), "utf8");
  assert.match(cleanQualifier, /resolveQualificationExecutionAsset/u);
  const qualificationAsset = await readFile(join(root, "scripts/lib/qualification-execution-asset.mjs"), "utf8");
  assert.match(qualificationAsset, /compatibility\.executionOwner\.coordinate/u);
  assert.doesNotMatch(cleanQualifier, /releases\/download\/0\.2\.1\/wsr-execution-0\.2\.1\.tgz/u);
  assert.match(cleanQualifier, /ownerRequired: true,[\s\S]*id: "execution"/u);
  assert.match(cleanQualifier, /ownerRequired: true,[\s\S]*id: "suite"/u);
});

test("the real Harness qualification boots the v2 runner with repository Role Provider bindings", async () => {
  const source = await readFile(join(root, "scripts/qualify-real-harness.mjs"), "utf8");
  assert.match(source, /schemaVersion: "execution\.config@2\.0\.0"/u);
  assert.match(source, /implementationKey: "runner\.v2"/u);
  assert.match(source, /\.wsr", "role-provider-bindings\.json"/u);
  assert.match(source, /"role\.greeter"[\s\S]*provider\.copilot[\s\S]*"role\.reviewer"[\s\S]*provider\.codex/u);
  assert.match(source, /basename\(path\)\.startsWith\("dsh-wsr-"\)/u);
  assert.doesNotMatch(source, /dsh-wsr-0\.2\.1\.tgz/u);
  assert.match(source, /summary[^\n]*Technical details/u);
});

test("the real Harness qualifies the semantic trace DataZoom contract", async () => {
  const source = await readFile(join(root, "scripts/qualify-real-harness.mjs"), "utf8");
  assert.match(source, /role="slider"\]\[aria-label="Trace minimap zoom window"\]/u);
  assert.match(source, /trace-waterfall-minimap-overview/u);
  assert.match(source, /trace-waterfall-data-zoom-window/u);
  assert.match(source, /trace-waterfall-data-zoom-handle-left/u);
  assert.match(source, /trace-waterfall-data-zoom-handle-right/u);
  assert.match(source, /\.trace-minimap-ruler/u);
  assert.doesNotMatch(source, /\.trace-ruler i/u);
  assert.doesNotMatch(source, /input\[type="range"\]/u);
});

test("the real Harness qualifies the deterministic trace Tree canvas contract", async () => {
  const source = await readFile(join(root, "scripts/qualify-real-harness.mjs"), "utf8");
  assert.match(source, /canvas\[aria-label="Recorded span call tree graph"\]/u);
  assert.match(source, /\[aria-label="Tree minimap navigation"\]/u);
  assert.match(source, /parentEdgeCount/u);
  assert.match(source, /linkCount/u);
  assert.doesNotMatch(source, /svg\[aria-label="Recorded span call tree graph"\]/u);
  assert.doesNotMatch(source, /\[aria-label="Semantic camera map"\]/u);
});

test("the real Harness qualifies Statistics with the shared semantic typography scale", async () => {
  const source = await readFile(join(root, "scripts/qualify-real-harness.mjs"), "utf8");
  assert.match(source, /\["overline", "h2", "subtitle1", "body1", "body2", "caption"\]/u);
  assert.doesNotMatch(source, /typography\.includes\("sectionTitle"\)/u);
  assert.doesNotMatch(source, /typography\.includes\("value"\)/u);
});

test("generated clients use one module identity and no private source or direct downstream transport", async () => {
  const execution = await readFile(join(root, "packages/execution/lib/client.js"), "utf8");
  const studio = await readFile(join(root, "packages/studio/lib/client.js"), "utf8");
  assert.match(execution, /id: "dsh-wsr-execution"/u);
  assert.match(studio, /id: "dsh-wsr-studio"/u);
  assert.doesNotMatch(execution, /execution-system\/src|\/wsr list/u);
  assert.doesNotMatch(studio, /EVIDENCE_UPSTREAM|EVOLUTION_UPSTREAM|fetch\(["']https?:/u);
  assert.doesNotMatch(`${execution}\n${studio}`, /\beval\s*\(|new Function|document\.write/u);

  for (const [source, expected] of [[execution, "dsh-wsr-execution"], [studio, "dsh-wsr-studio"]]) {
    let definition;
    vm.runInNewContext(source, {
      TextDecoder, TextEncoder, URL, URLSearchParams,
      window: { __ModuleLoader__: { load(value) { definition = value; } } },
    });
    assert.equal(definition.id, expected);
    const React = { memo(component) { return component; } };
    const loaded = definition.factory((name) => {
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return { jsx() {}, jsxs() {} };
      if (name === "@deepseek-ai/dsh-client-runtime/client") return { defineStore() {} };
      if (name === "@deepseek-ai/dsh-client-ui-primitives") return {
        DisclosureRow() {}, MessageText() {}, StateDot() {},
      };
      if (name === "@deepseek-ai/dsh-client-ui-workspace") return { apply() {}, inject: [] };
      throw new Error(`unexpected browser dependency ${name}`);
    });
    assert.equal(typeof loaded.apply, "function");
    assert.ok(Array.isArray(loaded.inject));
  }
});

test("Cordis patches carry real required configuration without adding suite UI", async () => {
  const execution = await readFile(join(root, "packages/execution/cordis.patch.yml"), "utf8");
  const studio = await readFile(join(root, "packages/studio/cordis.patch.yml"), "utf8");
  const suite = await readFile(join(root, "packages/suite/cordis.patch.yml"), "utf8");
  assert.match(execution, /configFile: \/__REQUIRED__\/execution-config\.yaml/u);
  assert.match(execution, /id: ui-workspace[\s\S]*name: ['"]@deepseek-ai\/dsh-client-ui-workspace['"][\s\S]*disabled: true/u);
  assert.match(execution, /bindingFile: \/__REQUIRED__\/dsh-intake-bindings\.json/u);
  assert.match(studio, /hostConfigFile: \/__REQUIRED__\/wsr-loopback-host\.json/u);
  assert.doesNotMatch(suite, /wsr-suite|sidebar/u);
  assert.match(suite, /id: ui-workspace[\s\S]*disabled: true/u);
});
