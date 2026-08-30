#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

import { packWorkspaces } from "./lib/package-artifacts.mjs";

const root = resolve(new URL("../", import.meta.url).pathname);
const chromeBinary = process.env.WSR_CHROME_BINARY ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ownerAsset = "https://github.com/firestige/wsr-execution/releases/download/0.1.4/wsr-execution-0.1.4.tgz";

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
  if (executionArchive === undefined || studioArchive === undefined) throw new Error("HARNESS_ARCHIVE_MISSING");

  const home = join(temporary, "home");
  const repository = join(temporary, "repository");
  const state = join(temporary, "state");
  await Promise.all([mkdir(repository), mkdir(state)]);
  run("git", ["init", "--quiet", repository]);
  const credentials = join(temporary, "credentials.yaml");
  await writeFile(credentials, "qualification-key: qualification-only\n", { mode: 0o600 });
  const configFile = join(temporary, "execution.json");
  await writeFile(configFile, `${JSON.stringify({
    schemaVersion: "execution.config@1.0.0",
    paths: {
      repositoryRoot: repository,
      workspaceRoot: repository,
      allowedWorktreeRoots: [repository],
      stateRoot: state,
      credentialStorePath: credentials,
    },
    workflowSource: {
      kind: "github",
      repository: "firestige/wsr-workflow-package",
      releasesBaseUrl: "https://api.github.com/repos/firestige/wsr-workflow-package/releases",
      assetPattern: "workflow-package-{name}-{version}.tar.gz",
    },
    runner: {
      implementationKey: "runner.v1",
      host: { engine: "langgraph" },
      provider: {
        key: "dsh", route: "qualification", modelId: "qualification",
        baseUrl: "http://127.0.0.1:9/v1", credentialRef: "qualification-key", maxParallelToolCalls: 1,
      },
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
    if (request.url?.startsWith("/v1/evidence/facts")) { json(200, { items: [{ id: "fact-1", kind: "EVENT_CONTRIBUTION", provenance: { accepted_digest: "digest-fact-1" }, source: { trace_id: traceId, span_id: "b".repeat(16) } }] }); return; }
    if (request.url?.startsWith("/v1/evidence/traces")) { json(200, { items: [{ id: "trace-node-1", kind: "NODE", trace_id: traceId }] }); return; }
    if (request.url === "/api/evolution/v1/evaluations:compute") {
      let body = "";
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        if (body === "{}") { json(400, { error: { code: "INVALID_REQUEST", retryable: false } }); return; }
        const input = JSON.parse(body);
        const side = (selection) => ({ tag: "SIDE_RESULT", receipt: {
          selection, population_state: "COMPLETE", evidence_bindings: [{ route: "/v1/evidence/facts", canonical_filter: { delivery_id: "delivery-a" } }],
          task_population: selection.task_ids.map((task_id) => ({ task_id, memberships: [{ delivery_id: "delivery-a" }] })), input_refs: [],
        }, metric_results: [{ metric_id: "delivery-cycle-time-ms", metric_version: "2.0.0", slices: [{ slice_key: {}, state: "AVAILABLE", value: { kind: "DURATION_MS", value: "12", unit: "ms" }, provenance_refs: ["digest-fact-1"] }] }] });
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
  // immutable owner RC as an explicit profile root; the adapter has an exact
  // 0.1.4 peer and records the asset URL/digest in its own metadata.
  run("dsh", ["plugin", "--profile", "web", "add", ownerAsset, executionArchive, studioArchive, "--ignore-scripts"], { env });
  const dump = run("dsh", ["web", "--patch", overlay, "--dump-config"], { env });
  for (const id of ["wsr-execution", "wsr-studio"]) {
    const count = [...dump.matchAll(new RegExp(`\\bid:\\s*['\"]?${id}['\"]?\\s*$`, "gmu"))].length;
    if (count !== 1) throw new Error(`HARNESS_ACTIVATION_COUNT: ${id}=${count}`);
  }

  const port = await freePort();
  harness = spawn("dsh", ["web", "--patch", overlay, "--no-open", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repository, env, stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [harness.stdout, harness.stderr]) stream.on("data", (chunk) => { harnessLog += chunk; });
  const origin = `http://127.0.0.1:${port}`;
  const response = await waitFor(async () => {
    if (harness.exitCode !== null) throw new Error(`Harness exited ${harness.exitCode}\n${harnessLog}`);
    const candidate = await fetch(origin);
    return candidate.ok ? candidate : undefined;
  }, "HARNESS_HTTP_UNAVAILABLE", 60_000);
  const csp = response.headers.get("content-security-policy") ?? "";
  if (/unsafe-eval/iu.test(csp)) throw new Error(`HARNESS_CSP_INVALID: ${csp}`);

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

  const shell = await waitFor(async () => cdp.evaluate(`(() => {
    const resource = document.querySelector('[data-wsr-sidebar-resources="true"]');
    const delivery = document.querySelector('button[aria-controls="wsr-sidebar-delivery"]');
    const studio = [...document.querySelectorAll('button')].find((node) => /^(WSR )?Studio$/.test(node.textContent.trim()));
    const empty = document.body.innerText.includes('No Deliveries');
    if (!resource || !delivery || !studio || !empty || document.readyState !== 'complete') return undefined;
    return { ready: document.readyState, delivery: delivery.textContent.trim(), empty };
  })()`), "HARNESS_WSR_SURFACES_UNAVAILABLE", 30_000);
  if (shell.ready !== "complete" || !shell.empty) throw new Error(`HARNESS_DELIVERY_READ_FAILED: ${JSON.stringify(shell)}`);
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

  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => /^(WSR )?Studio$/.test(node.textContent.trim())).click(); })()`);
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
  const closeFocused = await cdp.evaluate(`(() => {
    const close = document.querySelector('button[aria-label="Close WSR Studio"]');
    close.focus();
    return { focused: document.activeElement === close, inert: close.closest('[inert]') !== null };
  })()`);
  if (!closeFocused.focused || closeFocused.inert) throw new Error(`HARNESS_STUDIO_CLOSE_FOCUS_FAILED: ${JSON.stringify(closeFocused)}`);
  await cdp.evaluate(`document.querySelector('button[aria-label="Close WSR Studio"]').blur()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Load Tasks').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('Alpha Task')`), "HARNESS_STUDIO_TASKS_FAILED");
  await cdp.evaluate(`(() => { const row = [...document.querySelectorAll('li')].find((node) => node.textContent.includes('Alpha Task')); const input = row?.querySelector('input[type="checkbox"]'); if (!input) throw new Error('qualification task checkbox missing'); input.click(); })()`);
  await cdp.evaluate(`document.querySelector('input[type="radio"][value="compare"]').click()`);
  await cdp.evaluate(`(() => { const fieldset = [...document.querySelectorAll('fieldset')].find((node) => node.querySelector('legend')?.textContent === 'After'); const label = [...fieldset.querySelectorAll('label')].find((node) => node.textContent.includes('Beta Task')); label.querySelector('input').click(); })()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Evaluate selection').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('delivery-cycle-time-ms@2.0.0') && document.body.innerText.includes('left side') && document.body.innerText.includes('right side')`), "HARNESS_STUDIO_COMPARE_METRIC_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'View receipt').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('Evidence bindings: 1')`), "HARNESS_STUDIO_RECEIPT_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Back to Metric Results').click(); })()`);
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Fact drill-down').click(); })()`);
  await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('EVENT_CONTRIBUTION · fact-1')`), "HARNESS_STUDIO_FACT_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Open recorded trace').click(); })()`);
  const trace = await waitFor(async () => cdp.evaluate(`document.body.innerText.includes('NODE · trace-node-1')`), "HARNESS_STUDIO_TRACE_FAILED");
  const deepLink = await cdp.evaluate(`new URL(location.href).searchParams.get('wsr-studio')`);
  if (!deepLink?.startsWith('/evaluate/trace/')) throw new Error(`HARNESS_STUDIO_DEEP_LINK_FAILED: ${deepLink}`);
  await cdp.command("Emulation.setDeviceMetricsOverride", { width: 360, height: 720, deviceScaleFactor: 1, mobile: false });
  const narrow = await cdp.evaluate(`(() => { const view = document.querySelector('[data-wsr-studio-view="evaluate"]'); return view.scrollWidth <= view.clientWidth; })()`);
  if (!narrow) throw new Error("HARNESS_STUDIO_NARROW_OVERFLOW");
  await cdp.command("Page.reload", { ignoreCache: true });
  const restored = await waitFor(async () => cdp.evaluate(`(() => {
    const view = document.querySelector('[data-wsr-studio-view="evaluate"]');
    return Boolean(view && document.body.innerText.includes('NODE · trace-node-1'));
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
  await waitFor(async () => cdp.evaluate(`document.querySelector('[data-wsr-studio-view="evaluate"]') === null`), "HARNESS_ESCAPE_CLOSE_FAILED", 3_000);

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
    browser: { deliveryInventory: "empty-ready", keyboardDisclosure: `${before.expanded}->${after}`, studio, escapeClose: "native",
      evaluate: "compare-metric-receipt-fact-trace", deepLink, refreshRecovery: restored, degraded, narrow, trace, errors: 0 },
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
