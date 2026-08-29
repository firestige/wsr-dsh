#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

import { packWorkspaces } from "./lib/package-artifacts.mjs";

const root = resolve(new URL("../", import.meta.url).pathname);
const chromeBinary = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ownerAsset = "https://github.com/firestige/execution-system/releases/download/0.1.4-rc.1/wsr-execution-0.1.4.tgz";

function run(command, args, options = {}) {
  const answer = spawnSync(command, args, { encoding: "utf8", ...options });
  if (answer.error !== undefined || answer.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${answer.stdout ?? ""}\n${answer.stderr ?? ""}`.trim());
  }
  return answer.stdout;
}

async function freePort() {
  const server = createServer();
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
      repository: "firestige/workflow-package",
      releasesBaseUrl: "https://api.github.com/repos/firestige/workflow-package/releases",
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
  const unavailablePort = await freePort();
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
    `    evidenceBaseUrl: http://127.0.0.1:${unavailablePort}`,
    `    evolutionBaseUrl: http://127.0.0.1:${unavailablePort}`,
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
    if (!resource || !delivery || !studio) return undefined;
    return { ready: document.readyState, delivery: delivery.textContent.trim(), empty: document.body.innerText.includes('No Deliveries') };
  })()`), "HARNESS_WSR_SURFACES_UNAVAILABLE", 30_000);
  if (shell.ready !== "complete" || !shell.empty) throw new Error(`HARNESS_DELIVERY_READ_FAILED: ${JSON.stringify(shell)}`);
  const before = await cdp.evaluate(`(() => {
    const button = document.querySelector('button[aria-controls="wsr-sidebar-delivery"]');
    button.focus();
    return { expanded: button.getAttribute('aria-expanded'), active: document.activeElement === button };
  })()`);
  if (!before.active) throw new Error("HARNESS_KEYBOARD_FOCUS_FAILED");
  await cdp.command("Page.bringToFront");
  await cdp.command("Input.dispatchKeyEvent", {
    type: "rawKeyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r",
    windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
  });
  await cdp.command("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  const after = await waitFor(async () => {
    const value = await cdp.evaluate(`document.querySelector('button[aria-controls="wsr-sidebar-delivery"]')?.getAttribute('aria-expanded')`);
    return value !== before.expanded ? value : undefined;
  }, "HARNESS_KEYBOARD_DISCLOSURE_FAILED");

  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => /^(WSR )?Studio$/.test(node.textContent.trim())).click(); })()`);
  const studio = await waitFor(async () => cdp.evaluate(`(() => {
    const dialog = document.querySelector('[data-wsr-studio="evaluate"]');
    if (!dialog) return undefined;
    const style = getComputedStyle(dialog);
    return { role: dialog.getAttribute('role'), modal: dialog.getAttribute('aria-modal'), color: style.color, background: style.backgroundColor };
  })()`), "HARNESS_STUDIO_UNAVAILABLE");
  if (studio.role !== "dialog" || studio.modal !== "true" || studio.color === studio.background) {
    throw new Error(`HARNESS_THEME_OR_ACCESSIBILITY_FAILED: ${JSON.stringify(studio)}`);
  }
  const closeFocused = await cdp.evaluate(`(() => {
    const close = document.querySelector('button[aria-label="Close WSR Studio"]');
    close.focus();
    return { focused: document.activeElement === close, inert: close.closest('[inert]') !== null };
  })()`);
  if (!closeFocused.focused || closeFocused.inert) throw new Error(`HARNESS_STUDIO_CLOSE_FOCUS_FAILED: ${JSON.stringify(closeFocused)}`);
  await cdp.command("Page.bringToFront");
  await cdp.command("Input.dispatchKeyEvent", {
    type: "keyDown", key: "Escape", code: "Escape",
    windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53,
  });
  await cdp.command("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 53 });
  await waitFor(async () => cdp.evaluate(`document.querySelector('[data-wsr-studio="evaluate"]') === null`), "HARNESS_ESCAPE_CLOSE_FAILED", 3_000);

  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => /^(WSR )?Studio$/.test(node.textContent.trim())).click(); })()`);
  await waitFor(async () => cdp.evaluate(`(() => {
    if (document.querySelector('[data-wsr-studio="evaluate"]') === null) return false;
    return [...document.querySelectorAll('button')].some((node) => node.textContent.trim() === 'Load Tasks');
  })()`), "HARNESS_STUDIO_REOPEN_FAILED");
  await cdp.evaluate(`(() => { [...document.querySelectorAll('button')].find((node) => node.textContent.trim() === 'Load Tasks').click(); })()`);
  const degraded = await waitFor(async () => cdp.evaluate(`(() => {
    const alert = [...document.querySelectorAll('[role="alert"]')].find((node) => node.textContent.includes('Task list unavailable'));
    return alert?.textContent.trim();
  })()`), "HARNESS_STUDIO_DEGRADED_STATE_FAILED");

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
    browser: { deliveryInventory: "empty-ready", keyboardDisclosure: `${before.expanded}->${after}`, studio, escapeClose: "native", reopen: "ready", degraded, errors: 0 },
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
  await rm(temporary, { recursive: true, force: true });
}
