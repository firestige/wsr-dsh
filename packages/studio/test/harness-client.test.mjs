import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  createDefaultStudioLayout,
  createStudioClientPlugin,
  createStudioGatewayPort,
  createStudioTheme,
  createStudioDashboardState,
  createStudioLayoutStore,
  reduceStudioDashboardState,
  STUDIO_PAGES,
  studioAccessibilityModel,
} from "../src/client/studio.js";

function textOf(element) {
  if (element === null || element === undefined || typeof element === "boolean") return "";
  if (typeof element === "string" || typeof element === "number") return String(element);
  if (Array.isArray(element)) return element.map(textOf).join("");
  return textOf(element.children);
}

function elementsOf(element) {
  if (element === null || element === undefined || typeof element !== "object") return [];
  if (Array.isArray(element)) return element.flatMap(elementsOf);
  return [element, ...elementsOf(element.children)];
}

const Bi = Object.freeze({
  BiCard: "wsr-bi-card",
  BiSection: "wsr-bi-section",
  BiSurface: "wsr-bi-surface",
  CompareResultFrame: "wsr-compare-result",
  EvidenceConsoleFoundation: "wsr-evidence-console",
  MetricPanel: "wsr-metric-panel",
  ReceiptView: "wsr-receipt-view",
  TraceTree: "wsr-trace-tree",
  TraceWaterfall: "wsr-trace-waterfall",
  ScopedError: "wsr-scoped-error",
  createBiTheme: (theme) => Object.freeze({ ...theme }),
  compileTraceView: () => ({
    schemaVersion: "wsr.trace-view@1",
    status: "READY",
    traceId: "trace-1",
    nodes: [],
    parentEdges: [],
    links: [],
    errors: [],
  }),
  selectDefaultVisualizer: (result) => result.slices[0]?.value?.kind === "RATIO" ? "ratio-bar@1" : "numeric-card@1",
});

test("the Host owns a versioned responsive dashboard layout and creates the platform theme", () => {
  const layout = createDefaultStudioLayout();
  assert.equal(layout.schemaVersion, "wsr-dsh.studio-layout@1");
  assert.deepEqual(layout.columns, { desktop: 12, tablet: 6, mobile: 1 });
  assert.deepEqual(layout.panels.map(({ id, desktop, tablet, mobile }) => ({ id, desktop, tablet, mobile })), [
    { id: "operational-latency", desktop: { w: 3, h: 2 }, tablet: { w: 3, h: 2 }, mobile: { w: 1, h: 2 } },
    { id: "delivery-cycle-time", desktop: { w: 3, h: 2 }, tablet: { w: 3, h: 2 }, mobile: { w: 1, h: 2 } },
    { id: "usage-availability", desktop: { w: 3, h: 2 }, tablet: { w: 3, h: 2 }, mobile: { w: 1, h: 2 } },
    { id: "cohort-eligibility", desktop: { w: 3, h: 2 }, tablet: { w: 3, h: 2 }, mobile: { w: 1, h: 2 } },
    { id: "role-template-rework-rate", desktop: { w: 6, h: 3 }, tablet: { w: 3, h: 3 }, mobile: { w: 1, h: 3 } },
    { id: "role-model-task-outcome-rate", desktop: { w: 6, h: 3 }, tablet: { w: 3, h: 3 }, mobile: { w: 1, h: 3 } },
    { id: "delivery-stage-reach", desktop: { w: 12, h: 4 }, tablet: { w: 6, h: 4 }, mobile: { w: 1, h: 4 } },
  ]);
  assert.deepEqual(createStudioTheme("dark"), {
    mode: "dark",
    density: "compact",
    containerBorderStyle: "solid",
  });
});

test("the Host owns dashboard add, remove, resize, and reorder state", () => {
  const initial = createStudioDashboardState(["latency", "rework", "reach"]);
  const resized = reduceStudioDashboardState(initial, {
    type: "RESIZE",
    panelId: "rework",
    size: "wide",
  });
  const moved = reduceStudioDashboardState(resized, {
    type: "MOVE",
    panelId: "reach",
    beforePanelId: "latency",
  });
  const removed = reduceStudioDashboardState(moved, {
    type: "REMOVE",
    panelId: "rework",
  });
  const restored = reduceStudioDashboardState(removed, {
    type: "ADD",
    panelId: "rework",
  });

  assert.deepEqual(restored.order, ["reach", "latency", "rework"]);
  assert.deepEqual(restored.hidden, []);
  assert.equal(restored.sizes.rework, "wide");
  assert.throws(
    () => reduceStudioDashboardState(restored, { type: "RESIZE", panelId: "missing", size: "wide" }),
    /UNKNOWN_STUDIO_PANEL/,
  );
});

