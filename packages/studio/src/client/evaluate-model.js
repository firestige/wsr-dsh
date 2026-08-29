const STORAGE_KEY = "wsr.studio.location@1";
const MAX_URL_BYTES = 8 * 1024;
const TASK_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$/u;
const TRACE_ID = /^[a-f0-9]{32}$/u;
const SPAN_ID = /^[a-f0-9]{16}$/u;
const encoder = new TextEncoder();

function validIds(ids) {
  return Array.isArray(ids) && ids.length >= 1 && ids.length <= 24 &&
    ids.every((id) => typeof id === "string" && TASK_ID.test(id)) &&
    new Set(ids).size === ids.length;
}

function canonicalIds(ids) {
  if (!validIds(ids)) throw new Error("INVALID_SELECTION");
  return [...ids].sort((left, right) => {
    const leftBytes = encoder.encode(left);
    const rightBytes = encoder.encode(right);
    const length = Math.min(leftBytes.length, rightBytes.length);
    for (let index = 0; index < length; index += 1) {
      const difference = leftBytes[index] - rightBytes[index];
      if (difference !== 0) return difference;
    }
    return leftBytes.length - rightBytes.length;
  });
}

function selectionParams(selection) {
  if (selection.mode === "single") return [["task", canonicalIds(selection.taskIds)]];
  if (selection.mode === "compare") return [
    ["mode", ["compare"]],
    ["left_task", canonicalIds(selection.leftTaskIds)],
    ["right_task", canonicalIds(selection.rightTaskIds)],
  ];
  throw new Error("INVALID_SELECTION");
}

function appendSelection(params, selection) {
  params.set("v", "1");
  for (const [key, values] of selectionParams(selection)) for (const value of values) params.append(key, value);
}

function bounded(value) {
  if (encoder.encode(value).byteLength > MAX_URL_BYTES) throw new Error("STUDIO_URL_BOUND_EXCEEDED");
  return value;
}

export function serializeStudioLocation(route) {
  if (route.page === "select") return "/evaluate";
  const params = new URLSearchParams();
  appendSelection(params, route.selection);
  if (route.page === "results") return bounded(`/evaluate?${params}`);
  if (route.page === "receipt") return bounded(`/evaluate/receipt?${params}`);
  if (route.page === "facts") {
    params.set("metric", route.metric);
    params.set("scope", route.scope);
    return bounded(`/evaluate/facts?${params}`);
  }
  if (route.page === "trace" && TRACE_ID.test(route.traceId) && (route.spanId === undefined || SPAN_ID.test(route.spanId))) {
    if (route.spanId !== undefined) params.set("span", route.spanId);
    return bounded(`/evaluate/trace/${route.traceId}?${params}`);
  }
  throw new Error("UNKNOWN_STUDIO_ROUTE");
}

function parseSelection(params) {
  if (params.get("v") !== "1" || params.getAll("v").length !== 1) return undefined;
  if (params.get("mode") === "compare") {
    const leftTaskIds = params.getAll("left_task");
    const rightTaskIds = params.getAll("right_task");
    return validIds(leftTaskIds) && validIds(rightTaskIds)
      ? { mode: "compare", leftTaskIds: canonicalIds(leftTaskIds), rightTaskIds: canonicalIds(rightTaskIds) }
      : undefined;
  }
  if (params.has("mode")) return undefined;
  const taskIds = params.getAll("task");
  return validIds(taskIds) ? { mode: "single", taskIds: canonicalIds(taskIds) } : undefined;
}

function only(params, keys) {
  const allowed = new Set(keys);
  return [...params.keys()].every((key) => allowed.has(key));
}

