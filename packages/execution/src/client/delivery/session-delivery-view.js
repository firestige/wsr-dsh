export const DELIVERY_VIEW_ID = "delivery";
export const DELIVERY_VIEW_ORDER = 20;

const SHA256 = /^sha256:[0-9a-f]{64}$/u;
const LIFECYCLES = new Set([
  "BOUND", "START_UNCERTAIN", "RUNNING_CORRELATED", "START_FAILED",
  "RESULT_UNRESOLVED", "TERMINAL_HANDLING", "TERMINAL",
]);
const DELIVERY_STYLE_ID = "dsh-wsr-execution-delivery-view";
const DELIVERY_CSS = `
.wsr-delivery-view { box-sizing: border-box; width: 100%; max-width: 960px; margin: 0 auto; padding: 20px; color: var(--dsw-alias-label-primary); }
.wsr-delivery-heading { margin: 0 0 16px; font-size: 20px; line-height: 28px; }
.wsr-delivery-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 0 0 16px; }
.wsr-delivery-summary-item { min-width: 0; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.wsr-delivery-summary-item dt, .wsr-delivery-identity dt { margin: 0 0 3px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 16px; }
.wsr-delivery-summary-item dd, .wsr-delivery-identity dd { min-width: 0; margin: 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
.wsr-delivery-status { display: inline-flex; min-width: 0; align-items: center; gap: 6px; }
.wsr-delivery-status > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wsr-delivery-identities { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; margin: 8px 0 0; }
.wsr-delivery-identity { min-width: 0; margin: 0; }
.wsr-delivery-identity code { display: block; max-width: 100%; overflow: hidden; color: inherit; font-family: var(--dsw-font-family-mono, ui-monospace, monospace); text-overflow: ellipsis; white-space: nowrap; }
.wsr-delivery-identity-full { display: grid; gap: 4px; max-width: min(560px, calc(100vw - 32px)); overflow-wrap: anywhere; }
.wsr-delivery-condition { margin-top: 12px; padding: 10px 12px; border-left: 3px solid var(--dsw-alias-state-warn-primary); border-radius: 4px; background: var(--dsw-alias-bg-layer-1); }
.wsr-delivery-condition h3 { margin: 0 0 4px; font-size: 13px; line-height: 20px; }
.wsr-delivery-condition code, .wsr-delivery-state code { overflow-wrap: anywhere; }
.wsr-delivery-state { display: grid; gap: 8px; }
.wsr-delivery-state p { margin: 0; }
@media (max-width: 720px) { .wsr-delivery-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 420px) { .wsr-delivery-view { padding: 12px; } .wsr-delivery-summary, .wsr-delivery-identities { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .wsr-delivery-view, .wsr-delivery-view * { scroll-behavior: auto !important; transition: none !important; } }
`;

function ensureDeliveryStyles() {
  if (typeof document === "undefined" || document.getElementById(DELIVERY_STYLE_ID) !== null) return;
  const tag = document.createElement("style");
  tag.id = DELIVERY_STYLE_ID;
  tag.textContent = DELIVERY_CSS;
  document.head.appendChild(tag);
}

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

function summaryItem(React, label, value, extra = {}) {
  return React.createElement("div", { className: "wsr-delivery-summary-item", ...extra },
    React.createElement("dt", null, label),
    React.createElement("dd", null, value));
}

function statePanel(React, StateDot, role, code, message) {
  return React.createElement("section", {
    className: "wsr-delivery-view wsr-delivery-state",
    "aria-labelledby": "wsr-delivery-view-title", "aria-live": role === "alert" ? "assertive" : "polite",
    "data-wsr-delivery-view": "true", role,
  }, React.createElement("h2", { className: "wsr-delivery-heading", id: "wsr-delivery-view-title" }, "Delivery"),
  React.createElement("p", null,
    React.createElement(StateDot, { state: role === "alert" ? "error" : "ongoing", size: 10 }), " ", message),
  code === undefined ? null : React.createElement("code", null, code));
}

function statusState(delivery, failed) {
  if (failed) return "error";
  if (delivery.terminal?.outcome === "SUCCEEDED") return "done";
  if (delivery.terminal !== null || ["START_UNCERTAIN", "RESULT_UNRESOLVED", "START_FAILED"].includes(delivery.lifecycle)) return "warning";
  return "ongoing";
}

function identityCard(React, HoverCard, label, value, displayValue = value) {
  const anchor = React.createElement("code", {
    "aria-label": `${label}: ${value}`,
    "data-wsr-delivery-identity": label,
    title: value,
  }, displayValue);
  const content = React.createElement("span", { className: "wsr-delivery-identity-full" },
    React.createElement("strong", null, label), React.createElement("code", null, value));
  return React.createElement("div", { className: "wsr-delivery-identity", key: label },
    React.createElement("dt", null, label),
    React.createElement("dd", null, React.createElement(HoverCard, {
      anchor, content, copyLabel: `Copy ${label}`, copiedLabel: `${label} copied`, copyText: value,
    })));
}

