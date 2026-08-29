window.__ModuleLoader__.load({
  id: "dsh-wsr-studio",
  factory: (platformRequire) => {
    const require = platformRequire;
    const module = { exports: {} };
    const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/studio/src/client/browser-entry.js
var browser_entry_exports = {};
__export(browser_entry_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(browser_entry_exports);
var import_react = __toESM(require("react"), 1);
var Primitives = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);

// packages/studio/src/client/evaluate-model.js
var STORAGE_KEY = "wsr.studio.location@1";
var MAX_URL_BYTES = 8 * 1024;
var TASK_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$/u;
var TRACE_ID = /^[a-f0-9]{32}$/u;
var SPAN_ID = /^[a-f0-9]{16}$/u;
var encoder = new TextEncoder();
function createBrowserStudioLocation({ location, history } = globalThis) {
  if (location === void 0 || history === void 0) return void 0;
  return Object.freeze({
    getItem() {
      return new URL(location.href).searchParams.get("wsr-studio");
    },
    setItem(_key, value) {
      const url = new URL(location.href);
      url.searchParams.set("wsr-studio", value);
      history.replaceState(history.state ?? null, "", url.href);
    },
    removeItem() {
      const url = new URL(location.href);
      url.searchParams.delete("wsr-studio");
      history.replaceState(history.state ?? null, "", url.href);
    }
  });
}
function validIds(ids) {
  return Array.isArray(ids) && ids.length >= 1 && ids.length <= 24 && ids.every((id) => typeof id === "string" && TASK_ID.test(id)) && new Set(ids).size === ids.length;
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
    ["right_task", canonicalIds(selection.rightTaskIds)]
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
function serializeStudioLocation(route) {
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
  if (route.page === "trace" && TRACE_ID.test(route.traceId) && (route.spanId === void 0 || SPAN_ID.test(route.spanId))) {
    if (route.spanId !== void 0) params.set("span", route.spanId);
    return bounded(`/evaluate/trace/${route.traceId}?${params}`);
  }
  throw new Error("UNKNOWN_STUDIO_ROUTE");
}
function parseSelection(params) {
  if (params.get("v") !== "1" || params.getAll("v").length !== 1) return void 0;
  if (params.get("mode") === "compare") {
    const leftTaskIds = params.getAll("left_task");
    const rightTaskIds = params.getAll("right_task");
    return validIds(leftTaskIds) && validIds(rightTaskIds) ? { mode: "compare", leftTaskIds: canonicalIds(leftTaskIds), rightTaskIds: canonicalIds(rightTaskIds) } : void 0;
  }
  if (params.has("mode")) return void 0;
  const taskIds = params.getAll("task");
  return validIds(taskIds) ? { mode: "single", taskIds: canonicalIds(taskIds) } : void 0;
}
function only(params, keys) {
  const allowed = new Set(keys);
  return [...params.keys()].every((key) => allowed.has(key));
}
function parseStudioLocation(relativeUrl) {
  if (typeof relativeUrl !== "string" || encoder.encode(relativeUrl).byteLength > MAX_URL_BYTES) {
    return { page: "invalid", reason: "STUDIO_URL_BOUND_EXCEEDED" };
  }
  let url;
  try {
    url = new URL(relativeUrl, "http://studio.local");
  } catch {
    return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  }
  if (url.origin !== "http://studio.local" || url.hash !== "") return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  if (url.pathname === "/evaluate" && url.search === "") return { page: "select" };
  if (url.pathname !== "/evaluate" && url.pathname !== "/evaluate/receipt" && url.pathname !== "/evaluate/facts" && !url.pathname.startsWith("/evaluate/trace/")) return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  const selection = parseSelection(url.searchParams);
  if (selection === void 0) return { page: "invalid", reason: "INVALID_SELECTION" };
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
    const spanId = url.searchParams.get("span") ?? void 0;
    if (TRACE_ID.test(traceId) && (spanId === void 0 || SPAN_ID.test(spanId))) return { page: "trace", selection, traceId, ...spanId === void 0 ? {} : { spanId } };
  }
  return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
}
function sideResults(result) {
  if (result?.mode === "SINGLE" && result.result?.tag === "SIDE_RESULT") {
    return [{ side: "single", value: result.result }];
  }
  if (result?.mode !== "COMPARE") return [];
  return [
    ...result.left?.tag === "SIDE_RESULT" ? [{ side: "left", value: result.left }] : [],
    ...result.right?.tag === "SIDE_RESULT" ? [{ side: "right", value: result.right }] : []
  ];
}
function projectStudioPresentation(snapshot) {
  const sides = sideResults(snapshot.result);
  const metrics = /* @__PURE__ */ new Map();
  for (const { side: side2, value } of sides) {
    for (const metric of value.metric_results ?? []) {
      const coordinate = `${metric.metric_id}@${metric.metric_version}`;
      const current = metrics.get(coordinate) ?? { coordinate, sides: [] };
      current.sides.push({ side: side2, slices: metric.slices ?? [] });
      metrics.set(coordinate, current);
    }
  }
  return Object.freeze({
    mode: snapshot.result?.mode === "COMPARE" ? "compare" : snapshot.result?.mode === "SINGLE" ? "single" : "empty",
    phase: snapshot.phase,
    page: snapshot.route?.page ?? "select",
    metrics: Object.freeze([...metrics.values()]),
    deltas: Object.freeze(snapshot.result?.mode === "COMPARE" ? [...snapshot.result.deltas ?? []] : []),
    receipts: Object.freeze(sides.map(({ side: side2, value }) => ({ side: side2, receipt: value.receipt }))),
    facts: Object.freeze([...snapshot.drilldown?.facts ?? []]),
    trace: Object.freeze([...snapshot.drilldown?.trace ?? []]),
    drilldownError: snapshot.drilldown?.error
  });
}
function bodyFor(selection) {
  if (selection.mode === "single") return {
    api_version: 1,
    mode: "SINGLE",
    selection: { selection_version: 1, task_ids: canonicalIds(selection.taskIds) }
  };
  return {
    api_version: 1,
    mode: "COMPARE",
    left: { selection_version: 1, task_ids: canonicalIds(selection.leftTaskIds) },
    right: { selection_version: 1, task_ids: canonicalIds(selection.rightTaskIds) }
  };
}
var incompatibleResponse = Object.freeze({
  code: "incompatible-response",
  message: "Studio received an incompatible formal API response"
});
function validTaskPage(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && value.contract?.name === "evidence.query" && value.contract?.revision === "1.0.0" && value.observation_profile === "2.0.0" && value.read_model_revision === "2.0.0" && typeof value.snapshot === "string" && value.snapshot !== "" && Array.isArray(value.items) && value.items.length <= 200 && value.items.every((item) => item !== null && typeof item === "object" && TASK_ID.test(item.task_id)) && (value.next_cursor === null || typeof value.next_cursor === "string");
}
function side(value) {
  return value?.tag === "SIDE_RESULT" ? Array.isArray(value.metric_results) && value.receipt !== null && typeof value.receipt === "object" : value?.tag === "SIDE_ERROR" && typeof value.code === "string";
}
function validComputeResponse(value) {
  if (value?.api_version !== 1) return false;
  if (value.mode === "SINGLE") return side(value.result) && value.result.tag === "SIDE_RESULT";
  return value.mode === "COMPARE" && ["FULL_COMPARE", "PARTIAL_COMPARE"].includes(value.status) && side(value.left) && side(value.right) && Array.isArray(value.deltas);
}
function initialRoute(storage, context) {
  const saved = storage?.getItem(STORAGE_KEY);
  if (saved !== null && saved !== void 0) {
    const parsed = parseStudioLocation(saved);
    if (parsed.page !== "invalid") return parsed;
  }
  return context?.taskId !== void 0 && TASK_ID.test(context.taskId) ? { page: "results", selection: { mode: "single", taskIds: [context.taskId] } } : { page: "select" };
}
function createEvaluateController({ gateway, storage, initialContext } = {}) {
  if (gateway === void 0 || typeof gateway.call !== "function") throw new Error("STUDIO_GATEWAY_REQUIRED");
  const route = initialRoute(storage, initialContext);
  let snapshot = {
    phase: "idle",
    route,
    selection: route.selection,
    taskList: { phase: "idle", items: [] },
    drilldown: { phase: "idle", facts: [], trace: [] },
    result: void 0,
    error: void 0,
    refreshing: false
  };
  const listeners = /* @__PURE__ */ new Set();
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
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSelection(selection) {
      bodyFor(selection);
      publish({ selection, route: { page: "results", selection }, phase: "idle", error: void 0 });
      storage?.setItem(STORAGE_KEY, serializeStudioLocation({ page: "results", selection }));
    },
    async loadTasks(cursor) {
      publish({ taskList: { ...snapshot.taskList, phase: "loading", error: void 0 } });
      const answer = await gateway.call("tasks/list", { limit: 100, ...cursor === void 0 ? {} : { cursor } });
      if (!answer.ok) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: answer.error } });
        return;
      }
      if (!validTaskPage(answer.value)) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: incompatibleResponse } });
        return;
      }
      const prior = cursor === void 0 ? [] : snapshot.taskList.items;
      const byId = new Map([...prior, ...answer.value.items].map((item) => [item.task_id, item]));
      const items = [...byId.values()].sort((left, right) => canonicalIds([left.task_id, right.task_id])[0] === left.task_id ? -1 : 1);
      publish({ taskList: { phase: "ready", items, page: answer.value } });
    },
    async evaluate() {
      if (snapshot.selection === void 0) throw new Error("INVALID_SELECTION");
      const retaining = snapshot.result !== void 0;
      publish({ phase: retaining ? snapshot.phase : "loading", refreshing: retaining, error: void 0 });
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
      snapshot = { ...snapshot, phase, refreshing: false, error: void 0, result: answer.value, route: nextRoute };
      storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
      for (const listener of listeners) listener();
    },
    async refresh() {
      await controller.evaluate();
    },
    async loadFacts(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const answer = await gateway.call("facts/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", facts: answer.value.items ?? [], error: void 0 } });
    },
    async loadMetricFacts(metricCoordinate, scope = "result") {
      if (!["result", "related", "read-set"].includes(scope) || snapshot.result === void 0) return;
      const sides = sideResults(snapshot.result);
      const metric = sides.flatMap(({ value }) => value.metric_results ?? []).find((candidate) => `${candidate.metric_id}@${candidate.metric_version}` === metricCoordinate);
      if (metric === void 0) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: incompatibleResponse } });
        return;
      }
      const deliveryIds = [...new Set(sides.flatMap(({ value }) => value.receipt?.task_population ?? []).flatMap((task) => task.memberships ?? []).map((membership) => membership.delivery_id).filter((id) => boundedText(id, 256)))].sort();
      const resultRefs = new Set((metric.slices ?? []).flatMap((slice) => slice.provenance_refs ?? []));
      const readSetRefs = new Set(sides.flatMap(({ value }) => value.receipt?.input_refs ?? []).filter((reference) => reference.kind === "FACT").flatMap((reference) => [reference.identity, reference.provenance_ref]));
      const wanted = scope === "read-set" ? readSetRefs : resultRefs;
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const facts = [];
      for (const delivery_id of deliveryIds) {
        const answer = await gateway.call("facts/read", { delivery_id, limit: 200 });
        if (!answer.ok) {
          publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
          return;
        }
        if (!Array.isArray(answer.value?.items)) {
          publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: incompatibleResponse } });
          return;
        }
        facts.push(...answer.value.items);
      }
      const matches = (fact) => [fact?.id, fact?.provenance?.accepted_digest].some((identity) => wanted.has(identity));
      const selected = scope === "related" ? facts.filter((fact) => !matches(fact)) : facts.filter(matches);
      const returned = new Set(facts.flatMap((fact) => [fact?.id, fact?.provenance?.accepted_digest]));
      const references = [...wanted].sort().map((identity) => ({ identity, loadedAsFact: returned.has(identity) }));
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", facts: selected, references, error: void 0 } });
    },
    async loadTrace(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const answer = await gateway.call("traces/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", trace: answer.value.items ?? [], error: void 0 } });
    },
    openReceipt() {
      if (snapshot.selection === void 0 || snapshot.result === void 0) return;
      persist({ page: "receipt", selection: snapshot.selection });
    },
    openFacts(metric, scope = "result") {
      if (snapshot.selection === void 0) return;
      persist({ page: "facts", selection: snapshot.selection, metric, scope });
    },
    openTrace(traceId, spanId) {
      if (snapshot.selection === void 0) return;
      persist({ page: "trace", selection: snapshot.selection, traceId, ...spanId === void 0 ? {} : { spanId } });
    },
    backToResults() {
      if (snapshot.selection === void 0) persist({ page: "select" });
      else persist({ page: "results", selection: snapshot.selection });
    }
  };
  return controller;
}
function boundedText(value, maximum) {
  return typeof value === "string" && value.trim() !== "" && value.length <= maximum;
}

