export const DELIVERY_VIEW_ID = "delivery";
export const DELIVERY_VIEW_ORDER = 20;

const SHA256 = /^sha256:[0-9a-f]{64}$/u;
const LIFECYCLES = new Set([
  "BOUND", "START_UNCERTAIN", "RUNNING_CORRELATED", "START_FAILED",
  "RESULT_UNRESOLVED", "TERMINAL_HANDLING", "TERMINAL",
]);

function nonEmpty(value) {
  return typeof value === "string" && value.length > 0;
}
function validDelivery(delivery, sessionCorrelation) {
  return delivery !== null && typeof delivery === "object" && !Array.isArray(delivery)
    && nonEmpty(delivery.deliveryId) && SHA256.test(delivery.deliveryBindingIdentity)
    && nonEmpty(delivery.task?.identity)
    && nonEmpty(delivery.workflow?.identity)
    && nonEmpty(delivery.workflow?.packageName)
    && nonEmpty(delivery.workflow?.exactPackageVersion)
    && SHA256.test(delivery.workflow?.packageDigest)
    && nonEmpty(delivery.workflow?.snapshotIdentity)
    && SHA256.test(delivery.workflow?.snapshotDigest)
    && LIFECYCLES.has(delivery.lifecycle)
    && delivery.navigation?.sessionCorrelation === sessionCorrelation
    && delivery.detached === false
    && typeof delivery.recoverable === "boolean"
    && Number.isSafeInteger(delivery.timing?.startedAt)
    && Number.isSafeInteger(delivery.timing?.updatedAt)
    && Number.isSafeInteger(delivery.timing?.elapsedMs)
    && delivery.timing.elapsedMs >= 0;
}

function duration(value) {
  const seconds = Math.floor(value / 1000);
  if (seconds < 60) return `${seconds}.${String(value % 1000).padStart(3, "0")}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function safeSnapshot(source) {
  try { return source.getSnapshot(); }
  catch { return { kind: "error", code: "DELIVERY_PROJECTION_UNAVAILABLE", message: "Execution projection unavailable" }; }
}

function safeSubscribe(source, notify) {
  try { const dispose = source.subscribe(notify); return typeof dispose === "function" ? dispose : () => undefined; }
  catch { return () => undefined; }
}

function pair(React, label, value) {
  return [
    React.createElement("dt", { key: `${label}-label` }, label),
    React.createElement("dd", { key: `${label}-value` }, value),
  ];
}

function statePanel(React, role, code, message) {
  return React.createElement("section", {
    "aria-labelledby": "wsr-delivery-view-title", "aria-live": role === "alert" ? "assertive" : "polite",
    "data-wsr-delivery-view": "true", role,
  }, React.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
  React.createElement("p", null, message), code === undefined ? null : React.createElement("code", null, code));
}

/** Render the exact owner `SessionDeliveryView` without a shadow projection. */
export function createSessionDeliveryView(React) {
  if (typeof React?.createElement !== "function" || typeof React?.useSyncExternalStore !== "function") {
    throw new TypeError("DELIVERY_VIEW_REACT_INVALID");
  }
  return function SessionDeliveryView({ sessionId, source }) {
    const state = React.useSyncExternalStore(
      (notify) => safeSubscribe(source, notify),
      () => safeSnapshot(source),
      () => safeSnapshot(source),
    );
    if (state.kind === "loading") return statePanel(React, "status", undefined, "Loading Delivery…");
    if (state.kind === "error") return statePanel(React, "alert", state.code ?? "DELIVERY_PROJECTION_UNAVAILABLE", state.message ?? "Execution projection unavailable");
    const view = state.view;
    if (state.kind !== "ready" || view?.sessionCorrelation !== sessionId) {
      return statePanel(React, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    if (view.kind === "UNBOUND") return statePanel(React, "status", undefined, "No Delivery bound to this Session");
    if (view.kind !== "BOUND" || !validDelivery(view.delivery, sessionId)) {
      return statePanel(React, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    const delivery = view.delivery;
    const failed = delivery.terminal?.outcome === "FAILED" || delivery.error !== null;
    const identityRows = [
      ...pair(React, "Delivery", delivery.deliveryId),
      ...pair(React, "Task", delivery.task.displayName ?? delivery.task.identity),
      ...pair(React, "Workflow", delivery.workflow.identity),
      ...pair(React, "Package", `${delivery.workflow.packageName}@${delivery.workflow.exactPackageVersion}`),
      ...pair(React, "Package digest", delivery.workflow.packageDigest),
      ...pair(React, "Snapshot", delivery.workflow.snapshotIdentity),
      ...pair(React, "Snapshot digest", delivery.workflow.snapshotDigest),
      ...pair(React, "Binding", delivery.deliveryBindingIdentity),
    ];
    const lifecycleRows = [
      ...pair(React, "Lifecycle", delivery.lifecycle),
      ...pair(React, "Recoverable", delivery.recoverable ? "yes" : "no"),
      ...(delivery.current === null ? [] : pair(React, delivery.current.kind === "ACTION" ? "Current Action" : "Current Intervention", delivery.current.identity)),
      ...pair(React, "Started", new Date(delivery.timing.startedAt).toISOString()),
      ...pair(React, "Elapsed", duration(delivery.timing.elapsedMs)),
      ...(delivery.terminal === null ? [] : [
        ...pair(React, "Ended", new Date(delivery.terminal.finishedAt).toISOString()),
        ...pair(React, "Outcome", delivery.terminal.outcome),
      ]),
      ...(delivery.error === null ? [] : pair(React, "Error", delivery.error.code)),
    ];
    return React.createElement("section", {
      "aria-labelledby": "wsr-delivery-view-title", "aria-live": failed ? "assertive" : "polite",
      "data-wsr-delivery-id": delivery.deliveryId, "data-wsr-delivery-view": "true", role: failed ? "alert" : "region",
    }, React.createElement("h2", { id: "wsr-delivery-view-title" }, "Delivery"),
    React.createElement("dl", { "aria-label": "Delivery identity" }, identityRows),
    React.createElement("dl", { "aria-label": "Delivery lifecycle" }, lifecycleRows));
  };
}

export function registerSessionDeliveryView(ctx, options) {
  if (typeof ctx?.slots?.inject !== "function" || typeof ctx?.slots?.register !== "function"
    || typeof options?.bindProjection !== "function") throw new TypeError("DELIVERY_VIEW_REGISTRATION_INVALID");
  const View = createSessionDeliveryView(options.React);
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view", id: DELIVERY_VIEW_ID, order: DELIVERY_VIEW_ORDER, label: "Delivery",
    inject: (sessionId) => ({ source: options.bindProjection(sessionId) }),
  }, View));
}
