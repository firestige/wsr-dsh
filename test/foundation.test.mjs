import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  BoundaryViolation,
  createProvenanceStatement,
  validatePackInventory,
  validateDependencyGraph,
  validateRepository,
  validateReleaseRequest,
  validateSourceFile,
} from "../scripts/lib/foundation-policy.mjs";
import { assertCompositionDump, commandFailureDetail, localSuiteOverrideYaml, localSuiteOverrides, reconcileSuiteLayers, suiteOnlyLayers } from "../scripts/lib/clean-profile-policy.mjs";

const root = resolve(import.meta.dirname, "..");

test("the repository admits independently versioned compatible bundles", async () => {
  const report = await validateRepository(root);

  assert.deepEqual(report.packages.map(({ name }) => name), [
    "dsh-wsr-execution",
    "dsh-wsr-studio",
    "dsh-wsr",
  ]);
  assert.equal(report.version, "0.2.10");
  assert.deepEqual(report.packageVersions, {
    "dsh-wsr-execution": "0.2.9",
    "dsh-wsr-studio": "0.1.2",
    "dsh-wsr": "0.2.9",
  });
  assert.equal(report.dshVersion, "0.1.1-rc.2");
  assert.deepEqual(report.displayNames, {
    "dsh-wsr-execution": "WSR",
    "dsh-wsr-studio": "WSR Studio",
  });
});