// packages/studio/src/client/studio.js
var STUDIO_PAGES = Object.freeze([
  Object.freeze({ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" })
]);
var ACCESSIBILITY = Object.freeze({
  routes: Object.freeze(STUDIO_PAGES.map((page) => page.label)),
  surface: "top-level-view",
  modal: false,
  landmarks: Object.freeze(["region", "navigation", "main"]),
  closeKey: "Escape",
  focusReturnsToTrigger: true,
  liveRegions: Object.freeze({ loading: "polite", error: "assertive" }),
  minimumTargetPixels: 44
});
function createStudioGatewayPort(ctx) {
  return Object.freeze({
    call(endpoint, payload, signal) {
      return ctx.connection.rpc.call("/wsr-studio", endpoint, payload, signal);
    }
  });
}
function createOpenStore() {
  let open = false;
  let trigger;
  let registerOverlay;
  let disposeOverlay;
  const listeners = /* @__PURE__ */ new Set();
  const publish = () => {
    for (const listener of listeners) listener();
  };
  const mount = () => {
    if (open && disposeOverlay === void 0 && registerOverlay !== void 0) disposeOverlay = registerOverlay();
  };
  return {
    getSnapshot: () => open,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    attach(register) {
      registerOverlay = register;
      mount();
      return () => {
        registerOverlay = void 0;
        const dispose = disposeOverlay;
        disposeOverlay = void 0;
        dispose?.();
      };
    },
    open(element) {
      trigger = element;
      open = true;
      mount();
      publish();
    },
    close() {
      open = false;
      const dispose = disposeOverlay;
      disposeOverlay = void 0;
      dispose?.();
      publish();
      trigger?.focus?.();
    }
  };
}
var frameStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1e3,
  overflow: "auto",
  maxWidth: "100vw",
  color: "var(--dsw-alias-label-primary)",
  background: "var(--dsw-alias-bg-base)",
  border: "1px solid var(--dsw-alias-border-l2)",
  padding: "clamp(12px, 3vw, 32px)",
  boxSizing: "border-box"
};
var controlStyle = { minHeight: "44px", minWidth: "44px" };
var listStyle = { maxHeight: "min(42vh, 480px)", overflow: "auto", overflowWrap: "anywhere" };
function StudioAction(React2, Button, store) {
  return function StudioActionView({ wide = true }) {
    return React2.createElement(Button, {
      type: "button",
      style: controlStyle,
      "aria-controls": "wsr-studio-view",
      "aria-current": store.getSnapshot() ? "page" : void 0,
      onClick: (event) => store.open(event.currentTarget)
    }, wide ? "WSR Studio" : "Studio");
  };
}
function StudioOverlay(React2, Primitives2, store, controller) {
  const Button = Primitives2.Button ?? "button";
  const DisclosureRow = Primitives2.DisclosureRow;
  const JsonTree = Primitives2.JsonTree;
  return function StudioOverlayView() {
    const snapshot = React2.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const close = () => store.close();
    React2.useEffect(() => {
      if (typeof document === "undefined") return void 0;
      const listener = (event) => {
        if (event.key === "Escape") close();
      };
      document.addEventListener("keydown", listener);
      return () => document.removeEventListener("keydown", listener);
    }, []);
    React2.useEffect(() => {
      if (snapshot.drilldown.phase !== "idle") return;
      if (snapshot.route.page === "facts" && snapshot.result !== void 0) {
        void controller.loadMetricFacts(snapshot.route.metric, snapshot.route.scope);
      }
      if (snapshot.route.page === "trace") void controller.loadTrace({
        trace_id: snapshot.route.traceId,
        limit: 200
      });
    }, [snapshot.route.page, snapshot.result]);
    const presentation = projectStudioPresentation(snapshot);
    const json = (data, label) => JsonTree === void 0 ? React2.createElement("pre", { "aria-label": label }, JSON.stringify(data, null, 2)) : React2.createElement(JsonTree, { data, label, copyable: true, expandTopLevel: true });
    const taskItems = snapshot.taskList.items ?? [];
    const current = snapshot.selection?.mode === "single" ? snapshot.selection.taskIds : [];
    const before = snapshot.selection?.mode === "compare" ? snapshot.selection.leftTaskIds : [];
    const after = snapshot.selection?.mode === "compare" ? snapshot.selection.rightTaskIds : [];
    const setTask = (id, checked) => {
      const taskIds = checked ? [.../* @__PURE__ */ new Set([...current, id])] : current.filter((value) => value !== id);
      if (taskIds.length > 0) controller.setSelection({ mode: "single", taskIds });
    };
    const setComparedTask = (side2, id, checked) => {
      const selected = side2 === "left" ? before : after;
      const taskIds = checked ? [.../* @__PURE__ */ new Set([...selected, id])] : selected.filter((value) => value !== id);
      if (taskIds.length === 0) return;
      controller.setSelection({
        mode: "compare",
        leftTaskIds: side2 === "left" ? taskIds : before,
        rightTaskIds: side2 === "right" ? taskIds : after
      });
    };
    const chooseMode = (mode) => {
      if (mode === snapshot.selection?.mode) return;
      const seed = current[0] ?? before[0] ?? after[0] ?? taskItems[0]?.task_id;
      if (seed === void 0) return;
      controller.setSelection(mode === "single" ? { mode: "single", taskIds: [seed] } : { mode: "compare", leftTaskIds: [seed], rightTaskIds: [seed] });
    };
    return React2.createElement(
      "section",
      {
        id: "wsr-studio-view",
        role: "region",
        "aria-labelledby": "wsr-studio-title",
        "data-wsr-studio-view": "evaluate",
        style: frameStyle,
        onKeyDown: (event) => {
          if (event.key === "Escape") close();
        }
      },
      React2.createElement(
        "header",
        null,
        React2.createElement("p", null, "Workflow Self-Recursive"),
        React2.createElement("h1", { id: "wsr-studio-title" }, "WSR Studio"),
        React2.createElement(Button, { type: "button", style: controlStyle, "aria-label": "Close WSR Studio", onClick: close }, "Close")
      ),
      React2.createElement("nav", { "aria-label": "Studio" }, ...STUDIO_PAGES.map((page) => React2.createElement("span", { key: page.id, "aria-current": page.id === "evaluate" ? "page" : void 0 }, page.label))),
      React2.createElement(
        "main",
        { tabIndex: -1 },
        snapshot.phase === "loading" || snapshot.refreshing ? React2.createElement("p", { role: "status", "aria-live": "polite" }, snapshot.refreshing ? "Refreshing evaluation\u2026" : "Loading evaluation\u2026") : null,
        snapshot.error === void 0 ? null : React2.createElement(
          "section",
          { role: "alert", "aria-live": "assertive" },
          React2.createElement("h2", null, snapshot.result === void 0 ? "Evaluate unavailable" : "Showing the last result"),
          React2.createElement("p", null, snapshot.error.message),
          React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.refresh() }, "Retry")
        ),
        React2.createElement(
          "section",
          { "aria-labelledby": "wsr-task-selection" },
          React2.createElement("h2", { id: "wsr-task-selection" }, "Task selection"),
          React2.createElement(
            "fieldset",
            null,
            React2.createElement("legend", null, "Evaluation mode"),
            React2.createElement(
              "label",
              null,
              React2.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "single", checked: snapshot.selection?.mode !== "compare", onChange: () => chooseMode("single") }),
              "Single"
            ),
            React2.createElement(
              "label",
              null,
              React2.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "compare", checked: snapshot.selection?.mode === "compare", onChange: () => chooseMode("compare") }),
              "Compare"
            )
          ),
          snapshot.taskList.phase === "idle" ? React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.loadTasks() }, "Load Tasks") : null,
          snapshot.taskList.phase === "error" ? React2.createElement("p", { role: "alert" }, "Task list unavailable; the current selection remains usable.") : null,
          snapshot.selection?.mode === "compare" ? React2.createElement("div", null, ...[["Before", "left", before], ["After", "right", after]].map(([label, side2, selected]) => React2.createElement(
            "fieldset",
            { key: side2 },
            React2.createElement("legend", null, label),
            ...taskItems.map((task) => React2.createElement(
              "label",
              { key: `${side2}-${task.task_id}` },
              React2.createElement("input", { type: "checkbox", checked: selected.includes(task.task_id), onChange: (event) => setComparedTask(side2, task.task_id, event.target.checked) }),
              task.display_name ?? task.task_id
            ))
          ))) : React2.createElement("ul", { style: listStyle }, ...taskItems.map((task) => React2.createElement(
            "li",
            { key: task.task_id },
            React2.createElement(
              "label",
              null,
              React2.createElement("input", { type: "checkbox", checked: current.includes(task.task_id), onChange: (event) => setTask(task.task_id, event.target.checked) }),
              task.display_name ?? task.task_id
            )
          ))),
          snapshot.taskList.phase === "ready" && taskItems.length === 0 ? React2.createElement("p", { role: "status" }, "No Tasks are available in Evidence.") : null,
          snapshot.taskList.page?.next_cursor ? React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.loadTasks(snapshot.taskList.page.next_cursor) }, "Load more Tasks") : null,
          React2.createElement(Button, { type: "button", style: controlStyle, disabled: snapshot.selection === void 0, onClick: () => controller.evaluate() }, "Evaluate selection")
        ),
        snapshot.result === void 0 ? React2.createElement("p", null, "Choose one or more Tasks to evaluate.") : React2.createElement(
          "section",
          { "aria-label": snapshot.result.mode === "COMPARE" ? "Compared Metric Results" : "Metric Results" },
          snapshot.phase === "partial" ? React2.createElement("p", { role: "status" }, "Partial comparison: the available side remains visible.") : null,
          React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.openReceipt() }, "View receipt"),
          ...presentation.metrics.map((metric) => {
            const coordinate = metric.coordinate;
            const content = React2.createElement(
              "article",
              { key: coordinate },
              React2.createElement("h3", null, coordinate),
              ...metric.sides.map(({ side: side2, slices }) => React2.createElement(
                "section",
                { key: side2, "aria-label": `${side2} Metric Result` },
                React2.createElement("h4", null, snapshot.result.mode === "COMPARE" ? `${side2} side` : "Metric Result value"),
                json(slices, `${coordinate} ${side2} slices`)
              )),
              React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => {
                controller.openFacts(coordinate);
              } }, "Fact drill-down")
            );
            return DisclosureRow === void 0 ? content : React2.createElement(DisclosureRow, {
              key: coordinate,
              title: coordinate,
              open: true,
              expandable: false
            }, content);
          }),
          ...presentation.deltas.map((delta) => React2.createElement(
            "p",
            { key: `${delta.metric_coordinate}-${JSON.stringify(delta.slice_key)}` },
            `${delta.metric_coordinate}: ${delta.state}${delta.direction === void 0 ? "" : ` \xB7 ${delta.direction}`}`
          ))
        ),
        snapshot.route.page === "receipt" ? React2.createElement(
          "section",
          { "aria-label": "Evaluation receipts" },
          React2.createElement("h2", null, "Receipts"),
          React2.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          ...presentation.receipts.map(({ side: side2, receipt }) => React2.createElement(
            "article",
            { key: side2 },
            React2.createElement("h3", null, side2),
            React2.createElement("p", null, `Population: ${receipt?.population_state ?? "unknown"}`),
            React2.createElement("p", null, `Evidence bindings: ${receipt?.evidence_bindings?.length ?? 0}`),
            json(receipt, `${side2} evaluation receipt`)
          ))
        ) : null,
        snapshot.route.page === "facts" ? React2.createElement(
          "section",
          { "aria-label": "Fact drill-down" },
          React2.createElement("h2", null, "Facts"),
          React2.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          presentation.drilldownError === void 0 ? null : React2.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...(snapshot.drilldown.references ?? []).filter((reference) => !reference.loadedAsFact).map((reference) => React2.createElement("p", { key: reference.identity }, `Recorded lineage not hydrated as a Fact: ${reference.identity}`)),
          ...presentation.facts.map((fact) => React2.createElement(
            "article",
            { key: fact.id },
            `${fact.kind ?? "Fact"} \xB7 ${fact.id}`,
            typeof fact.source?.trace_id === "string" ? React2.createElement(Button, { type: "button", onClick: () => {
              controller.openTrace(fact.source.trace_id, fact.source.span_id);
              void controller.loadTrace({ trace_id: fact.source.trace_id, limit: 200 });
            } }, "Open recorded trace") : null
          ))
        ) : null,
        snapshot.route.page === "trace" ? React2.createElement(
          "section",
          { "aria-label": "Recorded Trace drill-down" },
          React2.createElement("h2", null, "Recorded Trace"),
          React2.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          presentation.drilldownError === void 0 ? null : React2.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...presentation.trace.map((item) => React2.createElement("article", { key: item.id }, `${item.kind ?? "Trace item"} \xB7 ${item.id}`))
        ) : null
      )
    );
  };
}
function createStudioClientPlugin({ React: React2, Primitives: Primitives2 = {}, initialContext, storage } = {}) {
  if (React2 === void 0) throw new Error("STUDIO_REACT_REQUIRED");
  return {
    name: "wsr-studio-client",
    inject: ["connection", "slots"],
    apply(ctx) {
      const store = createOpenStore();
      const resolvedStorage = storage ?? (typeof window === "undefined" ? void 0 : createBrowserStudioLocation(window));
      const controller = createEvaluateController({
        gateway: createStudioGatewayPort(ctx),
        initialContext,
        storage: resolvedStorage
      });
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "wsr-studio",
        order: 60,
        label: "WSR Studio"
      }, StudioAction(React2, Primitives2.Button ?? "button", store)));
      ctx.slots.inject("shell.overlay", () => store.attach(() => ctx.slots.register({
        name: "shell.overlay",
        id: "wsr-studio",
        order: 60
      }, StudioOverlay(React2, Primitives2, store, controller))));
      if (controller.getSnapshot().route.page !== "select") store.open();
      return Object.assign(() => void 0, { controller, store });
    }
  };
}

// packages/studio/src/client/browser-entry.js
var plugin = createStudioClientPlugin({ React: import_react.default, Primitives });
var name = plugin.name;
var inject = plugin.inject;
var apply = plugin.apply;

    return module.exports;
  },
});