test("dashboard edit state supports preset, reset, save, and fail-closed restore", () => {
  const writes = new Map();
  const storage = {
    getItem(key) { return writes.get(key) ?? null; },
    setItem(key, value) { writes.set(key, value); },
  };
  const initial = createStudioDashboardState(["latency", "rework"]);
  const changed = reduceStudioDashboardState(
    reduceStudioDashboardState(initial, { type: "REMOVE", panelId: "rework" }),
    { type: "RESIZE", panelId: "latency", size: "full" },
  );
  const store = createStudioLayoutStore(storage);
  store.save(changed);
  assert.deepEqual(store.load(initial), changed);
  assert.deepEqual(
    reduceStudioDashboardState(changed, { type: "PRESET", preset: "default" }),
    initial,
  );
  assert.deepEqual(reduceStudioDashboardState(changed, { type: "RESET" }), initial);

  writes.set("wsr.studio.dashboard-layout@1", "{malformed");
  assert.deepEqual(store.load(initial), initial);
});

test("the browser port uses only the DSH Host channel and exposes no downstream URL or credentials", async () => {
  const calls = [];
  const port = createStudioGatewayPort({
    connection: {
      rpc: {
        async call(channel, endpoint, payload, signal) {
          calls.push({ channel, endpoint, payload, signal });
          return { ok: true, value: { items: [] } };
        },
      },
    },
  });
  await port.call("tasks/list", { limit: 1 });
  assert.deepEqual(calls.map(({ channel, endpoint, payload }) => ({ channel, endpoint, payload })), [
    { channel: "/wsr-studio", endpoint: "tasks/list", payload: { limit: 1 } },
  ]);
  assert.doesNotMatch(JSON.stringify(port), /127\.0\.0\.1|Authorization|cookie/i);
});

