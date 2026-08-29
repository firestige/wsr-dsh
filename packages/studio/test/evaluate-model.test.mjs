import assert from "node:assert/strict";
import test from "node:test";

import {
  createEvaluateController,
  createBrowserStudioLocation,
  parseStudioLocation,
  projectStudioPresentation,
  serializeStudioLocation,
} from "../src/client/evaluate-model.js";

test("browser deep links preserve the host URL and refresh through history", () => {
  const calls = [];
  const location = { href: "https://harness.test/chat?keep=yes#anchor" };
  const history = { replaceState(_state, _title, href) { calls.push(href); location.href = href; } };
  const storage = createBrowserStudioLocation({ location, history });
  assert.equal(storage.getItem("ignored"), null);
  storage.setItem("ignored", "/evaluate?v=1&task=task-a");
  assert.equal(new URL(location.href).searchParams.get("wsr-studio"), "/evaluate?v=1&task=task-a");
  assert.equal(new URL(location.href).searchParams.get("keep"), "yes");
  assert.equal(new URL(location.href).hash, "#anchor");
  assert.equal(storage.getItem("ignored"), "/evaluate?v=1&task=task-a");
  storage.removeItem("ignored");
  assert.equal(new URL(location.href).searchParams.has("wsr-studio"), false);
  assert.equal(calls.length, 2);
});

const taskPage = {
  contract: { name: "evidence.query", revision: "1.0.0" },
  observation_profile: "2.0.0",
  read_model_revision: "2.0.0",
  snapshot: "tasks-1",
  items: [
    { task_id: "task-a", display_name: "Alpha" },
    { task_id: "task-b", display_name: "Beta" },
  ],
  next_cursor: null,
};

function singleResult(taskId = "task-a") {
  return {
    api_version: 1,
    mode: "SINGLE",
    result: {
      tag: "SIDE_RESULT",
      receipt: {
        selection: { selection_version: 1, task_ids: [taskId] },
        population_state: "COMPLETE",
        evidence_bindings: [],
        input_refs: [],
      },
      metric_results: [
        {
          metric_id: "delivery-cycle-time-ms",
          metric_version: "2.0.0",
          slices: [{ slice_key: {}, state: "AVAILABLE", value: { kind: "DURATION_MS", value: "12", unit: "ms" } }],
        },
      ],
    },
  };
}