/** Render the exact owner `SessionDeliveryView` without a shadow projection. */
export function createSessionDeliveryView(React, primitives = {}) {
  if (typeof React?.createElement !== "function" || typeof React?.useSyncExternalStore !== "function") {
    throw new TypeError("DELIVERY_VIEW_REACT_INVALID");
  }
  const DisclosureRow = primitives.DisclosureRow ?? "div";
  const HoverCard = primitives.HoverCard ?? "span";
  const Pill = primitives.Pill ?? "span";
  const StateDot = primitives.StateDot ?? "span";
  ensureDeliveryStyles();
  return function SessionDeliveryView({ sessionId, source }) {
    const [identitiesOpen, setIdentitiesOpen] = typeof React.useState === "function"
      ? React.useState(false)
      : [false, () => undefined];
    const state = React.useSyncExternalStore(
      (notify) => safeSubscribe(source, notify),
      () => safeSnapshot(source),
      () => safeSnapshot(source),
    );
    if (state.kind === "loading") return statePanel(React, StateDot, "status", undefined, "Loading Delivery…");
    if (state.kind === "error") return statePanel(React, StateDot, "alert", state.code ?? "DELIVERY_PROJECTION_UNAVAILABLE", state.message ?? "Execution projection unavailable");
    const view = state.view;
    if (state.kind !== "ready" || view?.sessionCorrelation !== sessionId) {
      return statePanel(React, StateDot, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    if (view.kind === "UNBOUND") return statePanel(React, StateDot, "status", undefined, "No Delivery bound to this Session");
    if (view.kind !== "BOUND" || !validDelivery(view.delivery, sessionId)) {
      return statePanel(React, StateDot, "alert", "DELIVERY_PROJECTION_CORRUPT", "Delivery projection invalid");
    }
    const delivery = view.delivery;
    const failed = delivery.terminal?.outcome === "FAILED" || delivery.error !== null;
    const identityRows = [
      ["Delivery", delivery.deliveryId],
      ["Task", delivery.task.identity, delivery.task.displayName === null ? delivery.task.identity : `${delivery.task.displayName} · ${delivery.task.identity}`],
      ["Workflow", delivery.workflow.identity],
      ["Package", `${delivery.workflow.packageName}@${delivery.workflow.exactPackageVersion}`],
      ["Package digest", delivery.workflow.packageDigest],
      ["Snapshot", delivery.workflow.snapshotIdentity],
      ["Snapshot digest", delivery.workflow.snapshotDigest],
      ["Binding", delivery.deliveryBindingIdentity],
      ...(nonEmpty(delivery.worktree) ? [["Worktree", delivery.worktree]] : []),
    ];
    const statusLabel = delivery.terminal?.outcome ?? delivery.lifecycle;
    const workflowLabel = `${delivery.workflow.identity} · ${delivery.workflow.packageName}@${delivery.workflow.exactPackageVersion}`;
    const summary = [
      summaryItem(React, "Status", React.createElement("span", { className: "wsr-delivery-status" },
        React.createElement(StateDot, { state: statusState(delivery, failed), size: 10 }),
        React.createElement(Pill, { "aria-label": `Delivery status ${statusLabel}` }, statusLabel))),
      summaryItem(React, "Workflow", workflowLabel),
      ...(delivery.current === null ? [] : [summaryItem(
        React,
        delivery.current.kind === "ACTION" ? "Current Action" : "Current Intervention",
        delivery.current.identity,
        { "data-wsr-delivery-conditional": "current" },
      )]),
      ...(delivery.terminal === null ? [] : [summaryItem(React, "Outcome", delivery.terminal.outcome, { "data-wsr-delivery-conditional": "terminal" })]),
      summaryItem(React, "Elapsed", duration(delivery.timing.elapsedMs)),
      summaryItem(React, "Started", new Date(delivery.timing.startedAt).toISOString()),
      ...(delivery.terminal === null ? [] : [summaryItem(React, "Ended", new Date(delivery.terminal.finishedAt).toISOString())]),
    ];
    return React.createElement("section", {
      className: "wsr-delivery-view",
      "aria-labelledby": "wsr-delivery-view-title", "aria-live": failed ? "assertive" : "polite",
      "data-wsr-delivery-id": delivery.deliveryId, "data-wsr-delivery-view": "true", role: failed ? "alert" : "region",
    }, React.createElement("h2", { className: "wsr-delivery-heading", id: "wsr-delivery-view-title" }, "Delivery"),
    React.createElement("dl", { "aria-label": "Delivery summary", "data-wsr-delivery-summary": "true", className: "wsr-delivery-summary" }, summary),
    React.createElement(DisclosureRow, {
      title: "Identity details",
      icon: React.createElement(StateDot, { state: statusState(delivery, failed), size: 10 }),
      open: identitiesOpen,
      expandable: true,
      expandOnRowClick: true,
      onToggle: () => setIdentitiesOpen((open) => !open),
      collapsedContent: React.createElement("code", null, delivery.deliveryId),
    }, React.createElement("dl", { "aria-label": "Delivery identity", className: "wsr-delivery-identities" },
      identityRows.map(([label, value, displayValue]) => identityCard(React, HoverCard, label, value, displayValue)))),
    delivery.error === null ? null : React.createElement("section", {
      className: "wsr-delivery-condition", "data-wsr-delivery-conditional": "error", role: "alert",
    }, React.createElement("h3", null, "Failure diagnostic"), React.createElement("code", null, delivery.error.code)));
  };
}

export function registerSessionDeliveryView(ctx, options) {
  if (typeof ctx?.slots?.inject !== "function" || typeof ctx?.slots?.register !== "function"
    || typeof options?.bindProjection !== "function") throw new TypeError("DELIVERY_VIEW_REGISTRATION_INVALID");
  const View = createSessionDeliveryView(options.React, options);
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view", id: DELIVERY_VIEW_ID, order: DELIVERY_VIEW_ORDER, label: "Delivery",
    inject: (sessionId) => ({ source: options.bindProjection(sessionId) }),
  }, View));
}
