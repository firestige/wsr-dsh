import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";

const EXPECTED_PACKAGES = Object.freeze([
  Object.freeze({ path: "packages/execution", name: "dsh-wsr-execution", displayName: "WSR", role: "execution-adapter" }),
  Object.freeze({ path: "packages/studio", name: "dsh-wsr-studio", displayName: "WSR Studio", role: "studio-adapter" }),
  Object.freeze({ path: "packages/suite", name: "dsh-wsr", role: "exact-composition" }),
]);
const SOURCE_EXTENSION = /\.(?:[cm]?js|tsx?)$/u;
const IMPORT_SPECIFIER = /(?:\bimport\s*(?:[^'"()]*?\s+from\s*)?|\bexport\s+[^'"()]*?\s+from\s*|\bimport\s*\(|\brequire\s*\()\s*['"]([^'"]+)['"]/gu;

export class BoundaryViolation extends Error {
  constructor(code, detail) {
    super(`${code}: ${detail}`);
    this.name = "BoundaryViolation";
    this.code = code;
    this.detail = detail;
  }
}

function exactKeys(value, expected, code, subject) {
  const actual = Object.keys(value ?? {}).sort();
  if (actual.join("\0") !== [...expected].sort().join("\0")) {
    throw new BoundaryViolation(code, `${subject} keys are ${actual.join(", ")}`);
  }
}

function within(root, candidate) {
  const path = relative(resolve(root), resolve(candidate));
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

async function json(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (cause) {
    throw new BoundaryViolation("INVALID_JSON", `${path}: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

async function filesUnder(root) {
  const output = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "artifacts") continue;
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(path));
    else if (entry.isFile()) output.push(path);
  }
  return output.sort();
}

export function validateSourceFile({ packageRoot, path, source, policy = {} }) {
  const forbiddenSegments = policy.forbiddenDomainSegments ?? [
    "core", "domain", "runner", "workflow-domain",
  ];
  const sourceRelative = relative(resolve(packageRoot), resolve(path)).split(sep);
  if (sourceRelative.some((segment) => forbiddenSegments.includes(segment.toLowerCase()))) {
    throw new BoundaryViolation("COPIED_DOMAIN_IMPLEMENTATION", `${path} occupies a domain-owner path`);
  }

  for (const coordinate of policy.forbiddenSourceCoordinates ?? []) {
    if (source.includes(coordinate)) {
      throw new BoundaryViolation("OWNER_SOURCE_IMPORT", `${path} references ${coordinate}`);
    }
  }

  for (const match of source.matchAll(IMPORT_SPECIFIER)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const target = resolve(dirname(path), specifier);
    if (!within(packageRoot, target)) {
      throw new BoundaryViolation("SOURCE_RELATIVE_IMPORT", `${path} imports ${specifier}`);
    }
  }
}

export function validateDependencyGraph(manifests, domainOwnerRoles = [
  "domain-owner", "execution-owner", "evidence-owner", "evolution-owner", "contracts-owner", "workflow-package-owner",
]) {
  const dshPackages = new Set(EXPECTED_PACKAGES.map(({ name }) => name));
  for (const manifest of manifests) {
    if (!domainOwnerRoles.includes(manifest.repositoryRole)) continue;
    for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
      for (const dependency of Object.keys(manifest[field] ?? {})) {
        if (dshPackages.has(dependency)) {
          throw new BoundaryViolation("REVERSE_DEPENDENCY", `${manifest.name} ${field} includes ${dependency}`);
        }
      }
    }
  }
}

export function validatePackInventory({ name, files }) {
  const common = [
    "package/LICENSE",
    "package/NOTICE.md",
    "package/README.md",
    "package/cordis.patch.yml",
    "package/package.json",
  ];
  const actual = [...new Set(files)].sort();
  const required = name === "dsh-wsr-execution" || name === "dsh-wsr-studio"
    ? [...common, "package/lib/client.js", "package/src/index.js"]
    : name === "dsh-wsr" ? common : undefined;
  const allowed = name === "dsh-wsr-execution"
    ? /^(?:package\/(?:LICENSE|NOTICE\.md|README\.md|cordis\.patch\.yml|package\.json|lib\/client\.js|skills\/workflow-execution\/SKILL\.md|src\/(?:action-presentation|client|host|intake)\/[^/].*|src\/index\.js))$/u
    : name === "dsh-wsr-studio"
      ? /^(?:package\/(?:LICENSE|NOTICE\.md|README\.md|cordis\.patch\.yml|package\.json|lib\/client\.js|src\/(?:client|host)\/[^/].*|src\/index\.js))$/u
      : name === "dsh-wsr" ? /^(?:package\/(?:LICENSE|NOTICE\.md|README\.md|cordis\.patch\.yml|package\.json))$/u : undefined;
  const invalid = required === undefined || allowed === undefined
    || required.some((entry) => !actual.includes(entry))
    || actual.some((entry) => !allowed.test(entry) || /(?:^|\/)test(?:s)?\/|\.test\.[cm]?[jt]sx?$/u.test(entry));
  if (invalid) {
    throw new BoundaryViolation("PACK_INVENTORY", `${name}: ${actual.join(", ")}`);
  }
}

export function validateReleaseRequest({ channel, clean, commit, version }) {
  if (channel === "stable") throw new BoundaryViolation("STABLE_PROMOTION_DISABLED", "#122 has not qualified stable publication");
  if (channel !== "candidate") throw new BoundaryViolation("RELEASE_CHANNEL", String(channel));
  if (!clean) throw new BoundaryViolation("DIRTY_RELEASE", "candidate artifacts require a clean commit");
  if (!/^[0-9a-f]{40}$/u.test(commit)) throw new BoundaryViolation("PROVENANCE_COMMIT", String(commit));
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
    throw new BoundaryViolation("RELEASE_VERSION", String(version));
  }
}

function validatePackage(manifest, expected, version, dshVersion) {
  if (manifest.name !== expected.name) throw new BoundaryViolation("PACKAGE_IDENTITY", `${expected.path} is ${manifest.name}`);
  if (manifest.version !== version) throw new BoundaryViolation("VERSION_DRIFT", `${manifest.name} is ${manifest.version}, expected ${version}`);
  if (manifest.license !== "Apache-2.0") throw new BoundaryViolation("LICENSE_MISSING", `${manifest.name} is not Apache-2.0`);
  if (manifest.dsh?.bundle?.patch !== "./cordis.patch.yml") throw new BoundaryViolation("BUNDLE_PATCH_MISSING", expected.name);
  if (manifest.dsh?.compatibility?.dsh !== dshVersion) throw new BoundaryViolation("DSH_VERSION_DRIFT", expected.name);
  if (manifest.peerDependencies?.["@deepseek-ai/dsh"] !== dshVersion) throw new BoundaryViolation("DSH_VERSION_DRIFT", expected.name);
  if (manifest.wsr?.role !== expected.role || manifest.wsr?.foundationOnly !== false) {
    throw new BoundaryViolation("FOUNDATION_SCOPE", expected.name);
  }
  if (expected.displayName === undefined) {
    if (manifest.wsr?.displayName !== undefined || manifest.main !== undefined || manifest.exports !== undefined || manifest.dsh?.client !== undefined) {
      throw new BoundaryViolation("ACTIVATION_LEAKAGE", `${expected.name} must be composition-only`);
    }
  } else {
    if (manifest.wsr?.displayName !== expected.displayName) {
      throw new BoundaryViolation("DISPLAY_IDENTITY", `${expected.name} is ${manifest.wsr?.displayName ?? "missing"}`);
    }
    if (manifest.exports?.["./client"] !== "./lib/client.js" || manifest.dsh?.client?.platform !== "web") {
      throw new BoundaryViolation("CLIENT_ACTIVATION_MISSING", expected.name);
    }
  }
}

function patchRows(patch) {
  return [...patch.matchAll(/^\s*- id:\s*([^\s#]+)\s*$[\s\S]*?^\s+name:\s*['"]?([^'"\s#]+)['"]?\s*$/gmu)]
    .map((match) => Object.freeze({ id: match[1], name: match[2] }));
}

function validatePatch(name, patch) {
  const workspaceForkOverride = /^- id: ui-workspace\s*$\n\s+name: ['"]@deepseek-ai\/dsh-client-ui-workspace['"]\s*$\n\s+disabled: true\s*$/mu.test(patch);
  const rows = patchRows(patch).filter((row) => !(workspaceForkOverride && row.id === "ui-workspace"));
  const expected = name === "dsh-wsr-execution"
    ? [{ id: "wsr-execution", name: "dsh-wsr-execution" }]
    : name === "dsh-wsr-studio"
      ? [{ id: "wsr-studio", name: "dsh-wsr-studio" }]
      : [
          { id: "wsr-execution", name: "dsh-wsr-execution" },
          { id: "wsr-studio", name: "dsh-wsr-studio" },
        ];
  if (JSON.stringify(rows) !== JSON.stringify(expected)) {
    throw new BoundaryViolation("ACTIVATION_GRAPH", `${name} patch is ${JSON.stringify(rows)}`);
  }
  if ((name === "dsh-wsr-execution") !== workspaceForkOverride) {
    throw new BoundaryViolation("WORKSPACE_UI_FORK_ACTIVATION", name);
  }
}

export async function validateRepository(root) {
  const repositoryRoot = resolve(root);
  const rootManifest = await json(resolve(repositoryRoot, "package.json"));
  const policy = await json(resolve(repositoryRoot, "config/boundary-policy.json"));
  const compatibility = await json(resolve(repositoryRoot, "config/dsh-compatibility.json"));
  const version = rootManifest.version;
  const dshVersion = compatibility.dsh;

  if (rootManifest.private !== true) throw new BoundaryViolation("ROOT_PUBLISHABLE", "root package must remain private");
  if (JSON.stringify(rootManifest.workspaces) !== JSON.stringify(policy.workspacePackages)) {
    throw new BoundaryViolation("WORKSPACE_DRIFT", "root workspaces differ from the boundary policy");
  }
  if (compatibility.workspaceUiFork?.strategy !== "fixed-version-fork"
    || compatibility.workspaceUiFork?.sourceVersion !== dshVersion
    || compatibility.workspaceUiFork?.activation !== "active-in-wave7"
    || compatibility.executionOwner?.revision !== "0feb3333afd88e00444f80a7a0d135d2f93582db"
    || compatibility.executionOwner?.projection !== "execution.delivery-control-plane@1.0.0") {
    throw new BoundaryViolation("WORKSPACE_UI_FORK_DRIFT", "the active fixed-version fork or owner projection coordinate changed");
  }

  const packages = [];
  for (const expected of EXPECTED_PACKAGES) {
    const packageRoot = resolve(repositoryRoot, expected.path);
    const manifest = await json(resolve(packageRoot, "package.json"));
    validatePackage(manifest, expected, version, dshVersion);
    validatePatch(manifest.name, await readFile(resolve(packageRoot, "cordis.patch.yml"), "utf8"));
    for (const path of await filesUnder(packageRoot)) {
      if (!SOURCE_EXTENSION.test(path)) continue;
      validateSourceFile({ packageRoot, path, source: await readFile(path, "utf8"), policy });
    }
    packages.push(Object.freeze({ name: manifest.name, path: expected.path, manifest }));
  }

  const suite = packages[2].manifest;
  exactKeys(suite.dependencies, ["dsh-wsr-execution", "dsh-wsr-studio"], "SUITE_DEPENDENCY_GRAPH", suite.name);
  for (const [name, dependencyVersion] of Object.entries(suite.dependencies)) {
    if (dependencyVersion !== version) throw new BoundaryViolation("SUITE_VERSION_DRIFT", `${name} is ${dependencyVersion}`);
  }
  for (const pkg of packages.slice(0, 2)) {
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const dependency of Object.keys(pkg.manifest[field] ?? {})) {
        if (EXPECTED_PACKAGES.some(({ name }) => name === dependency)) {
          throw new BoundaryViolation("BUNDLE_COUPLING", `${pkg.name} ${field} includes ${dependency}`);
        }
      }
    }
  }

  return Object.freeze({
    dshVersion,
    displayNames: Object.freeze(Object.fromEntries(EXPECTED_PACKAGES.filter(({ displayName }) => displayName !== undefined).map(({ name, displayName }) => [name, displayName]))),
    packages: Object.freeze(packages),
    version,
  });
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

export async function createProvenanceStatement({ artifacts, commit, version }) {
  if (!/^[0-9a-f]{40}$/u.test(commit)) throw new BoundaryViolation("PROVENANCE_COMMIT", commit);
  const subjects = [];
  for (const path of [...artifacts].sort((left, right) => basename(left).localeCompare(basename(right)))) {
    subjects.push(Object.freeze({ name: basename(path), sha256: await sha256(path) }));
  }
  if (subjects.length === 0) throw new BoundaryViolation("PROVENANCE_EMPTY", "no artifacts supplied");
  return Object.freeze({
    schemaVersion: "wsr.dsh.provenance@1.0.0",
    repository: "https://github.com/firestige/wsr-dsh",
    commit,
    version,
    subjects: Object.freeze(subjects),
  });
}