test("deep links round-trip bounded single, compare, receipt, Fact and Trace views", () => {
  const routes = [
    { page: "select" },
    { page: "results", selection: { mode: "single", taskIds: ["task-a"] } },
    { page: "results", selection: { mode: "compare", leftTaskIds: ["task-a"], rightTaskIds: ["task-b"] } },
    { page: "receipt", selection: { mode: "single", taskIds: ["task-a"] } },
    { page: "facts", selection: { mode: "single", taskIds: ["task-a"] }, metric: "delivery-cycle-time-ms@2.0.0", scope: "result" },
    { page: "trace", selection: { mode: "single", taskIds: ["task-a"] }, traceId: "a".repeat(32), spanId: "b".repeat(16) },
  ];
  for (const route of routes) {
    assert.deepEqual(parseStudioLocation(serializeStudioLocation(route)), route);
  }
  assert.deepEqual(parseStudioLocation("/builder"), { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" });
  assert.deepEqual(parseStudioLocation(`/evaluate?v=1&task=${"x".repeat(129)}`), { page: "invalid", reason: "INVALID_SELECTION" });
});

test("Session context seeds the first selection but never prevents task or repository switching", async () => {
  const calls = [];
  const controller = createEvaluateController({
    gateway: {
      async call(endpoint, payload) {
        calls.push([endpoint, payload]);
        if (endpoint === "tasks/list") return { ok: true, value: taskPage };
        return { ok: true, value: singleResult(payload.selection.task_ids[0]) };
      },
    },
    initialContext: { taskId: "task-a", workspaceId: "workspace-1", repository: "repo-a" },
  });
  assert.deepEqual(controller.getSnapshot().selection, { mode: "single", taskIds: ["task-a"] });
  controller.setSelection({ mode: "single", taskIds: ["task-b"] });
  controller.setRepository("repo-b");
  await controller.evaluate();
  assert.equal(controller.getSnapshot().repository, "repo-b");
  assert.deepEqual(controller.getSnapshot().selection, { mode: "single", taskIds: ["task-b"] });
  assert.deepEqual(calls.at(-1)[1].selection.task_ids, ["task-b"]);
});

test("Session context can seed an unset repository once without replacing user choice", () => {
  const controller = createEvaluateController({ gateway: { call: async () => ({ ok: true, value: {} }) } });
  controller.seedContext({ repository: "/repo/session-a", workspaceId: "workspace-a" });
  assert.equal(controller.getSnapshot().repository, "/repo/session-a");
  assert.equal(controller.getSnapshot().workspaceId, "workspace-a");
  controller.setRepository("/repo/user-choice");
  controller.seedContext({ repository: "/repo/session-b", workspaceId: "workspace-b" });
  assert.equal(controller.getSnapshot().repository, "/repo/user-choice");
  assert.equal(controller.getSnapshot().workspaceId, "workspace-a");
});

test("Task discovery appends cursor pages with deterministic de-duplication", async () => {
  const controller = createEvaluateController({
    gateway: { async call(_endpoint, payload) {
      return { ok: true, value: { ...taskPage, items: payload.cursor === undefined
        ? [{ task_id: "task-b" }, { task_id: "task-a" }]
        : [{ task_id: "task-c" }, { task_id: "task-b" }], next_cursor: payload.cursor === undefined ? "next" : null } };
    } },
  });
  await controller.loadTasks();
  await controller.loadTasks("next");
  assert.deepEqual(controller.getSnapshot().taskList.items.map((item) => item.task_id), ["task-a", "task-b", "task-c"]);
  assert.equal(controller.getSnapshot().taskList.page.next_cursor, null);
});

test("reload restores the valid evaluate location and refresh recovery retains the last result", async () => {
  const storage = new Map();
  const persisted = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  let fail = false;
  const gateway = {
    async call(endpoint, payload) {
      if (endpoint === "tasks/list") return { ok: true, value: taskPage };
      if (fail) return { ok: false, error: { code: "downstream-unavailable", message: "Evaluate is temporarily unavailable" } };
      return { ok: true, value: singleResult(payload.selection.task_ids[0]) };
    },
  };
  const first = createEvaluateController({ gateway, storage: persisted });
  first.setSelection({ mode: "single", taskIds: ["task-a"] });
  await first.evaluate();
  first.openReceipt();

  const restored = createEvaluateController({ gateway, storage: persisted });
  assert.equal(restored.getSnapshot().route.page, "receipt");
  await restored.evaluate();
  fail = true;
  await restored.refresh();
  const snapshot = restored.getSnapshot();
  assert.equal(snapshot.phase, "degraded");
  assert.equal(snapshot.result.mode, "SINGLE");
  assert.equal(snapshot.error.code, "downstream-unavailable");
});

test("partial compare and unavailable Task discovery are scoped Studio states", async () => {
  const partial = {
    api_version: 1,
    mode: "COMPARE",
    status: "PARTIAL_COMPARE",
    left: singleResult().result,
    right: { tag: "SIDE_ERROR", code: "EVIDENCE_UNAVAILABLE", retryable: true, detail: "Right side unavailable" },
    deltas: [],
  };
  const controller = createEvaluateController({
    gateway: {
      async call(endpoint) {
        return endpoint === "tasks/list"
          ? { ok: false, error: { code: "downstream-unavailable", message: "Tasks unavailable" } }
          : { ok: true, value: partial };
      },
    },
  });
  await controller.loadTasks();
  assert.equal(controller.getSnapshot().taskList.phase, "error");
  controller.setSelection({ mode: "compare", leftTaskIds: ["task-a"], rightTaskIds: ["task-b"] });
  await controller.evaluate();
  assert.equal(controller.getSnapshot().phase, "partial");
  assert.equal(controller.getSnapshot().result.left.tag, "SIDE_RESULT");
});

test("receipt, Metric Result, compare delta, Fact and Trace remain distinct presentation responsibilities", () => {
  const comparison = {
    api_version: 1,
    mode: "COMPARE",
    status: "FULL_COMPARE",
    left: singleResult("task-a").result,
    right: singleResult("task-b").result,
    deltas: [{
      metric_coordinate: "delivery-cycle-time-ms@2.0.0",
      slice_key: {},
      state: "AVAILABLE",
      direction: "DECREASE",
      value: { kind: "DURATION_MS", value: "3", unit: "ms" },
    }],
  };
  const projected = projectStudioPresentation({
    phase: "ready",
    route: { page: "receipt", selection: { mode: "compare", leftTaskIds: ["task-a"], rightTaskIds: ["task-b"] } },
    result: comparison,
    drilldown: {
      phase: "ready",
      facts: [{ id: "fact-1", kind: "EVENT_CONTRIBUTION", truth: { availability: "AVAILABLE" } }],
      trace: [{ id: "node-1", kind: "NODE", trace_id: "a".repeat(32) }],
    },
  });
  assert.equal(projected.mode, "compare");
  assert.equal(projected.metrics[0].coordinate, "delivery-cycle-time-ms@2.0.0");
  assert.equal(projected.deltas[0].direction, "DECREASE");
  assert.deepEqual(projected.receipts.map((receipt) => receipt.side), ["left", "right"]);
  assert.equal(projected.facts[0].id, "fact-1");
  assert.equal(projected.trace[0].id, "node-1");
});

test("Fact and Trace drill-down use only read endpoints and failures retain the evaluation", async () => {
  const endpoints = [];
  const gateway = {
    async call(endpoint) {
      endpoints.push(endpoint);
      if (endpoint === "evaluations/compute") return { ok: true, value: singleResult() };
      if (endpoint === "facts/read") return { ok: true, value: { items: [{ id: "fact-1" }] } };
      return { ok: false, error: { code: "downstream-unavailable", message: "Trace unavailable" } };
    },
  };
  const controller = createEvaluateController({ gateway });
  controller.setSelection({ mode: "single", taskIds: ["task-a"] });
  await controller.evaluate();
  await controller.loadFacts({ delivery_id: "delivery-1", limit: 50 });
  await controller.loadTrace({ trace_id: "a".repeat(32), limit: 200 });
  const snapshot = controller.getSnapshot();
  assert.deepEqual(endpoints, ["evaluations/compute", "facts/read", "traces/read"]);
  assert.equal(snapshot.result.mode, "SINGLE");
  assert.equal(snapshot.phase, "ready");
  assert.equal(snapshot.drilldown.phase, "error");
  assert.equal(snapshot.drilldown.facts[0].id, "fact-1");
});

test("version-incompatible formal API envelopes degrade Studio without entering rendering", async () => {
  const controller = createEvaluateController({
    gateway: {
      async call(endpoint) {
        if (endpoint === "tasks/list") return { ok: true, value: { items: "not-an-array" } };
        return { ok: true, value: { api_version: 2, mode: "SINGLE" } };
      },
    },
  });
  await controller.loadTasks();
  assert.equal(controller.getSnapshot().taskList.phase, "error");
  assert.equal(controller.getSnapshot().taskList.error.code, "incompatible-response");
  controller.setSelection({ mode: "single", taskIds: ["task-a"] });
  await controller.evaluate();
  assert.equal(controller.getSnapshot().phase, "error");
  assert.equal(controller.getSnapshot().error.code, "incompatible-response");
  assert.equal(controller.getSnapshot().result, undefined);
});
