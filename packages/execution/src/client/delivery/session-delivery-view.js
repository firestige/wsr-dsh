export const DELIVERY_VIEW_ID = "delivery";
export const DELIVERY_VIEW_ORDER = 20;

const BINDING_STATES = new Set(["current", "recovered", "detached"]);
const LIFECYCLES = new Set(["running", "waiting", "completed", "failed", "cancelled", "detached", "recoverable"]);
const CURRENT_KINDS = new Set(["action", "intervention"]);
const SHA256 = /^sha256:[0-9a-f]{64}$/u;

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function nonEmpty(value) {
  return typeof value === "string" && value.length > 0;
}

function nullableTimestamp(value) {
  return value === null || (nonEmpty(value) && Number.isFinite(Date.parse(value)));
}

function validProjection(value, sessionId) {
  const projection = record(value);
  const binding = record(projection?.binding);
  const delivery = record(projection?.delivery);
  const workflow = record(delivery?.workflow);
  const packageIdentity = record(delivery?.package);
  const snapshot = record(delivery?.snapshot);
  const timing = record(delivery?.timing);
  const current = delivery?.current === null ? null : record(delivery?.current);
  const terminal = delivery?.terminal === null ? null : record(delivery?.terminal);
  const terminalError = terminal?.error === null || terminal?.error === undefined ? null : record(terminal?.error);

  return projection !== undefined
    && projection.sessionId === sessionId
    && binding !== undefined
    && BINDING_STATES.has(binding.state)
    && SHA256.test(binding.identity)
    && nonEmpty(binding.deliveryId)
    && delivery !== undefined
    && delivery.id === binding.deliveryId
    && workflow !== undefined
    && nonEmpty(workflow.id)
    && nonEmpty(workflow.version)
    && packageIdentity !== undefined
    && nonEmpty(packageIdentity.name)
    && nonEmpty(packageIdentity.version)
    && SHA256.test(packageIdentity.digest)
    && snapshot !== undefined
    && nonEmpty(snapshot.id)
    && SHA256.test(snapshot.digest)
    && LIFECYCLES.has(delivery.lifecycle)
    && (current === null || (CURRENT_KINDS.has(current.kind) && nonEmpty(current.id) && nonEmpty(current.label)))
    && timing !== undefined
    && nonEmpty(timing.startedAt)
    && Number.isFinite(Date.parse(timing.startedAt))
    && nullableTimestamp(timing.endedAt)
    && Number.isSafeInteger(timing.elapsedMs)
    && timing.elapsedMs >= 0
    && (terminal === null || (nonEmpty(terminal.outcome)
      && (terminalError === null || (nonEmpty(terminalError.code) && nonEmpty(terminalError.message)))));
}

