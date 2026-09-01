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

function visualizerFor(metric) {
  if (!Array.isArray(metric?.slices) || metric.slices.length !== 1) return "table@1";
  const value = metric.slices[0]?.value;
  if (value?.kind === "RATIO" && value.unit === "ratio") return "ratio-bar@1";
  if (value?.kind === "BOOLEAN") return "badge@1";
  return "numeric-card@1";
}

function metricResultCompatible(metric) {
  return typeof metric?.metric_id === "string" && typeof metric.metric_version === "string" &&
    Array.isArray(metric.slices) && metric.slices.every((slice) =>
      slice !== null && typeof slice === "object" &&
      slice.slice_key !== null && typeof slice.slice_key === "object" && !Array.isArray(slice.slice_key) &&
      typeof slice.state === "string" &&
      slice.measures !== null && typeof slice.measures === "object" && !Array.isArray(slice.measures) &&
      (slice.coverage === null || typeof slice.coverage === "object") &&
      slice.compatibility !== null && typeof slice.compatibility === "object" && !Array.isArray(slice.compatibility) &&
      Array.isArray(slice.exclusions) && Array.isArray(slice.missing_inputs) && Array.isArray(slice.provenance_refs));
}

function sliceIdentity(sliceKey) {
  return JSON.stringify(Object.fromEntries(Object.entries(sliceKey ?? {}).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0)));
}

function metricSlice(side, coordinate, sliceKey) {
  if (side?.tag !== "SIDE_RESULT") return undefined;
  const split = coordinate.lastIndexOf("@");
  const metric = side.metric_results?.find((candidate) =>
    candidate.metric_id === coordinate.slice(0, split) &&
    candidate.metric_version === coordinate.slice(split + 1));
  const identity = sliceIdentity(sliceKey);
  return metric?.slices?.find((slice) => sliceIdentity(slice.slice_key) === identity);
}

function factRow(fact) {
  if (typeof fact?.id !== "string" || typeof fact.kind !== "string" ||
      typeof fact.provenance?.accepted_digest !== "string" ||
      !Array.isArray(fact.compatibility?.dimensions) ||
      typeof fact.truth?.availability !== "string") return undefined;
  const coordinates = Object.fromEntries(fact.compatibility.dimensions.map(({ field, value }) => [field, String(value)]));
  if (fact.compatibility.event_name !== null && fact.compatibility.event_name !== undefined) {
    coordinates.event_name = fact.compatibility.event_name;
  }
  if (fact.compatibility.family_schema !== null && fact.compatibility.family_schema !== undefined) {
    coordinates.family_schema = fact.compatibility.family_schema;
  }
  return {
    factId: fact.id,
    factClass: fact.kind,
    coordinates,
    provenance: fact.provenance.accepted_digest,
    truth: fact.truth,
    ...(fact.source?.kind === "SPAN" ? {
      trace: { traceId: fact.source.trace_id, spanId: fact.source.span_id },
    } : {}),
  };
}

function traceViewModel(Bi, items, selectedId) {
  const structure = Bi.projectRecordedStructure(items);
  const endpointId = (endpoint) => `${endpoint.trace_id}:${endpoint.span_id}`;
  return {
    status: structure.status,
    errors: structure.errors,
    model: {
      depthGroups: structure.depthGroups.map((group) => ({
        depth: group.depth,
        nodes: group.nodes.map((node) => ({
          id: node.id,
          endpointId: endpointId(node.endpoint),
          label: node.label,
          state: "AVAILABLE",
        })),
      })),
      parentEdges: structure.parentEdges.map((edge) => ({
        id: edge.id,
        sourceId: endpointId(edge.from),
        targetId: endpointId(edge.to),
      })),
      links: structure.links.map((link) => ({
        id: link.id,
        sourceId: endpointId(link.from),
        targetId: endpointId(link.to),
        state: "AVAILABLE",
      })),
      orphans: [
        ...structure.unresolvedNodes.map((node) => ({
          id: node.id,
          label: `${node.label} — unresolved parent`,
          state: "UNRESOLVED",
        })),
        ...structure.orphans.map((orphan) => ({
          id: orphan.id,
          label: `Missing endpoint ${orphan.endpoint.span_id}`,
          state: "UNRESOLVED",
        })),
      ],
      selectedId,
    },
  };
}

