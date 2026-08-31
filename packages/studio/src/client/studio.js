import { createEvaluateController, projectStudioPresentation } from "./evaluate-model.js";

export const STUDIO_PAGES = Object.freeze([
  Object.freeze({ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" }),
]);

const ACCESSIBILITY = Object.freeze({
  routes: Object.freeze(STUDIO_PAGES.map((page) => page.label)),
  surface: "conversation-view",
  modal: false,
  landmarks: Object.freeze(["region", "navigation", "main"]),
  liveRegions: Object.freeze({ loading: "polite", error: "assertive" }),
  minimumTargetPixels: 44,
});

export function studioAccessibilityModel() {
  return ACCESSIBILITY;
}

export function createStudioGatewayPort(ctx) {
  return Object.freeze({
    call(endpoint, payload, signal) {
      return ctx.connection.rpc.call("/wsr-studio", endpoint, payload, signal);
    },
  });
}

const viewStyle = {
  width: "100%", minHeight: "100%", overflow: "auto",
  color: "var(--dsw-alias-label-primary)", background: "var(--dsw-alias-bg-base)",
  border: "1px solid var(--dsw-alias-border-l2)", padding: "clamp(12px, 3vw, 32px)", boxSizing: "border-box",
};
const controlStyle = { minHeight: "44px", minWidth: "44px" };
const listStyle = { maxHeight: "min(42vh, 480px)", overflow: "auto", overflowWrap: "anywhere" };

function StudioView(React, Primitives, controller) {
  const Button = Primitives.Button ?? "button";
  const DisclosureRow = Primitives.DisclosureRow;
  const JsonTree = Primitives.JsonTree;
  return function StudioConversationView() {
    const snapshot = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    React.useEffect(() => {
      if (snapshot.drilldown.phase !== "idle") return;
      if (snapshot.route.page === "facts" && snapshot.result !== undefined) {
        void controller.loadMetricFacts(snapshot.route.metric, snapshot.route.scope);
      }
      if (snapshot.route.page === "trace") void controller.loadTrace({
        trace_id: snapshot.route.traceId,
        limit: 200,
      });
    }, [snapshot.route.page, snapshot.result]);
    const presentation = projectStudioPresentation(snapshot);
    const json = (data, label) => JsonTree === undefined
      ? React.createElement("pre", { "aria-label": label }, JSON.stringify(data, null, 2))
      : React.createElement(JsonTree, { data, label, copyable: true, expandTopLevel: true });
    const taskItems = snapshot.taskList.items ?? [];
    const current = snapshot.selection?.mode === "single" ? snapshot.selection.taskIds : [];
    const before = snapshot.selection?.mode === "compare" ? snapshot.selection.leftTaskIds : [];
    const after = snapshot.selection?.mode === "compare" ? snapshot.selection.rightTaskIds : [];
    const setTask = (id, checked) => {
      const taskIds = checked ? [...new Set([...current, id])] : current.filter((value) => value !== id);
      if (taskIds.length > 0) controller.setSelection({ mode: "single", taskIds });
    };
    const setComparedTask = (side, id, checked) => {
      const selected = side === "left" ? before : after;
      const taskIds = checked ? [...new Set([...selected, id])] : selected.filter((value) => value !== id);
      if (taskIds.length === 0) return;
      controller.setSelection({
        mode: "compare",
        leftTaskIds: side === "left" ? taskIds : before,
        rightTaskIds: side === "right" ? taskIds : after,
      });
    };
    const chooseMode = (mode) => {
      if (mode === snapshot.selection?.mode) return;
      const seed = current[0] ?? before[0] ?? after[0] ?? taskItems[0]?.task_id;
      if (seed === undefined) return;
      controller.setSelection(mode === "single"
        ? { mode: "single", taskIds: [seed] }
        : { mode: "compare", leftTaskIds: [seed], rightTaskIds: [seed] });
    };
    return React.createElement("section", {
      id: "wsr-studio-view", role: "region", "aria-labelledby": "wsr-studio-title",
      "data-wsr-studio-view": "evaluate", style: viewStyle,
    },
    React.createElement("header", null,
      React.createElement("p", null, "Workflow Self-Recursive"),
      React.createElement("h1", { id: "wsr-studio-title" }, "WSR Studio")),
    React.createElement("nav", { "aria-label": "Studio" }, ...STUDIO_PAGES.map((page) =>
      React.createElement("span", { key: page.id, "aria-current": page.id === "evaluate" ? "page" : undefined }, page.label))),
    React.createElement("main", { tabIndex: -1 },
      snapshot.phase === "loading" || snapshot.refreshing
        ? React.createElement("p", { role: "status", "aria-live": "polite" }, snapshot.refreshing ? "Refreshing evaluation…" : "Loading evaluation…") : null,
      snapshot.error === undefined ? null
        : React.createElement("section", { role: "alert", "aria-live": "assertive" },
          React.createElement("h2", null, snapshot.result === undefined ? "Evaluate unavailable" : "Showing the last result"),
          React.createElement("p", null, snapshot.error.message),
          React.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.refresh() }, "Retry")),
      React.createElement("section", { "aria-labelledby": "wsr-task-selection" },
        React.createElement("h2", { id: "wsr-task-selection" }, "Task selection"),
        React.createElement("fieldset", null,
          React.createElement("legend", null, "Evaluation mode"),
          React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "single", checked: snapshot.selection?.mode !== "compare", onChange: () => chooseMode("single") }),
            "Single"),
          React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "compare", checked: snapshot.selection?.mode === "compare", onChange: () => chooseMode("compare") }),
            "Compare")),
        snapshot.taskList.phase === "idle"
          ? React.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.loadTasks() }, "Load Tasks") : null,
        snapshot.taskList.phase === "error"
          ? React.createElement("p", { role: "alert" }, "Task list unavailable; the current selection remains usable.") : null,
        snapshot.selection?.mode === "compare"
          ? React.createElement("div", null, ...[["Before", "left", before], ["After", "right", after]].map(([label, side, selected]) =>
            React.createElement("fieldset", { key: side },
              React.createElement("legend", null, label),
              ...taskItems.map((task) => React.createElement("label", { key: `${side}-${task.task_id}` },
                React.createElement("input", { type: "checkbox", checked: selected.includes(task.task_id), onChange: (event) => setComparedTask(side, task.task_id, event.target.checked) }),
                task.display_name ?? task.task_id)))))
          : React.createElement("ul", { style: listStyle }, ...taskItems.map((task) => React.createElement("li", { key: task.task_id },
            React.createElement("label", null,
              React.createElement("input", { type: "checkbox", checked: current.includes(task.task_id), onChange: (event) => setTask(task.task_id, event.target.checked) }),
              task.display_name ?? task.task_id)))),
        snapshot.taskList.phase === "ready" && taskItems.length === 0 ? React.createElement("p", { role: "status" }, "No Tasks are available in Evidence.") : null,
        snapshot.taskList.page?.next_cursor ? React.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.loadTasks(snapshot.taskList.page.next_cursor) }, "Load more Tasks") : null,
        React.createElement(Button, { type: "button", style: controlStyle, disabled: snapshot.selection === undefined, onClick: () => controller.evaluate() }, "Evaluate selection")),
      snapshot.result === undefined ? React.createElement("p", null, "Choose one or more Tasks to evaluate.")
        : React.createElement("section", { "aria-label": snapshot.result.mode === "COMPARE" ? "Compared Metric Results" : "Metric Results" },
          snapshot.phase === "partial" ? React.createElement("p", { role: "status" }, "Partial comparison: the available side remains visible.") : null,
          React.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.openReceipt() }, "View receipt"),
          ...presentation.metrics.map((metric) => {
            const coordinate = metric.coordinate;
            const content = React.createElement("article", { key: coordinate },
              React.createElement("h3", null, coordinate),
              ...metric.sides.map(({ side, slices }) => React.createElement("section", { key: side, "aria-label": `${side} Metric Result` },
                React.createElement("h4", null, snapshot.result.mode === "COMPARE" ? `${side} side` : "Metric Result value"),
                json(slices, `${coordinate} ${side} slices`))),
              React.createElement(Button, { type: "button", style: controlStyle, onClick: () => {
                controller.openFacts(coordinate);
              } }, "Fact drill-down"));
            return DisclosureRow === undefined ? content : React.createElement(DisclosureRow, {
              key: coordinate, title: coordinate, open: true, expandable: false,
            }, content);
          }),
          ...presentation.deltas.map((delta) => React.createElement("p", { key: `${delta.metric_coordinate}-${JSON.stringify(delta.slice_key)}` },
            `${delta.metric_coordinate}: ${delta.state}${delta.direction === undefined ? "" : ` · ${delta.direction}`}`))),
      snapshot.route.page === "receipt"
        ? React.createElement("section", { "aria-label": "Evaluation receipts" },
          React.createElement("h2", null, "Receipts"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          ...presentation.receipts.map(({ side, receipt }) => React.createElement("article", { key: side },
            React.createElement("h3", null, side),
            React.createElement("p", null, `Population: ${receipt?.population_state ?? "unknown"}`),
            React.createElement("p", null, `Evidence bindings: ${receipt?.evidence_bindings?.length ?? 0}`),
            json(receipt, `${side} evaluation receipt`)))) : null,
      snapshot.route.page === "facts"
        ? React.createElement("section", { "aria-label": "Fact drill-down" },
          React.createElement("h2", null, "Facts"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...(snapshot.drilldown.references ?? []).filter((reference) => !reference.loadedAsFact)
            .map((reference) => React.createElement("p", { key: reference.identity }, `Recorded lineage not hydrated as a Fact: ${reference.identity}`)),
          ...presentation.facts.map((fact) => React.createElement("article", { key: fact.id },
            `${fact.kind ?? "Fact"} · ${fact.id}`,
            typeof fact.source?.trace_id === "string" ? React.createElement(Button, { type: "button", onClick: () => {
              controller.openTrace(fact.source.trace_id, fact.source.span_id);
              void controller.loadTrace({ trace_id: fact.source.trace_id, limit: 200 });
            } }, "Open recorded trace") : null))) : null,
      snapshot.route.page === "trace"
        ? React.createElement("section", { "aria-label": "Recorded Trace drill-down" },
          React.createElement("h2", null, "Recorded Trace"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...presentation.trace.map((item) => React.createElement("article", { key: item.id }, `${item.kind ?? "Trace item"} · ${item.id}`))) : null));
  };
}

export function createStudioClientPlugin({ React, Primitives = {}, initialContext, storage } = {}) {
  if (React === undefined) throw new Error("STUDIO_REACT_REQUIRED");
  return {
    name: "wsr-studio-client",
    inject: ["connection", "slots"],
    apply(ctx) {
      const resolvedStorage = storage ?? (typeof window === "undefined" ? undefined : window.sessionStorage);
      const controller = createEvaluateController({
        gateway: createStudioGatewayPort(ctx),
        initialContext,
        storage: resolvedStorage,
      });
      let dispose = () => undefined;
      ctx.slots.inject("conversation.view", () => {
        dispose = ctx.slots.register({
          name: "conversation.view", id: "wsr-studio", order: 30, label: "WSR Studio",
        }, StudioView(React, Primitives, controller));
      });
      return Object.assign(() => dispose?.(), { controller });
    },
  };
}
