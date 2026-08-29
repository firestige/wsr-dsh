window.__ModuleLoader__.load({
  id: "dsh-wsr-execution",
  factory: (require) => {
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

// packages/execution/src/client/browser-entry.js
var browser_entry_exports = {};
__export(browser_entry_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(browser_entry_exports);
var import_react = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var workspaceUi = __toESM(require("@deepseek-ai/dsh-client-ui-workspace"), 1);

// packages/execution/src/action-presentation/model.js
var DSH_ACTION_PRESENTATION_COMPATIBILITY = Object.freeze({
  dsh: "0.1.1-rc.2",
  uiPrimitives: "@deepseek-ai/dsh-client-ui-primitives@0.1.1-rc.2",
  presentation: "wsr.presentation@1.0.0"
});
var ROOT_KEYS = "correlation,data,kind,schemaVersion";
var KINDS = /* @__PURE__ */ new Set([
  "command-accepted",
  "delivery-running",
  "delivery-list",
  "delivery-status",
  "action-output",
  "action-input-request",
  "terminal-result",
  "error"
]);
var ACTION_STATES = /* @__PURE__ */ new Set(["running", "completed", "failed", "cancelled", "waiting", "recovering"]);
var TERMINAL_OUTCOMES = /* @__PURE__ */ new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);
var DELIVERY_STATES = /* @__PURE__ */ new Set([
  "BOUND",
  "START_UNCERTAIN",
  "RUNNING_CORRELATED",
  "START_FAILED",
  "RESULT_UNRESOLVED",
  "TERMINAL_HANDLING",
  "RUNNING",
  "RECOVERING",
  "WAITING",
  "AWAITING_INPUT",
  "COMPLETED",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED"
]);
var MAX_PRESENTATION_BYTES = 4096;
function deepFreeze(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}
function invalidPresentation() {
  return deepFreeze({
    schemaVersion: DSH_ACTION_PRESENTATION_COMPATIBILITY.presentation,
    correlation: "presentation-invalid",
    kind: "error",
    data: { code: "WSR_PRESENTATION_INVALID", message: "WSR presentation unavailable" }
  });
}
function plainJson(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.every((item) => plainJson(item, seen));
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Reflect.ownKeys(value).every((key) => typeof key === "string" && descriptors[key] !== void 0 && "value" in descriptors[key] && plainJson(descriptors[key].value, seen));
}
function hasValidTypedData(value) {
  if (value.kind === "action-output") {
    const state = value.data.state === void 0 ? "completed" : value.data.state;
    const channel = value.data.channel === void 0 ? "action" : value.data.channel;
    return typeof state === "string" && ACTION_STATES.has(state) && (channel === "action" || channel === "tool");
  }
  if (value.kind === "terminal-result") {
    const outputValid = Object.hasOwn(value.data, "finalOutput") ? typeof value.data.finalOutput === "string" && value.data.finalOutput.length > 0 : typeof value.data.summary === "string" && value.data.summary.length > 0;
    return typeof value.data.outcome === "string" && TERMINAL_OUTCOMES.has(value.data.outcome) && outputValid;
  }
  if (value.kind === "delivery-running" || value.kind === "delivery-status") {
    return value.data.state === void 0 || typeof value.data.state === "string" && DELIVERY_STATES.has(value.data.state);
  }
  return true;
}
function parseExecutionPresentation(input) {
  let value = input;
  if (typeof input === "string") {
    if (input.length === 0 || new TextEncoder().encode(input).byteLength > MAX_PRESENTATION_BYTES) return invalidPresentation();
    try {
      value = JSON.parse(input);
    } catch {
      return invalidPresentation();
    }
  }
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.keys(value).sort().join(",") !== ROOT_KEYS || value.schemaVersion !== DSH_ACTION_PRESENTATION_COMPATIBILITY.presentation || typeof value.correlation !== "string" || value.correlation.length === 0 || !KINDS.has(value.kind) || value.data === null || typeof value.data !== "object" || Array.isArray(value.data) || !plainJson(value.data) || !hasValidTypedData(value)) return invalidPresentation();
  return deepFreeze(structuredClone(value));
}
function text(value, keys = ["text", "message", "question", "summary", "result"]) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const lines = value.map((item) => text(item, keys)).filter((item) => typeof item === "string" && item.length > 0);
    return lines.length === 0 ? void 0 : lines.join("\n\n");
  }
  if (value === null || typeof value !== "object") return void 0;
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) continue;
    const nested = text(value[key], keys);
    if (nested !== void 0) return nested;
  }
  return void 0;
}
function normalizedLifecycle(value, fallback) {
  if (typeof value !== "string") return fallback;
  const normalized = value.toLowerCase().replaceAll("_", "-");
  if (["succeeded", "success", "done", "terminal"].includes(normalized)) return "completed";
  if (["failed", "error"].includes(normalized)) return "failed";
  if (["cancelled", "canceled"].includes(normalized)) return "cancelled";
  if (["waiting", "awaiting-input"].includes(normalized)) return "waiting";
  if (["start-failed"].includes(normalized)) return "failed";
  if (["recovering", "recovery", "running-correlated", "result-unresolved", "terminal-handling"].includes(normalized)) return "recovering";
  if (["running", "accepted", "start-uncertain", "bound"].includes(normalized)) return "running";
  return fallback;
}
var STATE_LABELS = Object.freeze({
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  waiting: "Waiting for input",
  recovering: "Recovering"
});
function model(input) {
  return deepFreeze(input);
}
function projectExecutionPresentation(event) {
  const { correlation, data } = event;
  if (event.kind === "delivery-list") throw new TypeError("WSR_PRESENTATION_OUT_OF_SCOPE");
  if (event.kind === "terminal-result") {
    const state2 = normalizedLifecycle(data.outcome, "failed");
    const body = typeof data.finalOutput === "string" ? data.finalOutput : data.summary;
    return model({
      correlation,
      layer: "final",
      state: state2,
      title: "Final result",
      summary: data.outcome[0] + data.outcome.slice(1).toLowerCase(),
      body,
      defaultOpen: true,
      focusPolicy: "none",
      role: "article",
      compatibility: typeof data.finalOutput === "string" ? "current" : "legacy-summary"
    });
  }
  if (event.kind === "action-input-request") {
    return model({
      correlation,
      layer: "action",
      state: "waiting",
      title: typeof data.label === "string" ? data.label : "Workflow Action",
      summary: STATE_LABELS.waiting,
      body: text(data.prompt) ?? "Input required",
      defaultOpen: true,
      focusPolicy: "preserve",
      role: "status",
      compatibility: "current"
    });
  }
  if (event.kind === "action-output") {
    const state2 = data.state ?? "completed";
    return model({
      correlation,
      layer: data.channel === "tool" ? "tool" : "action",
      state: state2,
      title: typeof data.label === "string" ? data.label : "Workflow Action",
      summary: STATE_LABELS[state2],
      body: text(data.content) ?? "WSR content unavailable",
      defaultOpen: state2 !== "completed",
      focusPolicy: "none",
      role: "status",
      compatibility: "current"
    });
  }
  if (event.kind === "error") {
    return model({
      correlation,
      layer: "progress",
      state: "failed",
      title: "Workflow presentation",
      summary: typeof data.code === "string" ? data.code : "WSR_ERROR",
      body: typeof data.message === "string" ? data.message : "WSR presentation unavailable",
      defaultOpen: true,
      focusPolicy: "none",
      role: "alert",
      compatibility: "current"
    });
  }
  const state = event.kind === "delivery-running" ? normalizedLifecycle(data.state, "running") : normalizedLifecycle(data.state, event.kind === "command-accepted" ? "running" : "running");
  const deliveryId = typeof data.deliveryId === "string" ? data.deliveryId : void 0;
  return model({
    correlation,
    layer: "progress",
    state,
    title: "Workflow delivery",
    summary: `${STATE_LABELS[state]}${deliveryId === void 0 ? "" : ` \xB7 ${deliveryId}`}`,
    body: void 0,
    defaultOpen: state !== "completed",
    focusPolicy: "none",
    role: "status",
    compatibility: "current"
  });
}
function resolveDisclosureOpen({ current, previousState, nextState, containsFocus }) {
  if (nextState === "waiting") return true;
  if (nextState === "completed" && previousState !== "completed") return containsFocus ? true : false;
  if (["running", "recovering", "failed", "cancelled"].includes(nextState) && nextState !== previousState) return true;
  return current;
}
function createExecutionPresentationDefinition() {
  return Object.freeze({
    kind: "wsr-execution-presentation",
    target: "chat",
    match(event) {
      if (event?.type === "command/run" && event.data?.name === "wsr" && event.data?.source?.kind === "plugin" && event.data?.source?.plugin === "workflow-execution" && typeof event.data?.commandId === "string") {
        return { id: event.data.commandId, role: "start" };
      }
      return event?.type === "command/done" && typeof event.data?.commandId === "string" ? { id: event.data.commandId, role: "update" } : null;
    },
    start(_context, match) {
      return Object.freeze({ seq: match.event.seq, presentation: void 0 });
    },
    update(context, match) {
      const event = parseExecutionPresentation(match.event?.data?.text);
      if (event.kind === "delivery-list") {
        return Object.freeze({ ...context.state, presentation: void 0 });
      }
      return Object.freeze({ ...context.state, presentation: projectExecutionPresentation(event) });
    },
    buildViewNode(context) {
      if (context.state?.presentation === void 0) return null;
      return Object.freeze({
        key: context.key,
        kind: "wsr-execution-presentation",
        id: context.id,
        target: "chat",
        anchorSeq: context.state.seq,
        location: context.start?.location ?? { kind: "unresolved" },
        visibility: "visible",
        data: context.state.presentation
      });
    }
  });
}

