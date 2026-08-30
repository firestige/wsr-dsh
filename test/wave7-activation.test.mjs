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
      "@deepseek-ai/dsh-client-ui-sidebar",
      "@deepseek-ai/dsh-client-ui-primitives",
    ],
    platform: "web",
  });
  const ownerAsset = "https://github.com/firestige/wsr-execution/releases/download/0.2.0/wsr-execution-0.2.0.tgz";
  assert.equal(execution.dependencies?.["wsr-execution"], undefined);
  assert.equal(execution.peerDependencies["wsr-execution"], "^0.2.0");
  assert.deepEqual(execution.wsr.ownerAsset, {
    url: ownerAsset,
    sha256: "4f7879edcd55018954aaf0cd226afb75428b04a90c588a654425d4a1afe52309",
  });
  const rootManifest = await json("package.json");
  assert.equal(rootManifest.devDependencies["wsr-execution"], ownerAsset);
  assert.equal(execution.dependencies["@deepseek-ai/dsh-client-ui-workspace"], "0.1.1-rc.2");
  assert.equal(execution.wsr.ownerRevision, "5d03924df88e1afda3b7ffb5ecf182482cc8d1d5");

  const lock = await json("package-lock.json");
  const owner = lock.packages["node_modules/wsr-execution"];
  assert.equal(owner.version, "0.2.0");
  assert.equal(owner.resolved, ownerAsset);
  assert.equal(owner.integrity, "sha512-iqI6cWmA+fo5kM/62OY1c0Y5BaNoJBVATouh5rV0yJzQDq7ZtCM5XMmiWDXynADcNfuMvsEY/K2jfZaJ0f9H9Q==");

  const compatibility = await json("config/dsh-compatibility.json");
  assert.deepEqual(compatibility.executionOwner, {
    package: "wsr-execution",
    version: "0.2.0",
    release: "0.2.0",
    assetSha256: "4f7879edcd55018954aaf0cd226afb75428b04a90c588a654425d4a1afe52309",
    revision: "5d03924df88e1afda3b7ffb5ecf182482cc8d1d5",
    projection: "execution.delivery-control-plane@1.0.0",
  });

  const cleanQualifier = await readFile(join(root, "scripts/qualify-clean-profile.mjs"), "utf8");
  assert.match(cleanQualifier, /const ownerAsset = "https:\/\/github\.com\/firestige\/wsr-execution\/releases\/download\/0\.2\.0\/wsr-execution-0\.2\.0\.tgz"/u);
  assert.match(cleanQualifier, /ownerRequired: true,[\s\S]*id: "execution"/u);
  assert.match(cleanQualifier, /ownerRequired: true,[\s\S]*id: "suite"/u);
});

test("the real Harness qualification boots the v2 runner with repository Role Provider bindings", async () => {
  const source = await readFile(join(root, "scripts/qualify-real-harness.mjs"), "utf8");
  assert.match(source, /schemaVersion: "execution\.config@2\.0\.0"/u);
  assert.match(source, /implementationKey: "runner\.v2"/u);
  assert.match(source, /\.wsr", "role-provider-bindings\.json"/u);
  assert.match(source, /"role\.greeter"[\s\S]*provider\.copilot[\s\S]*"role\.reviewer"[\s\S]*provider\.codex/u);
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
    const React = {};
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
  assert.doesNotMatch(suite, /wsr-suite|sidebar|client/u);
});