test("the suite composes compatible Execution and Studio versions without an activation or UI identity", async () => {
  const suite = JSON.parse(await readFile(join(root, "packages/suite/package.json"), "utf8"));
  const patch = await readFile(join(root, "packages/suite/cordis.patch.yml"), "utf8");

  assert.deepEqual(suite.dependencies, {
    "dsh-wsr-execution": "^0.2.9",
    "dsh-wsr-studio": "^0.1.2",
  });
  assert.equal(suite.wsr.displayName, undefined);
  assert.equal(suite.main, undefined);
  assert.equal(suite.exports, undefined);
  assert.match(patch, /id: wsr-execution/u);
  assert.match(patch, /id: wsr-studio/u);
  assert.match(patch, /id: ui-workspace[\s\S]*disabled: true/u);
  assert.doesNotMatch(patch, /id: wsr-suite|name: ['"]?dsh-wsr['"]?$/mu);
});

test("source-relative imports cannot escape a package boundary", () => {
  assert.throws(
    () => validateSourceFile({
      packageRoot: "/repo/packages/execution",
      path: "/repo/packages/execution/src/adapter.js",
      source: 'import value from "../../../execution-system/src/private.js";',
    }),
    (error) => error instanceof BoundaryViolation && error.code === "SOURCE_RELATIVE_IMPORT",
  );
});

test("copied domain implementation is rejected from DSH adapter packages", () => {
  assert.throws(
    () => validateSourceFile({
      packageRoot: "/repo/packages/studio",
      path: "/repo/packages/studio/src/domain/evidence-store.js",
      source: "export class EvidenceStore {}",
    }),
    (error) => error instanceof BoundaryViolation && error.code === "COPIED_DOMAIN_IMPLEMENTATION",
  );
});

test("DSH-specific Delivery UI and Evidence gateway adapter paths remain available to Wave 7", () => {
  assert.doesNotThrow(() => validateSourceFile({
    packageRoot: "/repo/packages/execution",
    path: "/repo/packages/execution/src/client/delivery/index.js",
    source: "export const registerDeliveryInventory = () => undefined;",
  }));
  assert.doesNotThrow(() => validateSourceFile({
    packageRoot: "/repo/packages/studio",
    path: "/repo/packages/studio/src/host/evidence/index.js",
    source: "export const registerEvidenceGateway = () => undefined;",
  }));
});

test("domain owners cannot acquire a reverse dependency on WSR DSH packages", () => {
  assert.throws(
    () => validateDependencyGraph([
      { name: "wsr-execution", repositoryRole: "domain-owner", dependencies: { "dsh-wsr-execution": "1.0.0" } },
    ]),
    (error) => error instanceof BoundaryViolation && error.code === "REVERSE_DEPENDENCY",
  );
});

test("provenance binds sorted artifact digests to one repository revision", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "wsr-dsh-provenance-"));
  try {
    const execution = join(temporary, "dsh-wsr-execution-0.0.0-development.tgz");
    const studio = join(temporary, "dsh-wsr-studio-0.0.0-development.tgz");
    await writeFile(execution, "execution\n");
    await writeFile(studio, "studio\n");

    const statement = await createProvenanceStatement({
      artifacts: [studio, execution],
      commit: "199331516bf2a58cf0b09bca5a8d630ec8c5f028",
      version: "0.0.0-development",
    });

    assert.equal(statement.schemaVersion, "wsr.dsh.provenance@1.0.0");
    assert.deepEqual(statement.subjects.map(({ name }) => name), [
      "dsh-wsr-execution-0.0.0-development.tgz",
      "dsh-wsr-studio-0.0.0-development.tgz",
    ]);
    assert.ok(statement.subjects.every(({ sha256 }) => /^[0-9a-f]{64}$/u.test(sha256)));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("pack inventory requires license, notice, generated client and only declared adapter sources", () => {
  assert.doesNotThrow(() => validatePackInventory({
    name: "dsh-wsr-execution",
    files: [
      "package/LICENSE",
      "package/NOTICE.md",
      "package/README.md",
      "package/cordis.patch.yml",
      "package/lib/client.js",
      "package/package.json",
      "package/src/client/browser-entry.js",
      "package/src/index.js",
    ],
  }));
  assert.throws(
    () => validatePackInventory({
      name: "dsh-wsr-execution",
      files: ["package/package.json", "package/src/domain/delivery.js"],
    }),
    (error) => error instanceof BoundaryViolation && error.code === "PACK_INVENTORY",
  );
});

test("candidate construction permits only an exact clean candidate", () => {
  assert.doesNotThrow(() => validateReleaseRequest({
    channel: "candidate",
    clean: true,
    commit: "199331516bf2a58cf0b09bca5a8d630ec8c5f028",
    version: "0.1.1",
  }));
  assert.throws(
    () => validateReleaseRequest({
      channel: "candidate",
      clean: false,
      commit: "199331516bf2a58cf0b09bca5a8d630ec8c5f028",
      version: "0.1.1",
    }),
    (error) => error instanceof BoundaryViolation && error.code === "DIRTY_RELEASE",
  );
});

test("suite qualification removes direct component layers and keeps one suite layer", () => {
  assert.deepEqual(suiteOnlyLayers([
    "@deepseek-ai/dsh-base",
    "@deepseek-ai/dsh-web-app",
    "dsh-wsr-execution",
    "dsh-wsr-studio",
    "dsh-wsr",
  ]), [
    "@deepseek-ai/dsh-base",
    "@deepseek-ai/dsh-web-app",
    "dsh-wsr",
  ]);
});

test("suite reconcile collapses repeated add layers deterministically", () => {
  assert.deepEqual(reconcileSuiteLayers([
    "@deepseek-ai/dsh-base",
    "dsh-wsr-execution",
    "dsh-wsr-studio",
    "dsh-wsr",
    "dsh-wsr",
  ]), ["@deepseek-ai/dsh-base", "dsh-wsr"]);
});

test("composed config requires each expected activation exactly once", () => {
  assert.doesNotThrow(() => assertCompositionDump(
    "id: wsr-execution\nname: dsh-wsr-execution\nid: wsr-studio\nname: dsh-wsr-studio\n",
    ["wsr-execution", "wsr-studio"],
  ));
  assert.throws(
    () => assertCompositionDump("id: wsr-execution\nid: wsr-execution\n", ["wsr-execution"]),
    /CLEAN_PROFILE_ACTIVATION_COUNT/u,
  );
});

test("clean-profile command failures preserve package-manager stdout and stderr", () => {
  assert.equal(commandFailureDetail({ stdout: "resolution failed\n", stderr: "dsh failed\n" }), "resolution failed\ndsh failed");
});

test("local suite qualification resolves independently versioned dependencies only from supplied archives", () => {
  assert.deepEqual(localSuiteOverrides({
    execution: "/tmp/dsh-wsr-execution-0.2.9.tgz",
    studio: "/tmp/dsh-wsr-studio-0.1.2.tgz",
  }), {
    "dsh-wsr-execution@0.2.9": "file:/tmp/dsh-wsr-execution-0.2.9.tgz",
    "dsh-wsr-studio@0.1.2": "file:/tmp/dsh-wsr-studio-0.1.2.tgz",
  });
  assert.deepEqual(localSuiteOverrides({
    execution: "/tmp/dsh-wsr-execution.tgz",
    studio: "/tmp/dsh-wsr-studio.tgz",
  }, { execution: "0.2.1", studio: "0.1.1" }), {
    "dsh-wsr-execution@0.2.1": "file:/tmp/dsh-wsr-execution.tgz",
    "dsh-wsr-studio@0.1.1": "file:/tmp/dsh-wsr-studio.tgz",
  });
});

test("pnpm 11 local qualification overrides are rendered into workspace policy", () => {
  assert.equal(localSuiteOverrideYaml({
    "dsh-wsr-execution@0.2.1": "file:/tmp/execution.tgz",
    "dsh-wsr-studio@0.1.1": "file:/tmp/studio.tgz",
  }), 'overrides:\n  "dsh-wsr-execution@0.2.1": "file:/tmp/execution.tgz"\n  "dsh-wsr-studio@0.1.1": "file:/tmp/studio.tgz"\n');
});