// packages/execution/src/action-presentation/view.js
var DOT_STATE = Object.freeze({
  running: "ongoing",
  recovering: "ongoing",
  completed: "done",
  waiting: "warning",
  failed: "error",
  cancelled: "error"
});
function createActionPresentationView({ React: React2, DisclosureRow: DisclosureRow2, MessageText: MessageText2, StateDot: StateDot2, observe = () => void 0 }) {
  if (typeof DisclosureRow2 !== "function") throw new TypeError("DSH_DISCLOSURE_ROW_REQUIRED");
  return function WsrExecutionPresentationView({ node }) {
    const presentation = node.data;
    const [open, setOpen] = React2.useState(presentation.defaultOpen);
    const bodyRef = React2.useRef(null);
    const previousState = React2.useRef(presentation.state);
    React2.useEffect(() => {
      setOpen((current) => resolveDisclosureOpen({
        current,
        previousState: previousState.current,
        nextState: presentation.state,
        containsFocus: typeof document !== "undefined" && bodyRef.current !== null && bodyRef.current.contains(document.activeElement)
      }));
      previousState.current = presentation.state;
    }, [presentation.state]);
    observe(presentation);
    if (presentation.layer === "final") {
      return React2.createElement("article", {
        "data-wsr-presentation": "true",
        "data-wsr-layer": "final",
        "data-wsr-state": presentation.state,
        "data-wsr-correlation": presentation.correlation,
        "data-wsr-chat-role": "assistant",
        "data-wsr-compatibility": presentation.compatibility,
        "aria-label": presentation.title
      }, React2.createElement(MessageText2, { text: presentation.body }));
    }
    const waiting = presentation.state === "waiting";
    const expandable = presentation.body !== void 0 && !waiting;
    const body = presentation.body === void 0 ? void 0 : React2.createElement("div", {
      ref: bodyRef,
      "data-wsr-presentation": "true",
      "data-wsr-layer": presentation.layer,
      "data-wsr-state": presentation.state,
      "data-wsr-correlation": presentation.correlation,
      "data-wsr-action-input": waiting ? "true" : void 0,
      role: waiting ? "group" : void 0,
      tabIndex: waiting ? 0 : void 0,
      "aria-label": waiting ? presentation.summary : void 0,
      "aria-live": waiting ? "polite" : void 0
    }, React2.createElement("pre", {
      style: { margin: 0, maxHeight: "20rem", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }
    }, presentation.body));
    return React2.createElement(DisclosureRow2, {
      icon: React2.createElement(StateDot2, { state: DOT_STATE[presentation.state], size: 10 }),
      title: presentation.title,
      open: waiting ? true : open,
      expandable,
      onToggle: waiting ? () => void 0 : () => setOpen((current) => !current),
      expandOnRowClick: expandable,
      // The locked primitive animates its hover-preview icon without a
      // reduced-motion branch. Keeping that optional preview off preserves the
      // same keyboard disclosure while making WSR rows motion-free.
      previewChevron: false,
      keepContentWhenOpen: true,
      collapsedContent: React2.createElement("span", {
        role: presentation.role,
        "aria-live": ["running", "recovering", "waiting"].includes(presentation.state) ? "polite" : void 0
      }, presentation.summary)
    }, body);
  };
}
function registerActionPresentation(ctx, View) {
  ctx.conversationEvents.register(createExecutionPresentationDefinition());
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "wsr-execution-presentation"
  }, View));
}

