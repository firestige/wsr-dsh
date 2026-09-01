#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

import { packWorkspaces } from "./lib/package-artifacts.mjs";
import { localSuiteOverrideYaml, localSuiteOverrides, suiteOnlyLayers } from "./lib/clean-profile-policy.mjs";

const root = resolve(new URL("../", import.meta.url).pathname);
const chromeBinary = process.env.WSR_CHROME_BINARY ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ownerAsset = "https://github.com/firestige/wsr-execution/releases/download/0.2.1/wsr-execution-0.2.1.tgz";
const terminalFixture = process.env.WSR_QUALIFY_TERMINAL === "1";
const screenshotDirectory = process.env.WSR_QUALIFY_SCREENSHOT_DIR;

function run(command, args, options = {}) {
  const answer = spawnSync(command, args, { encoding: "utf8", ...options });
  if (answer.error !== undefined || answer.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${answer.stdout ?? ""}\n${answer.stderr ?? ""}`.trim());
  }
  return answer.stdout;
}

async function freePort() {
  const server = createNetServer();
  await new Promise((accept, reject) => server.once("error", reject).listen(0, "127.0.0.1", accept));
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("HARNESS_PORT_UNAVAILABLE");
  await new Promise((accept, reject) => server.close((error) => error === undefined ? accept() : reject(error)));
  return address.port;
}

async function waitFor(predicate, label, timeoutMs = 30_000) {
  const end = Date.now() + timeoutMs;
  let last;
  while (Date.now() < end) {
    try {
      const value = await predicate();
      if (value !== undefined && value !== false) return value;
    } catch (error) { last = error; }
    await new Promise((accept) => setTimeout(accept, 100));
  }
  throw new Error(`${label}: ${last?.message ?? "timed out"}`);
}

async function callApi(origin, method, payload) {
  const rpcId = randomUUID();
  const response = await fetch(`${origin}/api/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "client-request", rpcId, method, payload }),
  });
  if (!response.ok) throw new Error(`HARNESS_API_TRANSPORT_FAILED: ${method} HTTP ${response.status}`);
  const envelope = await response.json();
  if (envelope.rpcId !== rpcId || envelope.result?.ok !== true) {
    throw new Error(`HARNESS_API_FAILED: ${method} ${JSON.stringify(envelope.result?.error)}`);
  }
  return envelope.result.value;
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async open() {
    await new Promise((accept, reject) => {
      this.socket.addEventListener("open", accept, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== undefined) {
        const request = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error === undefined) request?.resolve(message.result);
        else request?.reject(new Error(`${message.error.code}: ${message.error.message}`));
      } else this.events.push(message);
    });
  }

  command(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolvePromise, rejectPromise) => {
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const answer = await this.command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (answer.exceptionDetails !== undefined) throw new Error(answer.exceptionDetails.text);
    return answer.result.value;
  }

  close() { this.socket.close(); }
}

async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((accept) => child.once("exit", accept)),
    new Promise((accept) => setTimeout(accept, 5_000)),
  ]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
}

async function captureScreenshot(cdp, name) {
  const screenshot = await cdp.command("Page.captureScreenshot", { format: "png", fromSurface: true });
  const bytes = Buffer.from(screenshot.data, "base64");
  if (screenshotDirectory !== undefined) {
    await mkdir(screenshotDirectory, { recursive: true });
    await writeFile(join(screenshotDirectory, `${name}.png`), bytes);
  }
  return createHash("sha256").update(bytes).digest("hex");
}