function duration(value) {
  const seconds = Math.floor(value / 1000);
  if (seconds < 60) return `${seconds}.${String(value % 1000).padStart(3, "0")}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function safeSnapshot(source) {
  try {
    const value = source.getSnapshot();
    return record(value) ?? { kind: "error", code: "PROJECTION_INVALID", message: "Delivery projection invalid" };
  } catch {
    return { kind: "error", code: "CONTROL_UNAVAILABLE", message: "Execution projection unavailable" };
  }
}

function safeSubscribe(source, notify) {
  try {
    const dispose = source.subscribe(notify);
    return typeof dispose === "function" ? dispose : () => undefined;
  } catch {
    return () => undefined;
  }
}

function pair(React, label, value) {
  return [
    React.createElement("dt", { key: `${label}-label` }, label),
    React.createElement("dd", { key: `${label}-value` }, value),
  ];
}

function statePanel(React, role, code, message) {
  return React.createElement("section", {
    "aria-labelledby": "wsr-delivery-view-title",
    "aria-live": role === "alert" ? "assertive" : "polite",
    "data-wsr-delivery-view": "true",
    role,
  },
  React.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
  React.createElement("p", null, message),
  code === undefined ? null : React.createElement("code", null, code));
}

/**
 * Builds the Session-scoped view. `source` is deliberately a consumer port:
 * Execution owns its projection shape, replay, lifecycle facts and elapsed
 * time. This component never derives control-plane state from conversation
 * events and has no command capability.
 */
export function createSessionDeliveryView(React) {
  if (React === null || typeof React !== "object" || typeof React.createElement !== "function"
    || typeof React.useSyncExternalStore !== "function") throw new TypeError("DELIVERY_VIEW_REACT_INVALID");

  return function SessionDeliveryView({ sessionId, source }) {
    const snapshot = React.useSyncExternalStore(
      (notify) => safeSubscribe(source, notify),
      () => safeSnapshot(source),
      () => safeSnapshot(source),
    );

    if (snapshot.kind === "loading") return statePanel(React, "status", undefined, "Loading Delivery…");
    if (snapshot.kind === "empty") return statePanel(React, "status", undefined, "No Delivery bound to this Session");
    if (snapshot.kind === "error") {
      return statePanel(
        React,
        "alert",
        nonEmpty(snapshot.code) ? snapshot.code : "CONTROL_UNAVAILABLE",
        nonEmpty(snapshot.message) ? snapshot.message : "Execution projection unavailable",
      );
    }
    if (snapshot.kind === "stale") {
      return statePanel(
        React,
        "alert",
        nonEmpty(snapshot.code) ? snapshot.code : "STALE_BINDING",
        "Delivery stale binding",
      );
    }
    if (snapshot.kind !== "ready" || !validProjection(snapshot.projection, sessionId)) {
      const stale = record(snapshot.projection)?.sessionId !== undefined && record(snapshot.projection)?.sessionId !== sessionId;
      return statePanel(React, "alert", stale ? "STALE_BINDING" : "PROJECTION_INVALID", stale ? "Delivery stale binding" : "Delivery projection invalid");
    }

    const projection = snapshot.projection;
    const { binding, delivery } = projection;
    const failed = delivery.lifecycle === "failed" || delivery.terminal?.error !== null && delivery.terminal?.error !== undefined;
    const identityRows = [
      ...pair(React, "Delivery", delivery.id),
      ...pair(React, "Workflow", `${delivery.workflow.id}@${delivery.workflow.version}`),
      ...pair(React, "Package", `${delivery.package.name}@${delivery.package.version}`),
      ...pair(React, "Package digest", delivery.package.digest),
      ...pair(React, "Snapshot", delivery.snapshot.id),
      ...pair(React, "Snapshot digest", delivery.snapshot.digest),
      ...pair(React, "Binding", binding.identity),
    ];
    const lifecycleRows = [
      ...pair(React, "Binding state", binding.state),
      ...pair(React, "Lifecycle", delivery.lifecycle),
      ...(delivery.current === null ? [] : [
        ...pair(React, delivery.current.kind === "action" ? "Current Action" : "Current Intervention", `${delivery.current.id} · ${delivery.current.label}`),
      ]),
      ...pair(React, "Started", delivery.timing.startedAt),
      ...pair(React, "Elapsed", duration(delivery.timing.elapsedMs)),
      ...(delivery.timing.endedAt === null ? [] : pair(React, "Ended", delivery.timing.endedAt)),
      ...(delivery.terminal === null ? [] : pair(React, "Outcome", delivery.terminal.outcome)),
      ...(delivery.terminal?.error === null || delivery.terminal?.error === undefined ? []
        : pair(React, "Error", `${delivery.terminal.error.code} · ${delivery.terminal.error.message}`)),
    ];

    return React.createElement("section", {
      "aria-labelledby": "wsr-delivery-view-title",
      "aria-live": failed ? "assertive" : "polite",
      "data-wsr-binding-state": binding.state,
      "data-wsr-delivery-id": delivery.id,
      "data-wsr-delivery-view": "true",
      role: failed ? "alert" : "region",
    },
    React.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
    React.createElement("dl", { "aria-label": "Delivery identity" }, identityRows),
    React.createElement("dl", { "aria-label": "Delivery lifecycle" }, lifecycleRows));
  };
}

/** Register one native Harness `conversation.view` entry. */
export function registerSessionDeliveryView(ctx, options) {
  if (ctx?.slots === undefined || typeof ctx.slots.inject !== "function" || typeof ctx.slots.register !== "function"
    || typeof options?.bindProjection !== "function") throw new TypeError("DELIVERY_VIEW_REGISTRATION_INVALID");
  const View = createSessionDeliveryView(options.React);
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view",
    id: DELIVERY_VIEW_ID,
    order: DELIVERY_VIEW_ORDER,
    label: "Delivery",
    inject: (sessionId) => ({ source: options.bindProjection(sessionId) }),
  }, View));
}