// packages/execution/src/client/delivery/control-plane-port.js
var CHANNEL = "/wsr-execution";
function createStore(initial) {
  let snapshot = initial;
  const listeners = /* @__PURE__ */ new Set();
  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish(value) {
      snapshot = Object.freeze(value);
      for (const listener of [...listeners]) listener();
    }
  });
}
function message(error) {
  return typeof error?.message === "string" && error.message.length > 0 ? error.message : "Delivery control plane unavailable";
}
function createDeliveryControlPlaneClient(rpc) {
  if (typeof rpc?.call !== "function") throw new TypeError("DSH_CONNECTION_RPC_REQUIRED");
  const inventory = createStore(Object.freeze({ kind: "loading" }));
  const sessions = /* @__PURE__ */ new Map();
  const read = async (endpoint, payload) => {
    const result = await rpc.call(CHANNEL, endpoint, payload);
    if (result?.ok !== true) throw new Error(message(result?.error));
    return result.value;
  };
  const client = {
    inventory,
    async refresh() {
      try {
        const value = await read("inventory/read", {});
        inventory.publish({ kind: "ready", snapshot: value });
        for (const source of sessions.values()) void source.refresh();
      } catch (error) {
        const previous = inventory.getSnapshot();
        inventory.publish({
          kind: previous.kind === "ready" ? "reconnecting" : "error",
          message: message(error),
          ...previous.kind === "ready" ? { snapshot: previous.snapshot } : {}
        });
      }
    },
    bindSession(sessionCorrelation) {
      if (typeof sessionCorrelation !== "string" || sessionCorrelation.length === 0 || sessionCorrelation.length > 512) {
        throw new TypeError("SESSION_CORRELATION_INVALID");
      }
      if (sessions.has(sessionCorrelation)) return sessions.get(sessionCorrelation);
      const store = createStore(Object.freeze({ kind: "loading" }));
      const source = Object.freeze({
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        async refresh() {
          try {
            store.publish({ kind: "ready", view: await read("session/read", { sessionCorrelation }) });
          } catch (error) {
            store.publish({ kind: "error", code: "DELIVERY_PROJECTION_UNAVAILABLE", message: message(error) });
          }
        }
      });
      sessions.set(sessionCorrelation, source);
      return source;
    }
  };
  return Object.freeze(client);
}

