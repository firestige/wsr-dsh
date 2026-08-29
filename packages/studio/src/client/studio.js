import { createEvaluateController, projectStudioPresentation } from "./evaluate-model.js";

const ACCESSIBILITY = Object.freeze({
  routes: Object.freeze(["Evaluate"]),
  landmarks: Object.freeze(["dialog", "navigation", "main"]),
  closeKey: "Escape",
  focusReturnsToTrigger: true,
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

function createOpenStore() {
  let open = false;
  let trigger;
  const listeners = new Set();
  const publish = () => { for (const listener of listeners) listener(); };
  return {
    getSnapshot: () => open,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    open(element) { trigger = element; open = true; publish(); },
    close() { open = false; publish(); trigger?.focus?.(); },
  };
}

const frameStyle = {
  position: "fixed", inset: "24px", zIndex: 1000, overflow: "auto",
  color: "var(--dsw-alias-label-primary)", background: "var(--dsw-alias-bg-base)",
  border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "12px",
  boxShadow: "var(--dsw-specific-shadow-modal)", padding: "20px",
};
const controlStyle = { minHeight: "44px", minWidth: "44px" };

function metricRows(result) {
  if (result?.mode === "SINGLE") return result.result?.metric_results ?? [];
  if (result?.mode === "COMPARE") {
    const left = result.left?.tag === "SIDE_RESULT" ? result.left.metric_results : [];
    const right = result.right?.tag === "SIDE_RESULT" ? result.right.metric_results : [];
    const rows = new Map();
    for (const item of [...left, ...right]) rows.set(`${item.metric_id}@${item.metric_version}`, item);
    return [...rows.values()];
  }
  return [];
}

function StudioAction(React, store) {
  return function StudioActionView({ wide = true }) {
    return React.createElement("button", {
      type: "button",
      style: controlStyle,
      "aria-haspopup": "dialog",
      onClick: (event) => store.open(event.currentTarget),
    }, wide ? "WSR Studio" : "Studio");
  };
}

function StudioOverlay(React, store, controller) {
  return function StudioOverlayView() {
    const open = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const snapshot = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    React.useEffect(() => {
      if (!open || typeof document === "undefined") return undefined;
      const listener = (event) => { if (event.key === "Escape") store.close(); };
      document.addEventListener("keydown", listener);
      return () => document.removeEventListener("keydown", listener);
    }, [open]);
    if (!open) return null;
    const presentation = projectStudioPresentation(snapshot);
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
      role: "dialog", "aria-modal": "true", "aria-labelledby": "wsr-studio-title",
      "data-wsr-studio": "evaluate", style: frameStyle,
    },
    React.createElement("header", null,
      React.createElement("p", null, "Workflow Self-Recursive"),
      React.createElement("h1", { id: "wsr-studio-title" }, "WSR Studio"),
      React.createElement("button", { type: "button", style: controlStyle, "aria-label": "Close WSR Studio", onClick: () => store.close() }, "Close")),
    React.createElement("nav", { "aria-label": "Studio" }, React.createElement("span", { "aria-current": "page" }, "Evaluate")),
    React.createElement("main", { tabIndex: -1 },
      snapshot.phase === "loading" || snapshot.refreshing
        ? React.createElement("p", { role: "status", "aria-live": "polite" }, snapshot.refreshing ? "Refreshing evaluation…" : "Loading evaluation…") : null,
      snapshot.error === undefined ? null
        : React.createElement("section", { role: "alert", "aria-live": "assertive" },
          React.createElement("h2", null, snapshot.result === undefined ? "Evaluate unavailable" : "Showing the last result"),
          React.createElement("p", null, snapshot.error.message),
          React.createElement("button", { type: "button", style: controlStyle, onClick: () => controller.refresh() }, "Retry")),
      React.createElement("section", { "aria-labelledby": "wsr-task-selection" },
        React.createElement("h2", { id: "wsr-task-selection" }, "Task selection"),
        React.createElement("label", null, "Repository",
          React.createElement("input", {
            type: "text", "aria-label": "Repository", defaultValue: snapshot.repository ?? "",
            onBlur: (event) => { if (event.target.value.trim() !== "") controller.setRepository(event.target.value); },
          })),
        React.createElement("fieldset", null,
          React.createElement("legend", null, "Evaluation mode"),
          React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "single", checked: snapshot.selection?.mode !== "compare", onChange: () => chooseMode("single") }),
            "Single"),
          React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "compare", checked: snapshot.selection?.mode === "compare", onChange: () => chooseMode("compare") }),
            "Compare")),
        snapshot.taskList.phase === "idle"
          ? React.createElement("button", { type: "button", style: controlStyle, onClick: () => controller.loadTasks() }, "Load Tasks") : null,
        snapshot.taskList.phase === "error"
          ? React.createElement("p", { role: "alert" }, "Task list unavailable; the current selection remains usable.") : null,
        snapshot.selection?.mode === "compare"
          ? React.createElement("div", null, ...[["Before", "left", before], ["After", "right", after]].map(([label, side, selected]) =>
            React.createElement("fieldset", { key: side },
              React.createElement("legend", null, label),
              ...taskItems.map((task) => React.createElement("label", { key: `${side}-${task.task_id}` },
                React.createElement("input", { type: "checkbox", checked: selected.includes(task.task_id), onChange: (event) => setComparedTask(side, task.task_id, event.target.checked) }),
                task.display_name ?? task.task_id)))))
          : React.createElement("ul", null, ...taskItems.map((task) => React.createElement("li", { key: task.task_id },
            React.createElement("label", null,
              React.createElement("input", { type: "checkbox", checked: current.includes(task.task_id), onChange: (event) => setTask(task.task_id, event.target.checked) }),
              task.display_name ?? task.task_id)))),
        React.createElement("button", { type: "button", style: controlStyle, disabled: snapshot.selection === undefined, onClick: () => controller.evaluate() }, "Evaluate selection")),
      snapshot.result === undefined ? React.createElement("p", null, "Choose one or more Tasks to evaluate.")
        : React.createElement("section", { "aria-label": snapshot.result.mode === "COMPARE" ? "Compared Metric Results" : "Metric Results" },
          snapshot.phase === "partial" ? React.createElement("p", { role: "status" }, "Partial comparison: the available side remains visible.") : null,
          React.createElement("button", { type: "button", style: controlStyle, onClick: () => controller.openReceipt() }, "View receipt"),
          ...metricRows(snapshot.result).map((metric) => React.createElement("article", { key: `${metric.metric_id}@${metric.metric_version}` },
            React.createElement("h3", null, `${metric.metric_id}@${metric.metric_version}`),
            React.createElement("p", null, `${metric.slices?.length ?? 0} result slice(s)`),
            React.createElement("button", { type: "button", style: controlStyle, onClick: () => controller.openFacts(`${metric.metric_id}@${metric.metric_version}`) }, "Fact drill-down"))),
          ...presentation.deltas.map((delta) => React.createElement("p", { key: `${delta.metric_coordinate}-${JSON.stringify(delta.slice_key)}` },
            `${delta.metric_coordinate}: ${delta.state}${delta.direction === undefined ? "" : ` · ${delta.direction}`}`))),
      snapshot.route.page === "receipt"
        ? React.createElement("section", { "aria-label": "Evaluation receipts" },
          React.createElement("h2", null, "Receipts"),
          ...presentation.receipts.map(({ side, receipt }) => React.createElement("article", { key: side },
            React.createElement("h3", null, side),
            React.createElement("p", null, `Population: ${receipt?.population_state ?? "unknown"}`),
            React.createElement("p", null, `Evidence bindings: ${receipt?.evidence_bindings?.length ?? 0}`)))) : null,
      snapshot.route.page === "facts"
        ? React.createElement("section", { "aria-label": "Fact drill-down" },
          React.createElement("h2", null, "Facts"),
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...presentation.facts.map((fact) => React.createElement("article", { key: fact.id }, `${fact.kind ?? "Fact"} · ${fact.id}`))) : null,
      snapshot.route.page === "trace"
        ? React.createElement("section", { "aria-label": "Recorded Trace drill-down" },
          React.createElement("h2", null, "Recorded Trace"),
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          ...presentation.trace.map((item) => React.createElement("article", { key: item.id }, `${item.kind ?? "Trace item"} · ${item.id}`))) : null));
  };
}

export function createStudioClientPlugin({ React, initialContext, storage } = {}) {
  if (React === undefined) throw new Error("STUDIO_REACT_REQUIRED");
  return {
    name: "wsr-studio-client",
    inject: ["connection", "slots"],
    apply(ctx) {
      const store = createOpenStore();
      const controller = createEvaluateController({
        gateway: createStudioGatewayPort(ctx),
        initialContext,
        storage: storage ?? (typeof window === "undefined" ? undefined : window.sessionStorage),
      });
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action", id: "wsr-studio", order: 60, label: "WSR Studio",
      }, StudioAction(React, store)));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay", id: "wsr-studio", order: 60,
      }, StudioOverlay(React, store, controller)));
      return { controller, store };
    },
  };
}
