import {
  createExecutionPresentationDefinition,
  resolveDisclosureOpen,
} from "./model.js";

const DOT_STATE = Object.freeze({
  running: "ongoing",
  recovering: "ongoing",
  completed: "done",
  waiting: "warning",
  failed: "error",
  cancelled: "error",
});

/**
 * Build the WSR renderer from Harness-owned, public UI primitives. Dependency
 * injection keeps the projection testable without copying any DSH component.
 */
export function createActionPresentationView({ React, DisclosureRow, MessageText, StateDot, observe = () => undefined }) {
  if (typeof DisclosureRow !== "function") throw new TypeError("DSH_DISCLOSURE_ROW_REQUIRED");

  return function WsrExecutionPresentationView({ node }) {
    const presentation = node.data;
    const [open, setOpen] = React.useState(presentation.defaultOpen);
    const bodyRef = React.useRef(null);
    const previousState = React.useRef(presentation.state);

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

    observe(presentation);

    if (presentation.layer === "final") {
      return React.createElement("article", {
        "data-wsr-presentation": "true",
        "data-wsr-layer": "final",
        "data-wsr-state": presentation.state,
        "data-wsr-correlation": presentation.correlation,
        "data-wsr-chat-role": "assistant",
        "data-wsr-compatibility": presentation.compatibility,
        "aria-label": presentation.title,
      }, React.createElement(MessageText, { text: presentation.body }));
    }

    const waiting = presentation.state === "waiting";
    const expandable = presentation.body !== undefined && !waiting;
    const body = presentation.body === undefined ? undefined : React.createElement("div", {
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
    }, React.createElement("pre", {
      style: { margin: 0, maxHeight: "20rem", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" },
    }, presentation.body));

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

/** Register the feature-owned event projection and its one keyed chat node. */
export function registerActionPresentation(ctx, View) {
  ctx.conversationEvents.register(createExecutionPresentationDefinition());
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "wsr-execution-presentation",
  }, View));
}