test("Harness registration adds WSR Studio as the native conversation tab immediately after Delivery", () => {
  const registrations = [];
  const injected = [];
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    slots: {
      inject(name, factory) {
        injected.push(name);
        factory();
      },
      register(options, component) {
        registrations.push({ options, component });
        return () => undefined;
      },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const runtime = createStudioClientPlugin({ React, Bi }).apply(ctx);
  assert.deepEqual(injected, ["conversation.view"]);
  assert.deepEqual(registrations.map(({ options }) => options), [{
    name: "conversation.view", id: "wsr-studio", order: 30, label: "WSR Studio",
  }]);
  assert.equal(typeof runtime.controller.getSnapshot, "function");
  assert.ok(registrations.every(({ options }) => !["sidebar.footer.action", "shell.overlay", "sidebar.workspaces"].includes(options.name)));
});

test("the Studio shell advertises one Evaluate route and complete keyboard/screen-reader landmarks", () => {
  const model = studioAccessibilityModel();
  assert.deepEqual(model.routes, ["Evaluate"]);
  assert.deepEqual(STUDIO_PAGES, [{ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" }]);
  assert.deepEqual(model.landmarks, ["region", "navigation", "main"]);
  assert.equal(model.surface, "conversation-view");
  assert.equal(model.modal, false);
  assert.equal("closeKey" in model, false);
  assert.equal("focusReturnsToTrigger" in model, false);
  assert.equal(model.liveRegions.loading, "polite");
  assert.equal(model.liveRegions.error, "assertive");
  assert.equal(model.minimumTargetPixels, 44);
  assert.equal(JSON.stringify(model).includes("Builder"), false);
  assert.equal(JSON.stringify(model).includes("improvement"), false);
});

test("the native Studio tab exposes a non-modal Evidence view without Session repository context", () => {
  const components = new Map();
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    slots: {
      inject(_name, factory) { factory(); },
      register(options, component) {
        components.set(options.name, component);
        return () => components.delete(options.name);
      },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const Primitives = { Button: "dsh-button", Input: "dsh-input", DisclosureRow: "dsh-disclosure", JsonTree: "dsh-json-tree", Pill: "dsh-pill", StateDot: "dsh-state-dot" };
  const runtime = createStudioClientPlugin({ React, Primitives, Bi, initialContext: { taskId: "task-a" } }).apply(ctx);
  assert.equal(typeof runtime, "function");
  const rendered = components.get("conversation.view")({ sessionId: "session-a" });
  const text = textOf(rendered);
  const inputs = elementsOf(rendered).filter((element) => element.type === "input" || element.type === "dsh-input");
  assert.match(text, /Evaluate/);
  assert.match(text, /Single/);
  assert.match(text, /Compare/);
  assert.equal(inputs.some(({ props }) => props["aria-label"] === "Repository"), false);
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "single"));
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "compare"));
  assert.doesNotMatch(text, /Builder|improvement/i);
  const view = elementsOf(rendered).find((element) => element.props?.["data-wsr-studio-view"] === "evaluate");
  assert.equal(view.props.role, "region");
  assert.equal(view.props["aria-modal"], undefined);
  assert.equal(view.props.id, "wsr-studio-view");
  assert.equal(Object.hasOwn(runtime.controller.getSnapshot(), "repository"), false);
  assert.equal(Object.hasOwn(runtime.controller.getSnapshot(), "workspaceId"), false);
  assert.ok(elementsOf(rendered).some((element) => element.type === "dsh-button"));
  assert.equal(view.props.onKeyDown, undefined);
  assert.equal(components.has("shell.overlay"), false);
  assert.equal(components.has("sidebar.footer.action"), false);
});

test("AVAILABLE and UNAVAILABLE results use the shared BI product surface while JSON stays opt-in", async () => {
  const components = new Map();
  const result = {
    api_version: 1,
    mode: "SINGLE",
    result: {
      tag: "SIDE_RESULT",
      receipt: { selection: { selection_version: 1, task_ids: ["task-a"] } },
      metric_results: [
        {
          metric_id: "delivery-success-rate",
          metric_version: "2.0.0",
          slices: [{ slice_key: {}, state: "AVAILABLE", value: { kind: "RATIO", value: "3/4", unit: "ratio" }, measures: {}, coverage: null, compatibility: {}, exclusions: [], missing_inputs: [], provenance_refs: [] }],
        },
        {
          metric_id: "workflow-resolution-rate",
          metric_version: "2.0.0",
          slices: [{ slice_key: {}, state: "UNAVAILABLE", withholding_reason: "MISSING_INPUT", measures: {}, coverage: null, compatibility: {}, exclusions: [], missing_inputs: ["workflow_snapshot"], provenance_refs: [] }],
        },
      ],
    },
  };
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: result }) } },
    slots: {
      inject(_name, factory) { factory(); },
      register(options, component) {
        components.set(options.name, component);
        return () => components.delete(options.name);
      },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const Primitives = { Button: "dsh-button", JsonTree: "dsh-json-tree" };
  const runtime = createStudioClientPlugin({ React, Primitives, Bi, initialContext: { taskId: "task-a" } }).apply(ctx);
  await runtime.controller.evaluate();

  const rendered = components.get("conversation.view")();
  const elements = elementsOf(rendered);
  const panels = elements.filter((element) => element.type === "wsr-metric-panel");
  assert.equal(elements.some((element) => element.type === "wsr-bi-surface"), true);
  assert.deepEqual(panels.map((panel) => panel.props.visualizer), [undefined, undefined]);
  assert.deepEqual(panels.map((panel) => panel.props.result.metric_id), [
    "delivery-success-rate",
    "workflow-resolution-rate",
  ]);
  assert.equal(elements.some((element) => element.type === "dsh-json-tree"), false);
  assert.match(textOf(rendered), /Technical JSON details/);
  assert.match(textOf(rendered), /Dashboard/);
  assert.match(textOf(rendered), /Evidence/);
  assert.match(textOf(rendered), /Recorded Trace/);
  const regions = elements.filter((element) => element.props?.["data-wsr-studio-region"]);
  assert.deepEqual(regions.map((element) => element.props["data-wsr-studio-region"]), ["header", "main", "footer"]);
  const surface = elements.find((element) => element.type === "wsr-bi-surface");
  assert.deepEqual(surface.props.theme, {
    mode: "light",
    density: "compact",
    containerBorderStyle: "solid",
  });
  assert.equal(elements.some((element) => element.props?.["data-wsr-dashboard-layout"] === "wsr-dsh.studio-layout@1"), true);
});

