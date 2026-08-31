import { parseExecutionPresentation, projectExecutionPresentation, resolveDisclosureOpen } from "./model.js";

const DOT_STATE = Object.freeze({
  running: "ongoing",
  recovering: "ongoing",
  completed: "done",
  waiting: "warning",
  failed: "error",
  cancelled: "error",
});

const ACTIONS_STYLE_ID = "dsh-wsr-execution-final-actions";
const ACTIONS_CSS = ".wsr-answer-actions{align-items:center;gap:10px;height:28px;margin-top:16px;margin-left:-6px;display:flex}.wsr-answer-action{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:transparent;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex}.wsr-answer-action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}";

export function installActionPresentationStyle() {
  if (typeof document === "undefined" || document.getElementById(ACTIONS_STYLE_ID) !== null) return;
  const tag = document.createElement("style");
  tag.id = ACTIONS_STYLE_ID;
  tag.dataset.plugin = "dsh-wsr-execution";
  tag.textContent = ACTIONS_CSS;
  document.head.append(tag);
}

/**
 * Build the WSR renderer from Harness-owned, public UI primitives. Dependency
 * injection keeps the projection testable without copying any DSH component.
 */
export function createActionPresentationView({
  React,
  DisclosureRow,
  MessageText,
  StateDot,
  JsonTree,
  Tooltip,
  IconCopyOutline16,
  IconCheckOutline16,
  writeClipboard,
  observe = () => undefined,
}) {
  if (typeof DisclosureRow !== "function") throw new TypeError("DSH_DISCLOSURE_ROW_REQUIRED");
  installActionPresentationStyle();

  return function WsrExecutionPresentationView({ node, technicalDetails }) {
    const presentation = node.data;
    const [open, setOpen] = React.useState(presentation.defaultOpen);
    const [copyState, setCopyState] = React.useState("idle");
    const bodyRef = React.useRef(null);
    const previousState = React.useRef(presentation.state);
    const copyPending = React.useRef(false);
    const copyEpoch = React.useRef(0);
    const copyTimer = React.useRef(null);

    React.useEffect(() => {
      setOpen((current) => resolveDisclosureOpen({
        current,
        previousState: previousState.current,
        nextState: presentation.state,
        containsFocus: typeof document !== "undefined"
          && bodyRef.current !== null
          && bodyRef.current.contains(document.activeElement),
      }));
      previousState.current = presentation.state;
    }, [presentation.state]);

    React.useEffect(() => {
      copyEpoch.current += 1;
      copyPending.current = false;
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      copyTimer.current = null;
      setCopyState("idle");
      return () => {
        copyEpoch.current += 1;
        copyPending.current = false;
        if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      };
    }, [presentation.body, presentation.correlation]);

    observe(presentation);

    if (presentation.layer === "final" && presentation.state === "completed") {
      const label = copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy";
      const onCopy = async () => {
        if (copyState === "copied" || copyPending.current) return;
        const epoch = copyEpoch.current;
        copyPending.current = true;
        let accepted = false;
        try { accepted = await writeClipboard(presentation.body); }
        catch { accepted = false; }
        if (epoch !== copyEpoch.current) return;
        copyPending.current = false;
        setCopyState(accepted ? "copied" : "failed");
        copyTimer.current = globalThis.setTimeout(() => {
          copyTimer.current = null;
          setCopyState("idle");
        }, 1_000);
      };
      return React.createElement("article", {
        "data-wsr-presentation": "true",
        "data-wsr-layer": "final",
        "data-wsr-state": presentation.state,
        "data-wsr-correlation": presentation.correlation,
        "data-wsr-chat-role": "assistant",
        "data-wsr-compatibility": presentation.compatibility,
        "aria-label": presentation.title,
      },
      React.createElement(MessageText, { text: presentation.body }),
      React.createElement("div", {
        className: "wsr-answer-actions",
        "data-wsr-answer-actions": "true",
      }, React.createElement(Tooltip, { label, side: "bottom" }, React.createElement("button", {
        type: "button",
        className: "wsr-answer-action",
        "aria-label": label,
        "data-copy-state": copyState,
        onClick: onCopy,
      }, React.createElement(copyState === "copied" ? IconCheckOutline16 : IconCopyOutline16, null)))));
    }

    const waiting = presentation.state === "waiting";
    const expandable = (presentation.body !== undefined || technicalDetails !== undefined) && !waiting;
    const body = presentation.body === undefined && technicalDetails === undefined ? undefined : React.createElement("div", {
      ref: bodyRef,
      "data-wsr-presentation": "true",
      "data-wsr-layer": presentation.layer,
      "data-wsr-state": presentation.state,
      "data-wsr-correlation": presentation.correlation,
      "data-wsr-action-input": waiting ? "true" : undefined,
      role: waiting ? "group" : undefined,
      tabIndex: waiting ? 0 : undefined,
      "aria-label": waiting ? presentation.summary : undefined,
      "aria-live": waiting ? "polite" : undefined,
    }, presentation.body === undefined ? null : React.createElement("pre", {
      style: { margin: 0, maxHeight: "20rem", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" },
    }, presentation.body), technicalDetails === undefined ? null : React.createElement("details", null,
      React.createElement("summary", null, "Technical details"),
      JsonTree === undefined
        ? React.createElement("pre", null, JSON.stringify(technicalDetails, null, 2))
        : React.createElement(JsonTree, { data: technicalDetails, label: "WSR presentation", copyable: true, expandTopLevel: true })));

    return React.createElement(DisclosureRow, {
      icon: React.createElement(StateDot, { state: DOT_STATE[presentation.state], size: 10 }),
      title: presentation.title,
      open: waiting ? true : open,
      expandable,
      onToggle: waiting ? () => undefined : () => setOpen((current) => !current),
      expandOnRowClick: expandable,
      // The locked primitive animates its hover-preview icon without a
      // reduced-motion branch. Keeping that optional preview off preserves the
      // same keyboard disclosure while making WSR rows motion-free.
      previewChevron: false,
      keepContentWhenOpen: true,
      collapsedContent: React.createElement("span", {
        role: presentation.role,
        "aria-live": ["running", "recovering", "waiting"].includes(presentation.state) ? "polite" : undefined,
      }, presentation.summary),
    }, body);
  };
}

function commandPresentation(node) {
  if (node.outcome === null) return Object.freeze({
    correlation: String(node.commandId), layer: "progress", state: "running",
    title: "Workflow delivery", summary: "Running", body: undefined,
    defaultOpen: true, focusPolicy: "none", role: "status", compatibility: "current",
  });
  const event = parseExecutionPresentation(node.outcome?.text);
  if (event.kind === "delivery-list") {
    const count = Array.isArray(event.data.items) ? event.data.items.length : 0;
    return Object.freeze({
      correlation: event.correlation, layer: "progress", state: "completed",
      title: "Delivery list", summary: `${count} ${count === 1 ? "delivery" : "deliveries"}`,
      body: count === 0 ? "No deliveries." : JSON.stringify(event.data.items, null, 2),
      defaultOpen: count > 0, focusPolicy: "none", role: "status", compatibility: "current",
    });
  }
  return projectExecutionPresentation(event);
}

/** Replace the generic command card so one-line durable JSON remains inspectable. */
export function createWsrCommandView(options) {
  const View = createActionPresentationView(options);
  return function WsrCommandView({ node }) {
    const admitted = node.outcome === null ? undefined : parseExecutionPresentation(node.outcome?.text);
    return View({ node: { data: commandPresentation(node) }, technicalDetails: admitted });
  };
}

/** Hide the earlier native command row and render the ordered presentation row. */
export function registerActionPresentation(ctx, View) {
  ctx.slots.inject("conversation.chat.commandview", () => {
    ctx.slots.register({ name: "conversation.chat.commandview", key: "wsr" }, () => null);
    ctx.slots.register({ name: "conversation.chat.commandview", key: "wsr-presentation" }, View);
  });
}