const temporary = await mkdtemp(join(tmpdir(), "wsr-dsh-real-harness-"));
let harness;
let chrome;
let cdp;
let fixtureServer;
let harnessLog = "";
try {
  const packages = join(temporary, "packages");
  const archives = await packWorkspaces({ root, output: packages });
  const executionArchive = archives.find((path) => path.includes("dsh-wsr-execution-"));
  const studioArchive = archives.find((path) => path.includes("dsh-wsr-studio-"));
  const suiteArchive = archives.find((path) => /dsh-wsr-0\.2\.1\.tgz$/u.test(path));
  if (executionArchive === undefined || studioArchive === undefined || suiteArchive === undefined) throw new Error("HARNESS_ARCHIVE_MISSING");

  const home = join(temporary, "home");
  const repository = join(temporary, "repository");
  const state = join(temporary, "state");
  await Promise.all([mkdir(repository), mkdir(state)]);
  await mkdir(join(repository, ".wsr"));
  run("git", ["init", "--quiet", repository]);
  await writeFile(join(repository, ".wsr", "role-provider-bindings.json"), `${JSON.stringify({
    schemaVersion: "execution.repository-role-provider-bindings@1.0.0",
    bindings: {
      "role.greeter": { agentProvider: { identity: "provider.copilot", version: "1.0.78" }, model: { provider: "github-copilot", model: "gpt-5.3-codex" } },
      "role.reviewer": { agentProvider: { identity: "provider.codex", version: "0.144.5" }, model: { provider: "openai", model: "gpt-5.6-sol" } },
    },
  }, null, 2)}\n`, { mode: 0o600 });
  const configFile = join(temporary, "execution.json");
  await writeFile(configFile, `${JSON.stringify({
    schemaVersion: "execution.config@2.0.0",
    paths: {
      repositoryRoot: repository,
      workspaceRoot: repository,
      allowedWorktreeRoots: [repository],
      stateRoot: state,
    },
    workflowSource: {
      kind: "github",
      repository: "firestige/wsr-workflow-package",
      releasesBaseUrl: "https://api.github.com/repos/firestige/wsr-workflow-package/releases",
      assetPattern: "workflow-package-{name}-{version}.tar.gz",
    },
    runner: {
      implementationKey: "runner.v2",
      host: { engine: "langgraph" },
      maxParallelToolCalls: 2,
    },
    observation: {
      enabled: false, timeoutMs: 1000, maxBatchRecords: 8, maxBatchBytes: 65_536,
      flushIntervalMs: 1000, shutdownFlushMs: 1000, serviceName: "wsr-dsh-qualification",
    },
    controls: {
      startupTimeoutMs: 30_000, executionTimeoutMs: 60_000, shutdownTimeoutMs: 10_000,
      maxConcurrentDeliveries: 1, allowExplicitRefresh: false, diagnosticMaxBytes: 4096,
    },
    intake: { maxCorrelationBytes: 256, maxOutputBytes: 8192 },
  }, null, 2)}\n`);

  const bindings = join(temporary, "bindings.json");
  const fixturePort = await freePort();
  const traceId = "a".repeat(32);
  let fixtureAvailable = true;
  fixtureServer = createHttpServer((request, response) => {
    const json = (status, value) => {
      response.writeHead(status, { "content-type": "application/json" });
      response.end(JSON.stringify(value));
    };
    if (!fixtureAvailable) { json(503, { error: { code: "QUALIFICATION_DOWN" } }); return; }
    if (request.url === "/healthz") {
      if (request.headers.accept === "text/plain") { response.writeHead(200, { "content-type": "text/plain" }); response.end("ok"); }
      else json(200, { status: "ok" });
      return;
    }
    if (request.url === "/openapi.json") { json(200, { paths: { "/v1/evidence/tasks": {}, "/v1/evidence/facts": {}, "/v1/evidence/traces": {} } }); return; }
    if (request.url?.startsWith("/v1/evidence/tasks")) { json(200, {
      contract: { name: "evidence.query", revision: "1.0.0" }, observation_profile: "2.0.0",
      read_model_revision: "2.0.0", snapshot: "qualification", items: [
        { task_id: "task-a", display_name: "Alpha Task" }, { task_id: "task-b", display_name: "Beta Task" },
      ], next_cursor: null,
    }); return; }
    if (request.url?.startsWith("/v1/evidence/facts")) { json(200, { items: [{
      id: "fact-1", kind: "EVENT_CONTRIBUTION", recorded_at: "2026-09-01T00:00:00Z",
      provenance: { accepted_digest: "digest-fact-1", profile_version: "1.0.0", family_schema: null, owner_key: [] },
      compatibility: { family_schema: null, event_name: "qualification", completeness: "FINAL", dimensions: [] },
      truth: { completeness: "FINAL", availability: "AVAILABLE", expiry: "ACTIVE", expires_at: null },
      source: { kind: "SPAN", trace_id: traceId, span_id: "b".repeat(16) }, fields: [], relationships: [],
    }] }); return; }
    if (request.url?.startsWith("/v1/evidence/traces")) { json(200, { items: [{
      id: "trace-node-1", kind: "NODE", trace_id: traceId, recorded_at: "2026-09-01T00:00:00Z",
      source: { kind: "SPAN", trace_id: traceId, span_id: "b".repeat(16) },
      truth: { completeness: "FINAL", availability: "AVAILABLE", expiry: "ACTIVE", expires_at: null },
      node: { span_id: "b".repeat(16), span_name: "Qualification evaluate", span_kind: "INTERNAL",
        start_time_unix_nano: "1000000000", end_time_unix_nano: "2000000000", span_status: "OK",
        span_flags: 1, trace_state: null, fields: [] }, edge: null,
    }] }); return; }
    if (request.url === "/api/evolution/v1/evaluations:compute") {
      let body = "";
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        if (body === "{}") { json(400, { error: { code: "INVALID_REQUEST", retryable: false } }); return; }
        const input = JSON.parse(body);
        const side = (selection) => ({ tag: "SIDE_RESULT", receipt: {
          context_version: 1, selection, as_of: "2026-09-01T00:00:00Z", resolved_at: "2026-09-01T00:00:01Z",
          population_state: "COMPLETE", catalog: { catalog_id: "agentops.evaluation.metric-catalog", version: "2.0.0",
            semantic_digest: "sha256:catalog", observation_profile: "1.0.0" },
          evidence_bindings: [{ route: "/v1/evidence/facts", canonical_filter: { delivery_id: "delivery-a" },
            contract_revision: "0.1.0", observation_profile: "1.0.0", read_model_revision: "1.0.0",
            route_snapshot: "qualification", completion_state: "COMPLETE" }],
          task_population: selection.task_ids.map((task_id) => ({ task_id, cohort_coordinates: {}, exclusions: [], memberships: [{
            delivery_id: "delivery-a", manifest_digest: "sha256:manifest", accepted_digest: "sha256:accepted",
            profile_version: "2.0.0", source_identity: "qualification", recorded_at: "2026-09-01T00:00:00Z",
          }] })), input_refs: [{ kind: "FACT", identity: "fact-1", provenance_ref: "digest-fact-1" }], workflow_resolutions: [],
        }, metric_results: [{ metric_id: "delivery-cycle-time-ms", metric_version: "2.0.0", slices: [{
          slice_key: {}, state: "AVAILABLE", value: { kind: "DURATION_MS", value: "12", unit: "ms" },
          measures: {}, coverage: null, compatibility: {}, exclusions: [], missing_inputs: [], provenance_refs: ["digest-fact-1"],
        }] }] });
        json(200, input.mode === "SINGLE" ? { api_version: 1, mode: "SINGLE", result: side(input.selection) } : {
          api_version: 1, mode: "COMPARE", status: "FULL_COMPARE", left: side(input.left), right: side(input.right), deltas: [],
        });
      });
      return;
    }
    json(404, { error: { code: "NOT_FOUND" } });
  });
  await new Promise((accept, reject) => fixtureServer.once("error", reject).listen(fixturePort, "127.0.0.1", accept));
  const hostConfigFile = join(temporary, "wsr-loopback-host.json");
  await writeFile(hostConfigFile, `${JSON.stringify({
    schemaVersion: "wsr.loopback-host@1.0.0",
    services: {
      evidence: { baseUrl: `http://127.0.0.1:${fixturePort}`, healthPath: "/healthz", healthKind: "json-status-ok", contracts: [
        { name: "evidence.query", revision: "0.1.0", operations: ["facts/read", "traces/read"] },
        { name: "evidence.query", revision: "1.0.0", operations: ["tasks/list"] },
      ] },
      evolution: { baseUrl: `http://127.0.0.1:${fixturePort}`, healthPath: "/healthz", healthKind: "plain-ok", contracts: [
        { name: "evolution.compute", revision: "1", operations: ["evaluations/compute"] },
      ] },
    }, observation: { baseUrl: `http://127.0.0.1:${fixturePort}` },
  }, null, 2)}\n`);
  const overlay = join(temporary, "qualification.patch.yml");
  await writeFile(overlay, [
    "- id: ui-settings-models",
    "  name: '@deepseek-ai/dsh-client-ui-settings-models'",
    "  disabled: true",
    "- id: wsr-execution",
    "  config:",
    `    configFile: ${JSON.stringify(configFile)}`,
    `    bindingFile: ${JSON.stringify(bindings)}`,
    "- id: wsr-studio",
    "  config:",
    `    hostConfigFile: ${JSON.stringify(hostConfigFile)}`,
    "",
  ].join("\n"));

  const env = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: "1" };
  // DSH deliberately blocks exotic transitive dependencies. Install the
  // immutable stable owner asset as an explicit profile root; the adapter
  // records its exact URL and digest as release evidence.
  run("dsh", ["plugin", "--profile", "web", "add", ownerAsset, executionArchive, studioArchive, "--ignore-scripts"], { env });
  const workspacePolicyPath = join(home, "profiles/web/pnpm-workspace.yaml");
  const workspacePolicy = await readFile(workspacePolicyPath, "utf8");
  await writeFile(workspacePolicyPath, `${workspacePolicy.trimEnd()}\n${localSuiteOverrideYaml(localSuiteOverrides({ execution: executionArchive, studio: studioArchive }))}`);
  run("dsh", ["plugin", "--profile", "web", "add", suiteArchive, "--ignore-scripts"], { env });
  const profileManifestPath = join(home, "profiles/web/package.json");
  const profileManifest = JSON.parse(await readFile(profileManifestPath, "utf8"));
  profileManifest.dsh.profile.bundles = suiteOnlyLayers(profileManifest.dsh.profile.bundles);
  await writeFile(profileManifestPath, `${JSON.stringify(profileManifest, null, 2)}\n`);
  const dump = run("dsh", ["web", "--patch", overlay, "--dump-config"], { env });
  for (const id of ["wsr-execution", "wsr-studio"]) {
    const count = [...dump.matchAll(new RegExp(`\\bid:\\s*['\"]?${id}['\"]?\\s*$`, "gmu"))].length;
    if (count !== 1) throw new Error(`HARNESS_ACTIVATION_COUNT: ${id}=${count}`);
  }

  const port = await freePort();
  const startHarness = () => {
    const child = spawn("dsh", ["web", "--patch", overlay, "--no-open", "--host", "127.0.0.1", "--port", String(port)], {
      cwd: repository, env, stdio: ["ignore", "pipe", "pipe"],
    });
    for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => { harnessLog += chunk; });
    return child;
  };
  harness = startHarness();
  const origin = `http://127.0.0.1:${port}`;
  let response = await waitFor(async () => {
    if (harness.exitCode !== null) throw new Error(`Harness exited ${harness.exitCode}\n${harnessLog}`);
    const candidate = await fetch(origin);
    return candidate.ok ? candidate : undefined;
  }, "HARNESS_HTTP_UNAVAILABLE", 60_000);
  const csp = response.headers.get("content-security-policy") ?? "";
  if (/unsafe-eval/iu.test(csp)) throw new Error(`HARNESS_CSP_INVALID: ${csp}`);
  const workspace = await waitFor(() => callApi(origin, "workspace.create", { path: repository }), "HARNESS_WORKSPACE_API_UNAVAILABLE");
  if (typeof workspace.workspace.workspaceId !== "string" || workspace.workspace.workspaceId.length === 0) {
    throw new Error("HARNESS_WORKSPACE_CREATE_FAILED");
  }
  let fixtureSessions = [];
  if (terminalFixture) {
    fixtureSessions = await Promise.all([
      callApi(origin, "session.create", { workspaceId: workspace.workspace.workspaceId, sessionId: "session-terminal-a" }),
      callApi(origin, "session.create", { workspaceId: workspace.workspace.workspaceId, sessionId: "session-terminal-b" }),
    ]);
    await Promise.all([
      callApi(origin, "session.rename", { sessionId: fixtureSessions[0].sessionId, title: "Terminal A" }),
      callApi(origin, "session.rename", { sessionId: fixtureSessions[1].sessionId, title: "Terminal B" }),
    ]);
    await stop(harness);
    harness = undefined;
    const terminalRows = [
      { sessionKey: fixtureSessions[0].sessionId, deliveryId: "delivery-completed", correlation: "intake-completed", outcome: "SUCCEEDED", updatedAt: 180, identity: "d" },
      { sessionKey: fixtureSessions[0].sessionId, deliveryId: "delivery-failed", correlation: "intake-failed", outcome: "FAILED", updatedAt: 190, identity: "e" },
      { sessionKey: fixtureSessions[1].sessionId, deliveryId: "delivery-cancelled", correlation: "intake-cancelled", outcome: "CANCELLED", updatedAt: 200, identity: "f" },
    ];
    const completedRoot = join(state, "control-plane", "completed");
    await mkdir(completedRoot, { recursive: true });
    for (const row of terminalRows) {
      const bindingIdentity = `sha256:${row.identity.repeat(64)}`;
      const fact = {
        schemaVersion: "execution.delivery-completed@1.0.0",
        manifest: {
          deliveryId: row.deliveryId,
          taskId: `task-${row.deliveryId}`,
          taskDisplayName: row.deliveryId,
          createdAt: 100,
          canonicalWorktree: repository,
          deliveryBindingIdentity: bindingIdentity,
          workflow: {
            identity: "workflow.qualification", packageName: "terminal-fixture", exactPackageVersion: "1.0.0",
            packageDigest: `sha256:${"a".repeat(64)}`, snapshotIdentity: "snapshot-terminal-fixture", snapshotDigest: `sha256:${"b".repeat(64)}`,
          },
        },
        updatedAt: row.updatedAt,
        terminal: { outcome: row.outcome, finishedAt: row.updatedAt },
        error: row.outcome === "FAILED" ? { code: "QUALIFICATION_FAILED" } : null,
        sessionCorrelation: row.correlation,
      };
      const filename = `${createHash("sha256").update(row.deliveryId).digest("hex")}.json`;
      await writeFile(join(completedRoot, filename), `${JSON.stringify(fact)}\n`, { mode: 0o600 });
    }
    await writeFile(bindings, `${JSON.stringify({
      schemaVersion: "execution.intake-bindings@3.0.0",
      activeBindings: [],
      historicalAssociations: terminalRows.map((row) => ({
        sessionKey: row.sessionKey,
        correlation: row.correlation,
        deliveryId: row.deliveryId,
        deliveryBindingIdentity: `sha256:${row.identity.repeat(64)}`,
        worktree: repository,
      })),
    })}\n`, { mode: 0o600 });
    harnessLog = "";
    harness = startHarness();
    response = await waitFor(async () => {
      if (harness.exitCode !== null) throw new Error(`Harness exited ${harness.exitCode}\n${harnessLog}`);
      const candidate = await fetch(origin);
      return candidate.ok ? candidate : undefined;
    }, "HARNESS_TERMINAL_RESTART_UNAVAILABLE", 60_000);
  }

  let chromeLog = "";
  chrome = spawn(chromeBinary, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=0", `--user-data-dir=${join(temporary, "chrome")}`, origin,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  chrome.stderr.on("data", (chunk) => { chromeLog += chunk; });
  const browserSocket = await waitFor(() => chromeLog.match(/DevTools listening on (ws:\/\/[^\s]+)/u)?.[1], "CHROME_DEVTOOLS_UNAVAILABLE");
  const debugOrigin = new URL(browserSocket);
  const targets = await waitFor(async () => {
    const pages = await (await fetch(`http://${debugOrigin.host}/json/list`)).json();
    return pages.find((page) => page.type === "page" && page.url.startsWith(origin));
  }, "HARNESS_PAGE_UNAVAILABLE");
  cdp = new Cdp(targets.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([cdp.command("Runtime.enable"), cdp.command("Page.enable"), cdp.command("Log.enable")]);

  await cdp.command("Page.bringToFront");
  await waitFor(async () => cdp.evaluate(`document.querySelector('textarea:not(:disabled)') !== null`), "HARNESS_WORKSPACE_PICKER_UNAVAILABLE");
  const workspaceSelected = await cdp.evaluate(`(() => {
    const input = document.querySelector('textarea:not(:disabled)');
    if (!/选择一个工作区开始|Choose a workspace to start/.test(input.placeholder)) return true;
    const picker = [...document.querySelectorAll('button')].find((node) => /选择工作区|Choose workspace/.test(node.textContent.trim()));
    if (!picker) return false;
    picker.click();
    return false;
  })()`);
  if (workspaceSelected !== true) {
    await waitFor(async () => cdp.evaluate(`(() => {
      const item = [...document.querySelectorAll('[role="menuitem"], button')].find((node) => node.textContent.trim() === 'repository');
      if (!item) return false;
      item.click();
      return true;
    })()`), "HARNESS_WORKSPACE_SELECTION_FAILED");
  }
  await waitFor(async () => cdp.evaluate(`(() => {
    const input = document.querySelector('textarea:not(:disabled)');
    return input && !/选择一个工作区开始|Choose a workspace to start/.test(input.placeholder) && document.body.innerText.includes('repository');
  })()`), "HARNESS_SESSION_COMPOSER_UNAVAILABLE");
  await cdp.evaluate(`document.querySelector('textarea:not(:disabled)').focus()`);
  await cdp.command("Input.insertText", { text: "/wsr create hello-world-workflow@0.2.0" });
  const commandDraft = await cdp.evaluate(`(() => {
    const inputs = [...document.querySelectorAll('textarea')].map((input) => ({ value: input.value, disabled: input.disabled, placeholder: input.placeholder }));
    return inputs;
  })()`);
  if (!commandDraft.some((input) => input.value.includes("hello-world-workflow@0.2.0"))) {
    throw new Error(`HARNESS_COMMAND_DRAFT_FAILED: ${JSON.stringify(commandDraft)}`);
  }
  await cdp.command("Input.dispatchKeyEvent", {
    type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 36,
  });
  await cdp.command("Input.dispatchKeyEvent", {
    type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 36,
  });
  await waitFor(async () => cdp.evaluate(`(() => {
    const label = [...document.querySelectorAll('*')]
      .find((node) => node.childElementCount === 0 && node.textContent.trim() === 'Workflow presentation');
    const trigger = label?.closest('button,[role="button"]');
    if (!trigger || !trigger.textContent.includes('TASK_PROMPT_REQUIRED')) return undefined;
    trigger.click();
    return true;
  })()`), "HARNESS_COMMAND_DISCLOSURE_UNAVAILABLE");
  const commandDiagnostic = await waitFor(async () => cdp.evaluate(`(() => {
    const presentations = [...document.querySelectorAll('[data-wsr-presentation="true"]')];
    if (presentations.length !== 1) return undefined;
    const detail = presentations[0]?.querySelector('details');
    const inputs = [...document.querySelectorAll('*')]
      .filter((node) => node.textContent.includes('/wsr') && node.textContent.includes('create hello-world-workflow@0.2.0'))
      .sort((left, right) => left.textContent.length - right.textContent.length);
    const ordered = inputs.length > 0
      && Boolean(inputs[0].compareDocumentPosition(presentations[0]) & Node.DOCUMENT_POSITION_FOLLOWING);
    return { presentations: presentations.length, technicalDetails: detail !== null, userBeforePresentation: ordered,
      presentationText: presentations[0].textContent, errorCode: document.body.textContent.includes('TASK_PROMPT_REQUIRED') };
  })()`), "HARNESS_COMMAND_DIAGNOSTIC_UNAVAILABLE");
  if (!commandDiagnostic.presentationText.includes("Add a Task instruction") || !commandDiagnostic.errorCode || !commandDiagnostic.userBeforePresentation) {
    throw new Error(`HARNESS_COMMAND_DIAGNOSTIC_INVALID: ${JSON.stringify(commandDiagnostic)}`);
  }

  const shell = await waitFor(async () => cdp.evaluate(`(() => {
    const resource = document.querySelector('[data-wsr-sidebar-resources="true"]');
    const delivery = document.querySelector('button[aria-controls="wsr-sidebar-delivery"]');
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const deliveryTab = tabs.find((node) => node.textContent.trim() === 'Delivery');
    const studio = tabs.find((node) => node.textContent.trim() === 'WSR Studio');
    const empty = document.body.innerText.includes('No Deliveries');
    const terminalRows = [...document.querySelectorAll('.wsr-delivery-row')].map((node) => node.getAttribute('aria-label'));
    if (!resource || !delivery || !deliveryTab || !studio || ${terminalFixture ? "terminalRows.length !== 3" : "!empty"} || document.readyState !== 'complete') return undefined;
    return { ready: document.readyState, delivery: delivery.textContent.trim(), empty, terminalRows,
      tabOrder: [deliveryTab.textContent.trim(), studio.textContent.trim()],
      adjacent: tabs.indexOf(studio) === tabs.indexOf(deliveryTab) + 1 };
  })()`), "HARNESS_WSR_SURFACES_UNAVAILABLE", 30_000);
  if (shell.ready !== "complete" || (terminalFixture ? shell.terminalRows.length !== 3 : !shell.empty) || !shell.adjacent) {
    throw new Error(`HARNESS_DELIVERY_READ_FAILED: ${JSON.stringify(shell)}`);
  }
  let terminalView;
  if (terminalFixture) {
    await cdp.command("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await waitFor(async () => cdp.evaluate(`(() => {
      const row = document.querySelector('.wsr-delivery-row[aria-label="delivery-completed, SUCCEEDED"]');
      if (!row) return undefined;
      row.click();
      return true;
    })()`), "HARNESS_TERMINAL_BASELINE_SELECTION_FAILED");
    await cdp.evaluate(`(() => { [...document.querySelectorAll('[role="tab"]')].find((node) => node.textContent.trim() === 'Delivery').click(); })()`);
    terminalView = await waitFor(async () => cdp.evaluate(`(() => {
      const view = document.querySelector('[data-wsr-delivery-id]');
      if (!view) return undefined;
      return { deliveryId: view.getAttribute('data-wsr-delivery-id'), text: view.textContent };
    })()`), "HARNESS_TERMINAL_SESSION_VIEW_UNAVAILABLE");
    const expectedOutcome = "SUCCEEDED";
    if (terminalView.deliveryId !== "delivery-completed" || !terminalView.text.includes(expectedOutcome)) {
      throw new Error(`HARNESS_TERMINAL_SESSION_VIEW_INVALID: ${JSON.stringify(terminalView)}`);
    }
    const firstFold = await cdp.evaluate(`(() => {
      const view = document.querySelector('[data-wsr-delivery-id]');
      const summary = view?.querySelector('[data-wsr-delivery-summary="true"]');
      const disclosure = view?.querySelector('[data-disclosure-row][role="button"]');
      if (!view || !summary || !disclosure) return null;
      const viewportBottom = Math.min(window.innerHeight, view.closest('[role="tabpanel"]')?.getBoundingClientRect().bottom ?? window.innerHeight);
      const items = [...summary.children].map((item) => ({
        label: item.querySelector('dt')?.textContent.trim(),
        top: item.getBoundingClientRect().top,
        bottom: item.getBoundingClientRect().bottom,
      }));
      const required = ['Status', 'Workflow', 'Outcome', 'Elapsed'];
      const visible = required.every((label) => items.some((item) => item.label === label && item.top >= 0 && item.bottom <= viewportBottom));
      const style = getComputedStyle(summary);
      return { visible, required, items, display: style.display, columns: style.gridTemplateColumns,
        documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        viewOverflow: view.scrollWidth > view.clientWidth, disclosureExpanded: disclosure.getAttribute('aria-expanded') };
    })()`);
    if (firstFold === null || !firstFold.visible || firstFold.display !== "grid" || firstFold.documentOverflow || firstFold.viewOverflow) {
      throw new Error(`HARNESS_DELIVERY_FIRST_FOLD_FAILED: ${JSON.stringify(firstFold)}`);
    }
    const desktopScreenshot = await captureScreenshot(cdp, "delivery-desktop");
    const disclosure = await cdp.evaluate(`(() => {
      const control = document.querySelector('[data-wsr-delivery-id] [data-disclosure-row][role="button"]');
      if (!control) return null;
      control.focus();
      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
      return { focused: document.activeElement === control, expanded: control.getAttribute('aria-expanded') };
    })()`);
    const expanded = await waitFor(async () => cdp.evaluate(`document.querySelector('[data-wsr-delivery-id] [data-disclosure-row]')?.getAttribute('aria-expanded') === 'true'`), "HARNESS_DELIVERY_DISCLOSURE_FAILED");
    if (disclosure === null || !disclosure.focused || !expanded) throw new Error(`HARNESS_DELIVERY_DISCLOSURE_FAILED: ${JSON.stringify(disclosure)}`);
    await cdp.command("Browser.grantPermissions", { origin, permissions: ["clipboardReadWrite"] });
    const copyControls = await cdp.evaluate(`(() => {
      const buttons = [...document.querySelectorAll('[data-wsr-delivery-id] button[aria-label^="Copy "]')];
      const labels = buttons.map((button) => button.getAttribute('aria-label'));
      if (buttons.length === 0) return { count: 0, labels, focused: false };
      buttons[0].focus();
      buttons[0].click();
      return { count: buttons.length, labels, focused: document.activeElement === buttons[0] };
    })()`);
    const copyFeedback = await waitFor(async () => cdp.evaluate(`(() => {
      const text = document.querySelector('[data-wsr-delivery-id] [role="status"][aria-live="polite"]')?.textContent.trim();
      return text && (text.endsWith('copied') || text.endsWith('copy failed')) ? text : undefined;
    })()`), "HARNESS_DELIVERY_COPY_FAILED");
    if (copyControls.count < 7 || new Set(copyControls.labels).size !== copyControls.count || !copyControls.focused || !copyFeedback) {
      throw new Error(`HARNESS_DELIVERY_COPY_FAILED: ${JSON.stringify(copyControls)}`);
    }
    const expandedScreenshot = await captureScreenshot(cdp, "delivery-identities-expanded");
    const narrowDelivery = await cdp.evaluate(`(() => {
      const view = document.querySelector('[data-wsr-delivery-id]');
      if (!view) return false;
      view.style.width = '320px';
      const summary = view.querySelector('[data-wsr-delivery-summary="true"]');
      const identities = view.querySelector('.wsr-delivery-identities');
      const columns = (node) => getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length;
      return {
        pass: document.documentElement.scrollWidth <= document.documentElement.clientWidth && view.scrollWidth <= view.clientWidth
          && view.getBoundingClientRect().width <= 320 && columns(summary) === 1 && columns(identities) === 1,
        summaryColumns: columns(summary), identityColumns: columns(identities), width: view.getBoundingClientRect().width,
      };
    })()`);
    if (!narrowDelivery?.pass) throw new Error(`HARNESS_DELIVERY_NARROW_OVERFLOW: ${JSON.stringify(narrowDelivery)}`);
    const narrowScreenshot = await captureScreenshot(cdp, "delivery-narrow-320");
    await cdp.evaluate(`document.querySelector('[data-wsr-delivery-id]').style.width = ''`);
    await cdp.command("Emulation.setDeviceMetricsOverride", { width: 640, height: 400, deviceScaleFactor: 2, mobile: false });
    const zoomDelivery = await cdp.evaluate(`(() => {
      const view = document.querySelector('[data-wsr-delivery-id]');
      return Boolean(view && view.scrollWidth <= view.clientWidth && view.getBoundingClientRect().right <= window.innerWidth);
    })()`);
    if (!zoomDelivery) throw new Error("HARNESS_DELIVERY_ZOOM_OVERFLOW");
    const zoomScreenshot = await captureScreenshot(cdp, "delivery-zoom-200");
    await cdp.command("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp.command("Page.reload", { ignoreCache: true });
    await waitFor(async () => cdp.evaluate(`document.querySelector('[data-wsr-delivery-id=${JSON.stringify(terminalView.deliveryId)}]')?.textContent.includes(${JSON.stringify(expectedOutcome)})`), "HARNESS_TERMINAL_RELOAD_FAILED", 30_000);
    terminalView = { ...terminalView, reload: expectedOutcome, qualification: {
      firstFold, narrowDelivery, zoomDelivery, copyControls: copyControls.count, copyFeedback,
      desktopScreenshot, expandedScreenshot, narrowScreenshot, zoomScreenshot,
    } };
  }
  await cdp.command("Page.bringToFront");
  const before = await cdp.evaluate(`(() => {
    const button = document.querySelector('button[aria-controls="wsr-sidebar-delivery"]');
    button.focus();
    return { expanded: button.getAttribute('aria-expanded'), active: document.activeElement === button };
  })()`);
  if (!before.active) throw new Error("HARNESS_KEYBOARD_FOCUS_FAILED");
  await cdp.evaluate(`document.querySelector('button[aria-controls="wsr-sidebar-delivery"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }))`);
  const after = await waitFor(async () => {
    const value = await cdp.evaluate(`document.querySelector('button[aria-controls="wsr-sidebar-delivery"]')?.getAttribute('aria-expanded')`);
    return value !== before.expanded ? value : undefined;
  }, "HARNESS_KEYBOARD_DISCLOSURE_FAILED");

  await cdp.evaluate(`(() => { [...document.querySelectorAll('[role="tab"]')].find((node) => node.textContent.trim() === 'WSR Studio').click(); })()`);
  const studio = await waitFor(async () => cdp.evaluate(`(() => {
    const view = document.querySelector('[data-wsr-studio-view="evaluate"]');
    if (!view) return undefined;
    const style = getComputedStyle(view);
    return { role: view.getAttribute('role'), modal: view.getAttribute('aria-modal'), color: style.color, background: style.backgroundColor,
      landmarks: ['nav', 'main'].every((name) => view.querySelector(name)), labelled: !!view.getAttribute('aria-labelledby'),
      repositoryInput: view.querySelector('input[aria-label="Repository"]') !== null };
  })()`), "HARNESS_STUDIO_UNAVAILABLE");
  if (studio.role !== "region" || studio.modal !== null || !studio.landmarks || !studio.labelled || studio.repositoryInput || studio.color === studio.background) {
    throw new Error(`HARNESS_THEME_OR_ACCESSIBILITY_FAILED: ${JSON.stringify(studio)}`);
  }
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Load Tasks').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('Alpha Task')`), "HARNESS_STUDIO_TASKS_FAILED");
  await cdp.evaluate(`(() => { const row = [...document.querySelectorAll('li')].find((node) => node.textContent.includes('Alpha Task')); const input = row?.querySelector('input[type="checkbox"]'); if (!input) throw new Error('qualification task checkbox missing'); input.click(); })()`);
  await cdp.evaluate(`document.querySelector('input[type="radio"][value="compare"]').click()`);
  await cdp.evaluate(`(() => { const fieldset = [...document.querySelectorAll('fieldset')].find((node) => node.querySelector('legend')?.textContent === 'After'); const label = [...fieldset.querySelectorAll('label')].find((node) => node.textContent.includes('Beta Task')); label.querySelector('input').click(); })()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Evaluate selection').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('delivery-cycle-time-ms@2.0.0') && document.body.innerText.includes('left side') && document.body.innerText.includes('right side')`), "HARNESS_STUDIO_COMPARE_METRIC_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'View receipt').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('Evaluation receipt') && document.body.innerText.includes('/v1/evidence/facts')`), "HARNESS_STUDIO_RECEIPT_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Back to Metric Results').click(); })()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'View evidence').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('EVENT_CONTRIBUTION') && document.body.innerText.includes('fact-1')`), "HARNESS_STUDIO_FACT_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.includes(${JSON.stringify(traceId)})).click(); })()`);
  const trace = await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('Recorded structure') && document.body.innerText.includes('Qualification evaluate')`), "HARNESS_STUDIO_TRACE_FAILED");
  const storedLocation = await cdp.evaluate(`sessionStorage.getItem('wsr.studio.location@1')`);
  const urlLocation = await cdp.evaluate(`new URL(location.href).searchParams.get('wsr-studio')`);
  if (!storedLocation?.startsWith('/evaluate/trace/') || urlLocation !== null) {
    throw new Error(`HARNESS_STUDIO_LOCATION_FAILED: ${JSON.stringify({ storedLocation, urlLocation })}`);
  }
  await cdp.command("Emulation.setDeviceMetricsOverride", { width: 360, height: 720, deviceScaleFactor: 1, mobile: false });
  const narrow = await waitFor(async () => cdp.evaluate(`(() => {
    const view = document.querySelector('[data-wsr-studio-view="evaluate"]');
    if (view === null) return undefined;
    const result = { pass: view.scrollWidth <= view.clientWidth, scrollWidth: view.scrollWidth, clientWidth: view.clientWidth, innerWidth: window.innerWidth };
    return result.pass ? result : undefined;
  })()`), "HARNESS_STUDIO_NARROW_OVERFLOW", 3_000);
  await cdp.command("Page.reload", { ignoreCache: true });
  const restored = await waitFor(async () => cdp.evaluate(`(() => {
    const view = document.querySelector('[data-wsr-studio-view="evaluate"]');
    return Boolean(view && document.body.innerText.includes('Recorded structure') && document.body.innerText.includes('Qualification evaluate'));
  })()`), "HARNESS_STUDIO_REFRESH_RECOVERY_FAILED", 30_000);
  fixtureAvailable = false;
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Back to Metric Results').click(); })()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Load Tasks').click(); })()`);
  const degraded = await waitFor(async () => cdp.evaluate(`(() => {
    const alert = [...document.querySelectorAll('[role="alert"]')].find((node) => node.textContent.includes('Task list unavailable'));
    return alert?.textContent.trim();
  })()`), "HARNESS_STUDIO_DEGRADED_STATE_FAILED");
  await cdp.command("Page.bringToFront");
  await cdp.command("Input.dispatchKeyEvent", {
    type: "keyDown", key: "Escape", code: "Escape",
    windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53,
  });
  await cdp.command("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53 });
  const retainedAfterEscape = await waitFor(async () => cdp.evaluate(`document.querySelector('[data-wsr-studio-view="evaluate"]') !== null`), "HARNESS_ESCAPE_RETENTION_FAILED", 3_000);

  const severe = cdp.events.filter((event) => event.method === "Runtime.exceptionThrown"
    || (event.method === "Log.entryAdded" && ["error"].includes(event.params.entry.level)));
  if (severe.length > 0) throw new Error(`HARNESS_BROWSER_ERRORS: ${JSON.stringify(severe)}`);
  const owner = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8")).packages["node_modules/wsr-execution"];
  process.stdout.write(`${JSON.stringify({
    dsh: run("dsh", ["--version"]).trim(),
    owner: { version: owner.version, resolved: owner.resolved, integrity: owner.integrity },
    host: {
      origin,
      csp: csp === "" ? "absent-in-dsh-0.1.1-rc.2" : createHash("sha256").update(csp).digest("hex"),
      activation: ["wsr-execution", "wsr-studio"],
    },
    browser: { deliveryInventory: terminalFixture ? shell.terminalRows : "empty-ready", terminalView: terminalView ?? null, commandDiagnostic, keyboardDisclosure: `${before.expanded}->${after}`, tabOrder: shell.tabOrder, studio,
      evaluate: "compare-metric-receipt-fact-trace", storedLocation, urlLocation, refreshRecovery: restored,
      escapeBehavior: retainedAfterEscape ? "conversation-view-retained" : "invalid", degraded, narrow, trace, errors: 0 },
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  if (cdp !== undefined) {
    try {
      const diagnostic = await cdp.evaluate(`({ title: document.title, text: document.body?.innerText?.slice(0, 4000), html: document.body?.innerHTML?.slice(0, 4000) })`);
      process.stderr.write(`browser diagnostic: ${JSON.stringify(diagnostic)}\n`);
      process.stderr.write(`browser events: ${JSON.stringify(cdp.events.slice(-20))}\n`);
    } catch { /* retain the primary failure */ }
  }
  if (harnessLog !== "") process.stderr.write(`Harness log:\n${harnessLog.slice(-12_000)}\n`);
  process.exitCode = 1;
} finally {
  cdp?.close();
  if (chrome !== undefined) await stop(chrome);
  if (harness !== undefined) await stop(harness);
  if (fixtureServer !== undefined) await new Promise((accept) => fixtureServer.close(accept));
  await rm(temporary, { recursive: true, force: true });
}