test("compare, receipt, Fact and recorded Trace routes use shared BI foundations", async () => {
  const components = new Map();
  const traceId = "a".repeat(32);
  const spanId = "b".repeat(16);
  const slice = { slice_key: {}, state: "AVAILABLE", value: { kind: "DURATION_MS", value: "12", unit: "ms" }, measures: {}, coverage: null, compatibility: {}, exclusions: [], missing_inputs: [], provenance_refs: [] };
  const side = (taskId) => ({
    tag: "SIDE_RESULT",
    receipt: { selection: { selection_version: 1, task_ids: [taskId] } },
    metric_results: [{ metric_id: "delivery-cycle-time-ms", metric_version: "2.0.0", slices: [slice] }],
  });
  const comparison = {
    api_version: 1,
    mode: "COMPARE",
    status: "FULL_COMPARE",
    left: side("task-a"),
    right: side("task-b"),
    deltas: [{
      metric_coordinate: "delivery-cycle-time-ms@2.0.0",
      slice_key: {},
      state: "AVAILABLE",
      direction: "NO_CHANGE",
      value: { kind: "DURATION_MS", value: "0", unit: "ms" },
    }],
  };
  const fact = {
    id: "fact-1",
    kind: "EVENT_CONTRIBUTION",
    source: { kind: "SPAN", trace_id: traceId, span_id: spanId },
    provenance: { accepted_digest: "sha256:fact" },
    compatibility: { dimensions: [], event_name: null, family_schema: null },
    truth: { completeness: "FINAL", availability: "AVAILABLE", expiry: "ACTIVE", expires_at: null },
  };
  const traceItem = {
    id: "trace-node-1",
    kind: "NODE",
    trace_id: traceId,
    node: { span_id: spanId, span_name: "Evaluate", span_kind: "INTERNAL", span_status: "OK" },
  };
  const ctx = {
    connection: { rpc: { call: async (_channel, endpoint) => ({
      ok: true,
      value: endpoint === "evaluations/compute" ? comparison
        : endpoint === "facts/read" ? { items: [fact] }
          : { items: [traceItem] },
    }) } },
    slots: {
      inject(_name, factory) { factory(); },
      register(options, component) { components.set(options.name, component); return () => undefined; },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const runtime = createStudioClientPlugin({ React, Primitives: { Button: "button" }, Bi }).apply(ctx);
  runtime.controller.setSelection({ mode: "compare", leftTaskIds: ["task-a"], rightTaskIds: ["task-b"] });
  await runtime.controller.evaluate();

  let rendered = components.get("conversation.view")();
  assert.equal(elementsOf(rendered).some((element) => element.type === "wsr-compare-result"), true);

  runtime.controller.openReceipt();
  rendered = components.get("conversation.view")();
  assert.equal(elementsOf(rendered).filter((element) => element.type === "wsr-receipt-view").length, 2);

  runtime.controller.openFacts("delivery-cycle-time-ms@2.0.0");
  await runtime.controller.loadFacts({ delivery_id: "delivery-a", limit: 200 });
  rendered = components.get("conversation.view")();
  const evidence = elementsOf(rendered).find((element) => element.type === "wsr-evidence-console");
  assert.equal(evidence.props.rows[0].factId, "fact-1");
  assert.equal(evidence.props.rows[0].trace.traceId, traceId);

  runtime.controller.openTrace(traceId, spanId);
  await runtime.controller.loadTrace({ trace_id: traceId, limit: 200 });
  rendered = components.get("conversation.view")();
  assert.equal(elementsOf(rendered).some((element) => element.type === "wsr-trace-waterfall"), true);
  assert.match(textOf(rendered), /Waterfall/);
  assert.match(textOf(rendered), /Tree/);
});

test("the browser source has no direct downstream transport, credential, or mutation escape hatch", async () => {
  const root = resolve(import.meta.dirname, "../src/client");
  const source = `${await readFile(resolve(root, "studio.js"), "utf8")}\n${await readFile(resolve(root, "evaluate-model.js"), "utf8")}`;
  assert.doesNotMatch(source, /\bfetch\s*\(/u);
  assert.doesNotMatch(source, /127\.0\.0\.1|localhost|\/v1\/evidence|evaluations:compute/u);
  assert.doesNotMatch(source, /Authorization|Cookie|credentials/u);
  assert.doesNotMatch(source, /facts\/(?:write|delete)|traces\/(?:write|delete)|repository\/(?:write|commit)/u);
  assert.doesNotMatch(source, /function\s+(?:visualizerFor|metricResultCompatible|traceViewModel)\b/u);
  assert.doesNotMatch(source, /projectRecordedStructure/u);
  assert.doesNotMatch(source, /\.wsr-bi\s+[.#[]/u);
});