// packages/execution/src/client/delivery/session-delivery-view.js
var DELIVERY_VIEW_ID = "delivery";
var DELIVERY_VIEW_ORDER = 20;
var SHA256 = /^sha256:[0-9a-f]{64}$/u;
var LIFECYCLES = /* @__PURE__ */ new Set([
  "BOUND",
  "START_UNCERTAIN",
  "RUNNING_CORRELATED",
  "START_FAILED",
  "RESULT_UNRESOLVED",
  "TERMINAL_HANDLING",
  "TERMINAL"
]);
function nonEmpty(value) {
  return typeof value === "string" && value.length > 0;
}
function validDelivery(delivery, sessionCorrelation) {
  return delivery !== null && typeof delivery === "object" && !Array.isArray(delivery) && nonEmpty(delivery.deliveryId) && SHA256.test(delivery.deliveryBindingIdentity) && nonEmpty(delivery.task?.identity) && nonEmpty(delivery.workflow?.identity) && nonEmpty(delivery.workflow?.packageName) && nonEmpty(delivery.workflow?.exactPackageVersion) && SHA256.test(delivery.workflow?.packageDigest) && nonEmpty(delivery.workflow?.snapshotIdentity) && SHA256.test(delivery.workflow?.snapshotDigest) && LIFECYCLES.has(delivery.lifecycle) && delivery.navigation?.sessionCorrelation === sessionCorrelation && delivery.detached === false && typeof delivery.recoverable === "boolean" && Number.isSafeInteger(delivery.timing?.startedAt) && Number.isSafeInteger(delivery.timing?.updatedAt) && Number.isSafeInteger(delivery.timing?.elapsedMs) && delivery.timing.elapsedMs >= 0;
}
function duration(value) {
  const seconds = Math.floor(value / 1e3);
  if (seconds < 60) return `${seconds}.${String(value % 1e3).padStart(3, "0")}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
function safeSnapshot(source) {
  try {
    return source.getSnapshot();
  } catch {
    return { kind: "error", code: "DELIVERY_PROJECTION_UNAVAILABLE", message: "Execution projection unavailable" };
  }
}
function safeSubscribe(source, notify) {
  try {
    const dispose = source.subscribe(notify);
    return typeof dispose === "function" ? dispose : () => void 0;
  } catch {
    return () => void 0;
  }
}
function pair(React2, label, value) {
  return [
    React2.createElement("dt", { key: `${label}-label` }, label),
    React2.createElement("dd", { key: `${label}-value` }, value)
  ];
}
function statePanel(React2, role, code, message2) {
  return React2.createElement(
    "section",
    {
      "aria-labelledby": "wsr-delivery-view-title",
      "aria-live": role === "alert" ? "assertive" : "polite",
      "data-wsr-delivery-view": "true",
      role
    },
    React2.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
    React2.createElement("p", null, message2),
    code === void 0 ? null : React2.createElement("code", null, code)
  );
}
function createSessionDeliveryView(React2) {
  if (typeof React2?.createElement !== "function" || typeof React2?.useSyncExternalStore !== "function") {
    throw new TypeError("DELIVERY_VIEW_REACT_INVALID");
  }
  return function SessionDeliveryView({ sessionId, source }) {
    const state = React2.useSyncExternalStore(
      (notify) => safeSubscribe(source, notify),
      () => safeSnapshot(source),
      () => safeSnapshot(source)
    );
    if (state.kind === "loading") return statePanel(React2, "status", void 0, "Loading Delivery\u2026");
    if (state.kind === "error") return statePanel(React2, "alert", state.code ?? "DELIVERY_PROJECTION_UNAVAILABLE", state.message ?? "Execution projection unavailable");
    const view = state.view;
    if (state.kind !== "ready" || view?.sessionCorrelation !== sessionId) {
      return statePanel(React2, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    if (view.kind === "UNBOUND") return statePanel(React2, "status", void 0, "No Delivery bound to this Session");
    if (view.kind !== "BOUND" || !validDelivery(view.delivery, sessionId)) {
      return statePanel(React2, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    const delivery = view.delivery;
    const failed = delivery.terminal?.outcome === "FAILED" || delivery.error !== null;
    const identityRows = [
      ...pair(React2, "Delivery", delivery.deliveryId),
      ...pair(React2, "Task", delivery.task.displayName ?? delivery.task.identity),
      ...pair(React2, "Workflow", delivery.workflow.identity),
      ...pair(React2, "Package", `${delivery.workflow.packageName}@${delivery.workflow.exactPackageVersion}`),
      ...pair(React2, "Package digest", delivery.workflow.packageDigest),
      ...pair(React2, "Snapshot", delivery.workflow.snapshotIdentity),
      ...pair(React2, "Snapshot digest", delivery.workflow.snapshotDigest),
      ...pair(React2, "Binding", delivery.deliveryBindingIdentity)
    ];
    const lifecycleRows = [
      ...pair(React2, "Lifecycle", delivery.lifecycle),
      ...pair(React2, "Recoverable", delivery.recoverable ? "yes" : "no"),
      ...delivery.current === null ? [] : pair(React2, delivery.current.kind === "ACTION" ? "Current Action" : "Current Intervention", delivery.current.identity),
      ...pair(React2, "Started", new Date(delivery.timing.startedAt).toISOString()),
      ...pair(React2, "Elapsed", duration(delivery.timing.elapsedMs)),
      ...delivery.terminal === null ? [] : [
        ...pair(React2, "Ended", new Date(delivery.terminal.finishedAt).toISOString()),
        ...pair(React2, "Outcome", delivery.terminal.outcome)
      ],
      ...delivery.error === null ? [] : pair(React2, "Error", delivery.error.code)
    ];
    return React2.createElement(
      "section",
      {
        "aria-labelledby": "wsr-delivery-view-title",
        "aria-live": failed ? "assertive" : "polite",
        "data-wsr-delivery-id": delivery.deliveryId,
        "data-wsr-delivery-view": "true",
        role: failed ? "alert" : "region"
      },
      React2.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
      React2.createElement("dl", { "aria-label": "Delivery identity" }, identityRows),
      React2.createElement("dl", { "aria-label": "Delivery lifecycle" }, lifecycleRows)
    );
  };
}
function registerSessionDeliveryView(ctx, options) {
  if (typeof ctx?.slots?.inject !== "function" || typeof ctx?.slots?.register !== "function" || typeof options?.bindProjection !== "function") throw new TypeError("DELIVERY_VIEW_REGISTRATION_INVALID");
  const View = createSessionDeliveryView(options.React);
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view",
    id: DELIVERY_VIEW_ID,
    order: DELIVERY_VIEW_ORDER,
    label: "Delivery",
    inject: (sessionId) => ({ source: options.bindProjection(sessionId) })
  }, View));
}

// packages/execution/src/client/delivery-inventory/model.js
var CONTROL_PLANE_SCHEMA = "execution.delivery-control-plane@1.0.0";
var LIFECYCLES2 = /* @__PURE__ */ new Set([
  "BOUND",
  "START_UNCERTAIN",
  "RUNNING_CORRELATED",
  "START_FAILED",
  "RESULT_UNRESOLVED",
  "TERMINAL_HANDLING",
  "TERMINAL"
]);
function errorView(label = "Delivery inventory unavailable") {
  return Object.freeze({ kind: "error", role: "alert", label, rows: Object.freeze([]) });
}
function validString(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 512;
}
function lifecycleLabel(delivery) {
  if (delivery.lifecycle === "TERMINAL") return delivery.terminal?.outcome ?? "Terminal";
  return delivery.lifecycle.toLowerCase().replaceAll("_", " ").replace(/^./u, (value) => value.toUpperCase());
}
function rowsFrom(deliveries, selectedSessionId) {
  if (!Array.isArray(deliveries)) return void 0;
  const identities = /* @__PURE__ */ new Set();
  const rows = [];
  for (const delivery of deliveries) {
    const sessionCorrelation = delivery?.navigation?.sessionCorrelation ?? null;
    if (delivery === null || typeof delivery !== "object" || Array.isArray(delivery) || !validString(delivery.deliveryId) || identities.has(delivery.deliveryId) || !LIFECYCLES2.has(delivery.lifecycle) || typeof delivery.detached !== "boolean" || typeof delivery.recoverable !== "boolean" || !validString(delivery.task?.identity) || !(delivery.task.displayName === null || validString(delivery.task.displayName)) || !(sessionCorrelation === null || validString(sessionCorrelation))) return void 0;
    identities.add(delivery.deliveryId);
    rows.push(Object.freeze({
      deliveryId: delivery.deliveryId,
      label: delivery.task.displayName ?? delivery.task.identity,
      statusLabel: lifecycleLabel(delivery),
      sessionId: sessionCorrelation,
      availability: sessionCorrelation !== null ? "bound" : delivery.recoverable ? "recoverable" : "detached",
      selected: sessionCorrelation !== null && sessionCorrelation === selectedSessionId
    }));
  }
  rows.sort((left, right) => left.deliveryId.localeCompare(right.deliveryId));
  return Object.freeze(rows);
}
function projectDeliveryInventory(state, { selectedSessionId } = {}) {
  if (state?.kind === "loading") return Object.freeze({ kind: "loading", role: "status", label: "Loading Deliveries", rows: Object.freeze([]) });
  if (state?.kind === "error") return errorView(validString(state.message) ? state.message : void 0);
  if (!(/* @__PURE__ */ new Set(["ready", "reconnecting"])).has(state?.kind)) return errorView();
  const snapshot = state.snapshot;
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot) || snapshot.schemaVersion !== CONTROL_PLANE_SCHEMA || !Number.isSafeInteger(snapshot.generation) || snapshot.generation < 1) return errorView();
  const rows = rowsFrom(snapshot.deliveries, selectedSessionId);
  if (rows === void 0) return errorView();
  if (state.kind === "reconnecting") return Object.freeze({ kind: "reconnecting", role: "status", label: "Reconnecting to Delivery inventory", rows });
  if (rows.length === 0) return Object.freeze({ kind: "empty", role: "status", label: "No Deliveries", rows });
  return Object.freeze({ kind: "ready", role: "list", label: "Deliveries", rows });
}

// packages/execution/src/client/delivery-inventory/sidebar.js
var STYLE_ID = "dsh-wsr-execution-delivery-inventory";
var CSS = ".wsr-sidebar-resources{min-height:0;flex:1;display:flex;flex-direction:column;gap:4px}.wsr-sidebar-resource{min-height:0;display:flex;flex-direction:column}.wsr-sidebar-resource:first-child{flex:1}.wsr-sidebar-resource-header{box-sizing:border-box;width:100%;height:36px;cursor:pointer;color:var(--dsw-alias-label-tertiary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:13px;text-align:left}.wsr-sidebar-resource-header:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row{box-sizing:border-box;width:100%;height:32px;cursor:pointer;color:var(--dsw-alias-label-primary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:14px;line-height:20px;text-align:left}.wsr-delivery-row:hover,.wsr-delivery-row[aria-current=page]{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row:disabled{cursor:default}.wsr-delivery-row>span:first-child{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden;flex:1}.wsr-delivery-status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px}.wsr-delivery-status-recoverable{color:var(--dsw-alias-state-warning-primary)}";
function installStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID) !== null) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.dataset.plugin = "dsh-wsr-execution";
  tag.textContent = CSS;
  document.head.append(tag);
}
function persisted(key) {
  try {
    return typeof localStorage === "undefined" || localStorage.getItem(key) !== "false";
  } catch {
    return true;
  }
}
function persist(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, String(value));
  } catch {
  }
}
function createSidebarResources(React2, WorkspaceBrowser, inventory) {
  return function WsrSidebarResources(props) {
    const [workspaceExpanded, setWorkspaceExpanded] = React2.useState(() => persisted("wsr.sidebar.workspace.expanded.v1"));
    const [deliveryExpanded, setDeliveryExpanded] = React2.useState(() => persisted("wsr.sidebar.delivery.expanded.v1"));
    const selectedSessionId = props.useSessions((state2) => state2.current);
    const state = React2.useSyncExternalStore(inventory.subscribe, inventory.getSnapshot, inventory.getSnapshot);
    const view = React2.useMemo(() => projectDeliveryInventory(state, { selectedSessionId }), [state, selectedSessionId]);
    const toggle = (kind) => {
      if (kind === "workspace") {
        const next = !workspaceExpanded;
        setWorkspaceExpanded(next);
        persist("wsr.sidebar.workspace.expanded.v1", next);
      } else {
        const next = !deliveryExpanded;
        setDeliveryExpanded(next);
        persist("wsr.sidebar.delivery.expanded.v1", next);
      }
    };
    const header = (id, label, expanded, kind) => React2.createElement("button", {
      type: "button",
      className: "wsr-sidebar-resource-header",
      "aria-controls": id,
      "aria-expanded": expanded,
      onClick: () => toggle(kind)
    }, React2.createElement("span", { "aria-hidden": "true" }, expanded ? "\u25BE" : "\u25B8"), label);
    return React2.createElement(
      "div",
      { className: "wsr-sidebar-resources", "data-wsr-sidebar-resources": "true" },
      React2.createElement(
        "section",
        { className: "wsr-sidebar-resource", "aria-label": "Workspace" },
        header("wsr-sidebar-workspace", "Workspace", workspaceExpanded, "workspace"),
        workspaceExpanded && React2.createElement("div", { id: "wsr-sidebar-workspace" }, React2.createElement(WorkspaceBrowser, props))
      ),
      React2.createElement(
        "section",
        { className: "wsr-sidebar-resource", "aria-label": "Delivery" },
        header("wsr-sidebar-delivery", "Delivery", deliveryExpanded, "delivery"),
        deliveryExpanded && React2.createElement("div", {
          id: "wsr-sidebar-delivery",
          role: view.kind === "error" ? "alert" : "region",
          "aria-live": "polite"
        }, view.kind === "ready" ? React2.createElement("div", { role: "list", "aria-label": "Deliveries" }, view.rows.map((row) => React2.createElement("button", {
          key: row.deliveryId,
          type: "button",
          role: "listitem",
          className: "wsr-delivery-row",
          "aria-current": row.selected ? "page" : void 0,
          "aria-label": `${row.label}, ${row.statusLabel}`,
          disabled: row.sessionId === null,
          onClick: row.sessionId === null ? void 0 : () => props.open(row.sessionId)
        }, React2.createElement("span", null, row.label), React2.createElement("span", {
          className: `wsr-delivery-status wsr-delivery-status-${row.availability}`
        }, row.statusLabel)))) : React2.createElement("div", { role: view.role }, view.label))
      )
    );
  };
}
function applyDeliverySidebar(ctx, { React: React2, workspaceUi: workspaceUi2, inventory }) {
  installStyle();
  const originalSlots = ctx.slots;
  const slots = Object.create(originalSlots);
  slots.register = (definition, component) => definition?.name === "sidebar.workspaces" ? originalSlots.register(definition, createSidebarResources(React2, component, inventory)) : originalSlots.register(definition, component);
  slots.inject = (name2, factory) => originalSlots.inject(name2, factory);
  const forked = new Proxy(ctx, { get(target, property) {
    return property === "slots" ? slots : Reflect.get(target, property);
  } });
  workspaceUi2.apply(forked);
}

// packages/execution/src/client/browser-entry.js
var name = "wsr-execution-client";
var inject = Object.freeze([
  "connection",
  "conversationEvents",
  "sessions",
  "slots"
]);
function apply(ctx) {
  const controlPlane = createDeliveryControlPlaneClient(ctx.connection.rpc);
  const refresh = () => {
    void controlPlane.refresh();
  };
  refresh();
  const timer = setInterval(refresh, 2e3);
  ctx.effect(() => () => clearInterval(timer), "wsr-execution: control-plane refresh");
  applyDeliverySidebar(ctx, { React: import_react.default, workspaceUi, inventory: controlPlane.inventory });
  registerSessionDeliveryView(ctx, {
    React: import_react.default,
    bindProjection(sessionId) {
      const source = controlPlane.bindSession(String(sessionId));
      void source.refresh();
      return source;
    }
  });
  registerActionPresentation(ctx, createActionPresentationView({ React: import_react.default, DisclosureRow: import_dsh_client_ui_primitives.DisclosureRow, MessageText: import_dsh_client_ui_primitives.MessageText, StateDot: import_dsh_client_ui_primitives.StateDot }));
}

    return module.exports;
  },
});