function StudioView(React, Primitives, Bi, sharedStyles, controller) {
  const Button = Primitives.Button ?? "button";
  const DisclosureRow = Primitives.DisclosureRow;
  const JsonTree = Primitives.JsonTree;
  return function StudioConversationView() {
    const [technicalDetailsOpen, setTechnicalDetailsOpen] = React.useState(false);
    const [selectedTraceId, setSelectedTraceId] = React.useState(undefined);
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
    const deltaCoordinates = new Set(presentation.deltas.map((delta) => delta.metric_coordinate));
    const facts = presentation.facts.map(factRow);
    const factsCompatible = facts.every((row) => row !== undefined);
    let recorded;
    if (snapshot.route.page === "trace" && presentation.trace.length > 0) {
      try {
        recorded = traceViewModel(Bi, presentation.trace, selectedTraceId ?? snapshot.route.spanId);
      } catch {
        recorded = undefined;
      }
    }
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
          React.createElement(Bi.BiSurface, null,
            sharedStyles === undefined ? null : React.createElement("style", { "data-wsr-bi-styles": "wsr-ui-core@0.1.0-rc.0" }, sharedStyles),
            ...presentation.metrics.filter((metric) => snapshot.result.mode !== "COMPARE" || !deltaCoordinates.has(metric.coordinate))
              .map((metric) => React.createElement("article", { key: metric.coordinate, "data-wsr-bi-metric": metric.coordinate },
              snapshot.result.mode === "COMPARE" ? React.createElement("h3", null, metric.coordinate) : null,
              ...metric.sides.map(({ side, slices }) => {
                const result = {
                  metric_id: metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")),
                  metric_version: metric.coordinate.slice(metric.coordinate.lastIndexOf("@") + 1),
                  slices,
                };
                return React.createElement("section", { key: side, "aria-label": `${side} Metric Result` },
                  snapshot.result.mode === "COMPARE" ? React.createElement("h4", null, `${side} side`) : null,
                  metricResultCompatible(result)
                    ? React.createElement(Bi.MetricPanel, {
                      result,
                      visualizer: visualizerFor(result),
                      onEvidence: () => controller.openFacts(metric.coordinate),
                    })
                    : React.createElement(Bi.ScopedError, {
                      announce: "assertive",
                      detail: metric.coordinate,
                      retryable: false,
                      title: "Studio received an incompatible formal Metric Result shape",
                    }));
              }))),
            ...(snapshot.result.mode === "COMPARE" ? presentation.deltas.map((delta) => {
              const before = metricSlice(snapshot.result.left, delta.metric_coordinate, delta.slice_key);
              const after = metricSlice(snapshot.result.right, delta.metric_coordinate, delta.slice_key);
              return React.createElement(Bi.CompareResultFrame, {
                key: `${delta.metric_coordinate}-${sliceIdentity(delta.slice_key)}`,
                coordinate: delta.metric_coordinate,
                before,
                after,
                beforeError: snapshot.result.left?.tag === "SIDE_ERROR" ? snapshot.result.left : undefined,
                afterError: snapshot.result.right?.tag === "SIDE_ERROR" ? snapshot.result.right : undefined,
                delta,
                onRetryFailedSide: () => controller.refresh(),
                onEvidence: (_side) => controller.openFacts(delta.metric_coordinate),
                visualizer: visualizerFor({ slices: [before ?? after].filter(Boolean) }),
              });
            }) : [])),
          React.createElement("details", {
            onToggle: (event) => setTechnicalDetailsOpen(event.currentTarget.open),
          },
          React.createElement("summary", null, "Technical JSON details"),
          technicalDetailsOpen ? json(snapshot.result, "Evaluation result JSON") : null),
          ...presentation.deltas.map((delta) => React.createElement("p", { key: `${delta.metric_coordinate}-${JSON.stringify(delta.slice_key)}` },
            `${delta.metric_coordinate}: ${delta.state}${delta.direction === undefined ? "" : ` · ${delta.direction}`}`))),
      snapshot.route.page === "receipt"
        ? React.createElement("section", { "aria-label": "Evaluation receipts" },
          React.createElement("h2", null, "Receipts"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React.createElement(Bi.BiSurface, null,
            ...presentation.receipts.map(({ side, receipt }) => React.createElement(Bi.ReceiptView, {
              key: side,
              receipt,
              side,
            }))),
          React.createElement("details", { onToggle: (event) => setTechnicalDetailsOpen(event.currentTarget.open) },
            React.createElement("summary", null, "Technical JSON details"),
            technicalDetailsOpen ? json(snapshot.result, "Evaluation receipt JSON") : null)) : null,
      snapshot.route.page === "facts"
        ? React.createElement("section", { "aria-label": "Fact drill-down" },
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React.createElement(Bi.BiSurface, null,
            React.createElement(Bi.EvidenceConsoleFoundation, {
              scope: snapshot.route.scope,
              state: presentation.drilldownError !== undefined
                ? { tag: "ERROR", detail: presentation.drilldownError.message }
                : !factsCompatible
                  ? { tag: "ERROR", detail: "Studio received an incompatible formal Fact shape" }
                  : snapshot.drilldown.phase === "loading"
                    ? { tag: "LOADING" }
                    : facts.length === 0
                      ? { tag: "EMPTY" }
                      : facts.every((row) => row.truth.expiry === "EXPIRED")
                        ? { tag: "EXPIRED" }
                        : { tag: "READY" },
              rows: facts.filter(Boolean),
              references: (snapshot.drilldown.references ?? []).map((reference) => ({
                kind: "PUBLISHED_PROVENANCE",
                identity: reference.identity,
                provenance: reference.identity,
                loadedAsFact: reference.loadedAsFact,
              })),
              onScopeChange: (scope) => {
                controller.openFacts(snapshot.route.metric, scope);
                void controller.loadMetricFacts(snapshot.route.metric, scope);
              },
              onOpenTrace: (traceId, spanId) => {
                controller.openTrace(traceId, spanId);
                void controller.loadTrace({ trace_id: traceId, limit: 200 });
              },
            }))) : null,
      snapshot.route.page === "trace"
        ? React.createElement("section", { "aria-label": "Recorded Trace drill-down" },
          React.createElement("h2", null, "Recorded Trace"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          recorded === undefined
            ? React.createElement("p", { role: presentation.trace.length > 0 ? "alert" : "status" },
              presentation.trace.length > 0 ? "Studio received an incompatible formal Trace shape" : "No recorded Trace items")
            : React.createElement(Bi.BiSurface, null,
              recorded.status === "INVALID" ? React.createElement("p", { role: "alert" }, recorded.errors.join("; ")) : null,
              React.createElement(Bi.RecordedStructureFoundation, { model: recorded.model, onSelect: setSelectedTraceId }))) : null));
  };
}

export function createStudioClientPlugin({ React, Primitives = {}, Bi, sharedStyles, initialContext, storage } = {}) {
  if (React === undefined) throw new Error("STUDIO_REACT_REQUIRED");
  const component = (value) => typeof value === "function" || typeof value === "string";
  if (Bi === undefined || !component(Bi.BiSurface) || !component(Bi.MetricPanel) ||
      !component(Bi.CompareResultFrame) || !component(Bi.ReceiptView) || !component(Bi.ScopedError) ||
      !component(Bi.EvidenceConsoleFoundation) || !component(Bi.RecordedStructureFoundation) ||
      typeof Bi.projectRecordedStructure !== "function") {
    throw new Error("STUDIO_BI_REQUIRED");
  }
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
        }, StudioView(React, Primitives, Bi, sharedStyles, controller));
      });
      return Object.assign(() => dispose?.(), { controller });
    },
  };
}