export function parseStudioLocation(relativeUrl) {
  if (typeof relativeUrl !== "string" || encoder.encode(relativeUrl).byteLength > MAX_URL_BYTES) {
    return { page: "invalid", reason: "STUDIO_URL_BOUND_EXCEEDED" };
  }
  let url;
  try { url = new URL(relativeUrl, "http://studio.local"); } catch { return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" }; }
  if (url.origin !== "http://studio.local" || url.hash !== "") return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  if (url.pathname === "/evaluate" && url.search === "") return { page: "select" };
  if (
    url.pathname !== "/evaluate" &&
    url.pathname !== "/evaluate/receipt" &&
    url.pathname !== "/evaluate/facts" &&
    !url.pathname.startsWith("/evaluate/trace/")
  ) return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  const selection = parseSelection(url.searchParams);
  if (selection === undefined) return { page: "invalid", reason: "INVALID_SELECTION" };
  const baseKeys = selection.mode === "single" ? ["v", "task"] : ["v", "mode", "left_task", "right_task"];
  if (url.pathname === "/evaluate" && only(url.searchParams, baseKeys)) return { page: "results", selection };
  if (url.pathname === "/evaluate/receipt" && only(url.searchParams, baseKeys)) return { page: "receipt", selection };
  if (url.pathname === "/evaluate/facts" && only(url.searchParams, [...baseKeys, "metric", "scope"])) {
    const metric = url.searchParams.get("metric");
    const scope = url.searchParams.get("scope");
    if (metric !== null && metric.length <= 256 && ["result", "related", "read-set"].includes(scope)) {
      return { page: "facts", selection, metric, scope };
    }
  }
  if (url.pathname.startsWith("/evaluate/trace/") && only(url.searchParams, [...baseKeys, "span"])) {
    const traceId = url.pathname.slice("/evaluate/trace/".length);
    const spanId = url.searchParams.get("span") ?? undefined;
    if (TRACE_ID.test(traceId) && (spanId === undefined || SPAN_ID.test(spanId))) return { page: "trace", selection, traceId, ...(spanId === undefined ? {} : { spanId }) };
  }
  return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
}

function sideResults(result) {
  if (result?.mode === "SINGLE" && result.result?.tag === "SIDE_RESULT") {
    return [{ side: "single", value: result.result }];
  }
  if (result?.mode !== "COMPARE") return [];
  return [
    ...(result.left?.tag === "SIDE_RESULT" ? [{ side: "left", value: result.left }] : []),
    ...(result.right?.tag === "SIDE_RESULT" ? [{ side: "right", value: result.right }] : []),
  ];
}

export function projectStudioPresentation(snapshot) {
  const sides = sideResults(snapshot.result);
  const metrics = new Map();
  for (const { side, value } of sides) {
    for (const metric of value.metric_results ?? []) {
      const coordinate = `${metric.metric_id}@${metric.metric_version}`;
      const current = metrics.get(coordinate) ?? { coordinate, sides: [] };
      current.sides.push({ side, slices: metric.slices ?? [] });
      metrics.set(coordinate, current);
    }
  }
  return Object.freeze({
    mode: snapshot.result?.mode === "COMPARE" ? "compare" : snapshot.result?.mode === "SINGLE" ? "single" : "empty",
    phase: snapshot.phase,
    page: snapshot.route?.page ?? "select",
    metrics: Object.freeze([...metrics.values()]),
    deltas: Object.freeze(snapshot.result?.mode === "COMPARE" ? [...(snapshot.result.deltas ?? [])] : []),
    receipts: Object.freeze(sides.map(({ side, value }) => ({ side, receipt: value.receipt }))),
    facts: Object.freeze([...(snapshot.drilldown?.facts ?? [])]),
    trace: Object.freeze([...(snapshot.drilldown?.trace ?? [])]),
    drilldownError: snapshot.drilldown?.error,
  });
}

function bodyFor(selection) {
  if (selection.mode === "single") return {
    api_version: 1,
    mode: "SINGLE",
    selection: { selection_version: 1, task_ids: canonicalIds(selection.taskIds) },
  };
  return {
    api_version: 1,
    mode: "COMPARE",
    left: { selection_version: 1, task_ids: canonicalIds(selection.leftTaskIds) },
    right: { selection_version: 1, task_ids: canonicalIds(selection.rightTaskIds) },
  };
}

const incompatibleResponse = Object.freeze({
  code: "incompatible-response",
  message: "Studio received an incompatible formal API response",
});

function validTaskPage(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    value.contract?.name === "evidence.query" && value.contract?.revision === "1.0.0" &&
    value.observation_profile === "2.0.0" && value.read_model_revision === "2.0.0" &&
    typeof value.snapshot === "string" && value.snapshot !== "" &&
    Array.isArray(value.items) && value.items.length <= 200 &&
    (value.next_cursor === null || typeof value.next_cursor === "string");
}

function side(value) {
  return value?.tag === "SIDE_RESULT"
    ? Array.isArray(value.metric_results) && value.receipt !== null && typeof value.receipt === "object"
    : value?.tag === "SIDE_ERROR" && typeof value.code === "string";
}

function validComputeResponse(value) {
  if (value?.api_version !== 1) return false;
  if (value.mode === "SINGLE") return side(value.result) && value.result.tag === "SIDE_RESULT";
  return value.mode === "COMPARE" &&
    ["FULL_COMPARE", "PARTIAL_COMPARE"].includes(value.status) &&
    side(value.left) && side(value.right) && Array.isArray(value.deltas);
}

function initialRoute(storage, context) {
  const saved = storage?.getItem(STORAGE_KEY);
  if (saved !== null && saved !== undefined) {
    const parsed = parseStudioLocation(saved);
    if (parsed.page !== "invalid") return parsed;
  }
  return context?.taskId !== undefined && TASK_ID.test(context.taskId)
    ? { page: "results", selection: { mode: "single", taskIds: [context.taskId] } }
    : { page: "select" };
}

export function createEvaluateController({ gateway, storage, initialContext } = {}) {
  if (gateway === undefined || typeof gateway.call !== "function") throw new Error("STUDIO_GATEWAY_REQUIRED");
  const route = initialRoute(storage, initialContext);
  let snapshot = {
    phase: "idle",
    route,
    selection: route.selection,
    repository: initialContext?.repository,
    workspaceId: initialContext?.workspaceId,
    taskList: { phase: "idle", items: [] },
    drilldown: { phase: "idle", facts: [], trace: [] },
    result: undefined,
    error: undefined,
    refreshing: false,
  };
  const listeners = new Set();
  const publish = (change) => {
    snapshot = { ...snapshot, ...change };
    for (const listener of listeners) listener();
  };
  const persist = (nextRoute) => {
    snapshot = { ...snapshot, route: nextRoute };
    storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
    for (const listener of listeners) listener();
  };
  const controller = {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setSelection(selection) {
      bodyFor(selection);
      publish({ selection, route: { page: "results", selection }, phase: "idle", error: undefined });
      storage?.setItem(STORAGE_KEY, serializeStudioLocation({ page: "results", selection }));
    },
    setRepository(repository) {
      if (!boundedText(repository, 512)) throw new Error("INVALID_REPOSITORY");
      publish({ repository });
    },
    async loadTasks(cursor) {
      publish({ taskList: { ...snapshot.taskList, phase: "loading", error: undefined } });
      const answer = await gateway.call("tasks/list", { limit: 100, ...(cursor === undefined ? {} : { cursor }) });
      if (!answer.ok) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: answer.error } });
        return;
      }
      if (!validTaskPage(answer.value)) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: incompatibleResponse } });
        return;
      }
      const prior = cursor === undefined ? [] : snapshot.taskList.items;
      publish({ taskList: { phase: "ready", items: [...prior, ...(answer.value.items ?? [])], page: answer.value } });
    },
    async evaluate() {
      if (snapshot.selection === undefined) throw new Error("INVALID_SELECTION");
      const retaining = snapshot.result !== undefined;
      publish({ phase: retaining ? snapshot.phase : "loading", refreshing: retaining, error: undefined });
      const answer = await gateway.call("evaluations/compute", bodyFor(snapshot.selection));
      if (!answer.ok) {
        publish({ phase: retaining ? "degraded" : "error", refreshing: false, error: answer.error });
        return;
      }
      if (!validComputeResponse(answer.value)) {
        publish({ phase: retaining ? "degraded" : "error", refreshing: false, error: incompatibleResponse });
        return;
      }
      const phase = answer.value?.mode === "COMPARE" && answer.value.status === "PARTIAL_COMPARE" ? "partial" : "ready";
      const nextRoute = { page: "results", selection: snapshot.selection };
      snapshot = { ...snapshot, phase, refreshing: false, error: undefined, result: answer.value, route: nextRoute };
      storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
      for (const listener of listeners) listener();
    },
    async refresh() { await controller.evaluate(); },
    async loadFacts(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: undefined } });
      const answer = await gateway.call("facts/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", facts: answer.value.items ?? [], error: undefined } });
    },
    async loadTrace(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: undefined } });
      const answer = await gateway.call("traces/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", trace: answer.value.items ?? [], error: undefined } });
    },
    openReceipt() {
      if (snapshot.selection === undefined || snapshot.result === undefined) return;
      persist({ page: "receipt", selection: snapshot.selection });
    },
    openFacts(metric, scope = "result") {
      if (snapshot.selection === undefined) return;
      persist({ page: "facts", selection: snapshot.selection, metric, scope });
    },
    openTrace(traceId, spanId) {
      if (snapshot.selection === undefined) return;
      persist({ page: "trace", selection: snapshot.selection, traceId, ...(spanId === undefined ? {} : { spanId }) });
    },
    backToResults() {
      if (snapshot.selection === undefined) persist({ page: "select" });
      else persist({ page: "results", selection: snapshot.selection });
    },
  };
  return controller;
}

function boundedText(value, maximum) {
  return typeof value === "string" && value.trim() !== "" && value.length <= maximum;
}
