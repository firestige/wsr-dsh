import { createEvaluateController, projectStudioPresentation } from "./evaluate-model.js";

export const STUDIO_PAGES = Object.freeze([
  Object.freeze({ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" }),
]);

export const STUDIO_TRACE_VIEWS = Object.freeze([
  Object.freeze({ id: "waterfall", label: "Waterfall", renderer: "TraceWaterfall" }),
  Object.freeze({ id: "tree", label: "Tree", renderer: "TraceTree" }),
  Object.freeze({ id: "statistics", label: "Statistics", renderer: "TraceStatistics" }),
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

const DEFAULT_LAYOUT = Object.freeze({
  schemaVersion: "wsr-dsh.studio-layout@1",
  columns: Object.freeze({ desktop: 12, tablet: 6, mobile: 1 }),
  panels: Object.freeze([
    ["operational-latency", 3, 2, 3, 2, 1, 2],
    ["delivery-cycle-time", 3, 2, 3, 2, 1, 2],
    ["usage-availability", 3, 2, 3, 2, 1, 2],
    ["cohort-eligibility", 3, 2, 3, 2, 1, 2],
    ["role-template-rework-rate", 6, 3, 3, 3, 1, 3],
    ["role-model-task-outcome-rate", 6, 3, 3, 3, 1, 3],
    ["delivery-stage-reach", 12, 4, 6, 4, 1, 4],
  ].map(([id, dw, dh, tw, th, mw, mh]) => Object.freeze({
    id,
    desktop: Object.freeze({ w: dw, h: dh }),
    tablet: Object.freeze({ w: tw, h: th }),
    mobile: Object.freeze({ w: mw, h: mh }),
  }))),
});
const DASHBOARD_STORAGE_KEY = "wsr.studio.dashboard-layout@1";

export function createDefaultStudioLayout() {
  return DEFAULT_LAYOUT;
}

export function createStudioTheme(mode) {
  if (mode !== "light" && mode !== "dark") throw new Error("UNKNOWN_STUDIO_THEME");
  return Object.freeze({ mode, density: "compact", containerBorderStyle: "solid" });
}

export function createStudioDashboardState(panelIds) {
  if (!Array.isArray(panelIds) || new Set(panelIds).size !== panelIds.length ||
      !panelIds.every((id) => typeof id === "string" && id.length > 0)) {
    throw new Error("INVALID_STUDIO_PANELS");
  }
  return Object.freeze({
    defaults: Object.freeze([...panelIds]),
    order: Object.freeze([...panelIds]),
    hidden: Object.freeze([]),
    sizes: Object.freeze({}),
  });
}

export function reduceStudioDashboardState(state, action) {
  if (action.type === "RESET" || action.type === "PRESET") {
    if (action.type === "PRESET" && action.preset !== "default") throw new Error("UNKNOWN_STUDIO_LAYOUT_PRESET");
    return createStudioDashboardState(state.defaults);
  }
  const known = state.order.includes(action.panelId);
  if (!known) throw new Error("UNKNOWN_STUDIO_PANEL");
  if (action.type === "REMOVE") return Object.freeze({
    ...state,
    hidden: Object.freeze([...new Set([...state.hidden, action.panelId])]),
  });
  if (action.type === "ADD") return Object.freeze({
    ...state,
    hidden: Object.freeze(state.hidden.filter((id) => id !== action.panelId)),
  });
  if (action.type === "RESIZE") {
    if (!["compact", "wide", "full"].includes(action.size)) throw new Error("UNKNOWN_STUDIO_PANEL_SIZE");
    return Object.freeze({ ...state, sizes: Object.freeze({ ...state.sizes, [action.panelId]: action.size }) });
  }
  if (action.type === "MOVE") {
    if (!state.order.includes(action.beforePanelId)) throw new Error("UNKNOWN_STUDIO_PANEL");
    const order = state.order.filter((id) => id !== action.panelId);
    order.splice(order.indexOf(action.beforePanelId), 0, action.panelId);
    return Object.freeze({ ...state, order: Object.freeze(order) });
  }
  throw new Error("UNKNOWN_STUDIO_LAYOUT_ACTION");
}

function validDashboardState(value) {
  const uniqueStrings = (items) => Array.isArray(items) &&
    items.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(items).size === items.length;
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    uniqueStrings(value.defaults) && uniqueStrings(value.order) && uniqueStrings(value.hidden) &&
    value.defaults.every((id) => value.order.includes(id)) &&
    value.hidden.every((id) => value.order.includes(id)) &&
    value.sizes !== null && typeof value.sizes === "object" && !Array.isArray(value.sizes) &&
    Object.entries(value.sizes).every(([id, size]) => value.order.includes(id) && ["compact", "wide", "full"].includes(size));
}

export function createStudioLayoutStore(storage) {
  return Object.freeze({
    load(fallback) {
      if (storage === undefined) return fallback;
      try {
        const encoded = storage.getItem(DASHBOARD_STORAGE_KEY);
        if (encoded === null) return fallback;
        const parsed = JSON.parse(encoded);
        if (!validDashboardState(parsed)) return fallback;
        return Object.freeze({
          defaults: Object.freeze([...parsed.defaults]),
          order: Object.freeze([...parsed.order]),
          hidden: Object.freeze([...parsed.hidden]),
          sizes: Object.freeze({ ...parsed.sizes }),
        });
      } catch {
        return fallback;
      }
    },
    save(state) {
      if (!validDashboardState(state)) throw new Error("INVALID_STUDIO_LAYOUT_STATE");
      storage?.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(state));
    },
  });
}

const hostStyles = `
#wsr-studio-view { --studio-surface:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,var(--dsw-alias-label-primary)); --studio-raised:color-mix(in srgb,var(--dsw-alias-bg-base) 82%,var(--dsw-alias-label-primary)); }
#wsr-studio-view, #wsr-studio-view > *, #wsr-studio-view .studio-page-copy { min-width:0; max-width:100%; }
#wsr-studio-view [data-wsr-studio-region="header"] { overflow:hidden; border:1px solid var(--dsw-alias-border-l2); border-radius:10px; background:var(--studio-surface); }
#wsr-studio-view .studio-product-row, #wsr-studio-view .studio-page-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; }
#wsr-studio-view .studio-product-row { min-height:44px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-breadcrumbs, #wsr-studio-view .studio-controls, #wsr-studio-view .studio-mode { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
#wsr-studio-view .studio-breadcrumbs { color:var(--dsw-alias-label-secondary); font-size:12px; }
#wsr-studio-view .studio-page-copy h1 { margin:2px 0; font-size:20px; }
#wsr-studio-view .studio-page-copy p, #wsr-studio-view .studio-selection-copy { margin:2px 0; color:var(--dsw-alias-label-secondary); font-size:12px; }
#wsr-studio-view .studio-page-copy p { overflow-wrap:anywhere; }
#wsr-studio-view .studio-eyebrow { display:block; color:var(--dsw-alias-label-secondary); font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
#wsr-studio-view .studio-view-link[aria-current="page"] { border-color:var(--dsw-alias-blue-l1); color:var(--dsw-alias-blue-l1); }
#wsr-studio-view [data-wsr-studio-region="main"] { margin-top:12px; }
#wsr-studio-view .studio-selection-grid { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(250px,.75fr); gap:12px; }
#wsr-studio-view .studio-selection-card { overflow:hidden; border:1px solid var(--dsw-alias-border-l2); border-radius:10px; background:var(--studio-surface); }
#wsr-studio-view .studio-selection-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-task-list { display:grid; max-height:min(50vh,520px); margin:0; padding:6px 10px; overflow:auto; list-style:none; }
#wsr-studio-view .studio-task-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; min-height:52px; gap:10px; padding:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-task-row label { display:flex; align-items:center; gap:9px; min-width:0; }
#wsr-studio-view .studio-task-id { display:block; color:var(--dsw-alias-label-secondary); font:11px ui-monospace,monospace; overflow-wrap:anywhere; }
#wsr-studio-view .studio-selected-list { display:grid; gap:8px; padding:12px; }
#wsr-studio-view .studio-selected-item { padding:10px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--studio-raised); }
#wsr-studio-view [data-wsr-dashboard-layout] { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:12px; }
#wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span var(--studio-panel-desktop-columns,3); min-width:0; }
#wsr-studio-view [data-wsr-studio-region="footer"] { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:12px; padding:12px 14px; border:1px dashed var(--dsw-alias-border-l2); border-radius:10px; background:var(--studio-surface); }
@media (max-width:900px) { #wsr-studio-view [data-wsr-dashboard-layout] { grid-template-columns:repeat(6,minmax(0,1fr)); } #wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span var(--studio-panel-tablet-columns,3); } }
@media (max-width:700px) { #wsr-studio-view .studio-selection-grid { grid-template-columns:1fr; } #wsr-studio-view .studio-product-row, #wsr-studio-view .studio-page-row { align-items:flex-start; flex-direction:column; } }
@media (max-width:560px) { #wsr-studio-view [data-wsr-dashboard-layout] { grid-template-columns:1fr; } #wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span 1 !important; } }
`;

function platformThemeMode(explicitMode) {
  if (explicitMode === "light" || explicitMode === "dark") return explicitMode;
  if (typeof document !== "undefined" && document.body?.hasAttribute("data-ds-dark-theme")) return "dark";
  if (typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function studioPanelPlacement(panelId, size) {
  if (size === "full") return { desktop: 12, tablet: 6, mobile: 1 };
  if (size === "wide") return { desktop: 6, tablet: 6, mobile: 1 };
  if (size === "compact") return { desktop: 3, tablet: 3, mobile: 1 };
  const configured = DEFAULT_LAYOUT.panels.find(({ id }) => id === panelId);
  return configured === undefined
    ? { desktop: 3, tablet: 3, mobile: 1 }
    : { desktop: configured.desktop.w, tablet: configured.tablet.w, mobile: configured.mobile.w };
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

function StudioView(React, Primitives, Bi, sharedStyles, controller, explicitThemeMode, layoutStorage) {
  const Button = Primitives.Button ?? "button";
  const DisclosureRow = Primitives.DisclosureRow;
  const JsonTree = Primitives.JsonTree;
  return function StudioConversationView() {
    const [technicalDetailsOpen, setTechnicalDetailsOpen] = React.useState(false);
    const [traceView, setTraceView] = React.useState("waterfall");
    const [taskQuery, setTaskQuery] = React.useState("");
    const [editingDashboard, setEditingDashboard] = React.useState(false);
    const snapshot = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const [studioPage, setStudioPage] = React.useState(() =>
      snapshot.result !== undefined || ["receipt", "facts", "trace"].includes(snapshot.route.page)
        ? "dashboard"
        : "selection");
    const [selectionRequested, setSelectionRequested] = React.useState(false);
    React.useEffect(() => {
      if (!selectionRequested &&
          (snapshot.result !== undefined || ["receipt", "facts", "trace"].includes(snapshot.route.page)) &&
          studioPage !== "dashboard") {
        setStudioPage("dashboard");
      }
    }, [selectionRequested, snapshot.result, snapshot.route.page, studioPage]);
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
        recorded = Bi.compileTraceView(presentation.trace);
      } catch {
        recorded = undefined;
      }
    }
    const theme = Bi.createBiTheme(createStudioTheme(platformThemeMode(explicitThemeMode)));
    const json = (data, label) => JsonTree === undefined
      ? React.createElement("pre", { "aria-label": label }, JSON.stringify(data, null, 2))
      : React.createElement(JsonTree, { data, label, copyable: true, expandTopLevel: true });
    const taskItems = snapshot.taskList.items ?? [];
    const visibleTaskItems = taskItems.filter((task) => {
      const query = taskQuery.trim().toLocaleLowerCase();
      return query === "" || task.task_id.toLocaleLowerCase().includes(query) ||
        task.display_name?.toLocaleLowerCase().includes(query);
    });
    const current = snapshot.selection?.mode === "single" ? snapshot.selection.taskIds : [];
    const before = snapshot.selection?.mode === "compare" ? snapshot.selection.leftTaskIds : [];
    const after = snapshot.selection?.mode === "compare" ? snapshot.selection.rightTaskIds : [];
    const metricPanelIds = presentation.metrics.map((metric) => metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")));
    const layoutStore = createStudioLayoutStore(layoutStorage);
    const [dashboardState, setDashboardState] = React.useState(() =>
      layoutStore.load(createStudioDashboardState(DEFAULT_LAYOUT.panels.map(({ id }) => id))));
    const [savedDashboardState, setSavedDashboardState] = React.useState(dashboardState);
    const expandedDashboardState = dashboardState.order === undefined ? dashboardState : {
      ...dashboardState,
      order: [...dashboardState.order, ...metricPanelIds.filter((id) => !dashboardState.order.includes(id))],
    };
    const dashboardMetrics = [...presentation.metrics]
      .filter((metric) => !expandedDashboardState.hidden.includes(metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@"))))
      .sort((left, right) => expandedDashboardState.order.indexOf(left.coordinate.slice(0, left.coordinate.lastIndexOf("@"))) -
        expandedDashboardState.order.indexOf(right.coordinate.slice(0, right.coordinate.lastIndexOf("@"))));
    const updateDashboard = (action) => setDashboardState(
      reduceStudioDashboardState(expandedDashboardState, action));
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
    const evaluateSelection = async () => {
      await controller.evaluate();
      if (controller.getSnapshot().result !== undefined) {
        setSelectionRequested(false);
        setStudioPage("dashboard");
      }
    };
    const pageIdentity = studioPage === "selection"
      ? { eyebrow: "New evaluation", title: "Select task population", detail: "Choose exact Task identities; display names are recognition only." }
      : snapshot.route.page === "trace"
        ? { eyebrow: "Recorded Evidence · exact identity", title: "Recorded Trace", detail: `${snapshot.route.traceId} · current evaluation · no inferred causality` }
        : snapshot.route.page === "facts"
          ? { eyebrow: "Evaluation Evidence", title: "Evidence", detail: "Exact recorded Facts and provenance for the current evaluation." }
          : snapshot.route.page === "receipt"
            ? { eyebrow: "Resolved evaluation context", title: "Evaluation receipt", detail: "Exact selection and resolved read-set identities." }
            : { eyebrow: `${snapshot.result?.mode === "COMPARE" ? "Compare" : "Single"} evaluation`, title: "Current evaluation", detail: "Current receipt · exact selection" };
    return React.createElement("section", {
      id: "wsr-studio-view", role: "region", "aria-labelledby": "wsr-studio-title",
      "data-wsr-studio-view": "evaluate", style: viewStyle,
    },
    React.createElement("style", { "data-wsr-studio-host-styles": "wsr-dsh@1" }, hostStyles),
    sharedStyles === undefined ? null : React.createElement("style", { "data-wsr-bi-styles": "wsr-ui-core@0.1.0-rc.0" }, sharedStyles),
    React.createElement("header", { "data-wsr-studio-region": "header" },
      React.createElement("div", { className: "studio-product-row" },
        React.createElement("div", { className: "studio-breadcrumbs" },
          React.createElement("strong", null, "WSR Studio"),
          React.createElement("span", null, "/"),
          React.createElement("span", null, "Evaluation"),
          snapshot.route.page === "trace" ? React.createElement(React.Fragment, null,
            React.createElement("span", null, "/"), React.createElement("span", null, "Trace")) : null),
        React.createElement("nav", { className: "studio-controls", "aria-label": "Studio views" },
          React.createElement(Button, { className: "studio-view-link", type: "button", "aria-current": studioPage === "selection" ? "page" : undefined, onClick: () => {
            setSelectionRequested(true);
            setStudioPage("selection");
          } }, "Select"),
          React.createElement(Button, { className: "studio-view-link", type: "button", disabled: snapshot.result === undefined && !["receipt", "facts", "trace"].includes(snapshot.route.page), "aria-current": studioPage === "dashboard" && snapshot.route.page === "results" ? "page" : undefined, onClick: () => {
            controller.backToResults();
            setSelectionRequested(false);
            setStudioPage("dashboard");
          } }, "Dashboard"),
          React.createElement(Button, { className: "studio-view-link", type: "button", disabled: snapshot.route.page !== "facts", "aria-current": snapshot.route.page === "facts" ? "page" : undefined }, "Evidence"),
          React.createElement(Button, { className: "studio-view-link", type: "button", disabled: snapshot.route.page !== "trace", "aria-current": snapshot.route.page === "trace" ? "page" : undefined }, "Recorded Trace"))),
      React.createElement("div", { className: "studio-page-row" },
        React.createElement("div", { className: "studio-page-copy" },
          React.createElement("span", { className: "studio-eyebrow" }, pageIdentity.eyebrow),
          React.createElement("h1", { id: "wsr-studio-title" }, pageIdentity.title),
          React.createElement("p", null, pageIdentity.detail)),
        React.createElement("div", { className: "studio-controls", "aria-label": "Page actions" },
          studioPage === "selection" ? React.createElement(React.Fragment, null,
            snapshot.taskList.phase === "idle" ? React.createElement(Button, { type: "button", onClick: () => controller.loadTasks() }, "Load Tasks") : null,
            React.createElement(Button, { type: "button", disabled: snapshot.selection === undefined, onClick: evaluateSelection }, "Evaluate selection")) : null,
          studioPage === "dashboard" && snapshot.route.page === "results" ? React.createElement(React.Fragment, null,
            snapshot.result === undefined ? null : React.createElement(Button, { type: "button", onClick: () => controller.openReceipt() }, "View receipt"),
            React.createElement(Button, { type: "button", onClick: () => setDashboardState(reduceStudioDashboardState(expandedDashboardState, { type: "PRESET", preset: "default" })) }, "Default overview"),
            React.createElement(Button, { type: "button", onClick: () => {
              setSelectionRequested(true);
              setStudioPage("selection");
            } }, "Change evaluation")) : null,
          studioPage === "dashboard" && snapshot.route.page === "trace" ? React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Dashboard") : null,
          studioPage === "dashboard" && editingDashboard
            ? React.createElement(React.Fragment, null,
              React.createElement(Button, { type: "button", onClick: () => setDashboardState(reduceStudioDashboardState(expandedDashboardState, { type: "RESET" })) }, "Reset layout"),
              React.createElement(Button, { type: "button", onClick: () => {
                layoutStore.save(expandedDashboardState);
                setSavedDashboardState(expandedDashboardState);
                setEditingDashboard(false);
              } }, "Save layout"),
              React.createElement(Button, { type: "button", onClick: () => {
                setDashboardState(savedDashboardState);
                setEditingDashboard(false);
              } }, "Cancel editing"))
            : studioPage === "dashboard" && snapshot.route.page === "results" ? React.createElement(Button, { type: "button", "aria-pressed": false, onClick: () => {
              setSavedDashboardState(expandedDashboardState);
              setEditingDashboard(true);
            } }, "Edit dashboard") : null)),
      studioPage === "dashboard" && editingDashboard && metricPanelIds.some((id) => expandedDashboardState.hidden.includes(id))
        ? React.createElement("div", { className: "studio-controls", "aria-label": "Add dashboard panels" },
          ...metricPanelIds.filter((id) => expandedDashboardState.hidden.includes(id)).map((panelId) =>
            React.createElement(Button, { key: panelId, type: "button", onClick: () => updateDashboard({ type: "ADD", panelId }) }, `Add ${panelId}`)))
        : null,
      ),
    React.createElement("main", {
      tabIndex: -1,
      "data-wsr-studio-region": "main",
      "data-wsr-studio-page": studioPage,
    },
      snapshot.phase === "loading" || snapshot.refreshing
        ? React.createElement("p", { role: "status", "aria-live": "polite" }, snapshot.refreshing ? "Refreshing evaluation…" : "Loading evaluation…") : null,
      snapshot.error === undefined ? null
        : React.createElement("section", { role: "alert", "aria-live": "assertive" },
          React.createElement("h2", null, snapshot.result === undefined ? "Evaluate unavailable" : "Showing the last result"),
          React.createElement("p", null, snapshot.error.message),
          React.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.refresh() }, "Retry")),
      studioPage === "selection" ? React.createElement("section", {
        "aria-labelledby": "wsr-task-selection",
        className: "studio-selection-grid",
      },
        React.createElement("section", { className: "studio-selection-card", "data-wsr-selection-browser": "task-population" },
          React.createElement("header", { className: "studio-selection-head" },
            React.createElement("div", null,
              React.createElement("h2", { id: "wsr-task-selection" }, "Task population"),
              React.createElement("p", { className: "studio-selection-copy" }, `${taskItems.length} Tasks · exact identities retained in the receipt`)),
            React.createElement("div", { className: "studio-mode", role: "radiogroup", "aria-label": "Evaluation mode" },
              React.createElement("label", null,
                React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "single", checked: snapshot.selection?.mode !== "compare", onChange: () => chooseMode("single") }),
                "Single"),
              React.createElement("label", null,
                React.createElement("input", { type: "radio", name: "wsr-evaluation-mode", value: "compare", checked: snapshot.selection?.mode === "compare", onChange: () => chooseMode("compare") }),
                "Compare"))),
          React.createElement("div", { className: "studio-selection-head" },
            React.createElement("input", { type: "search", "aria-label": "Search Tasks", placeholder: "Search name or exact Task ID", value: taskQuery, onChange: (event) => setTaskQuery(event.target.value) }),
            snapshot.taskList.page?.next_cursor ? React.createElement(Button, { type: "button", onClick: () => controller.loadTasks(snapshot.taskList.page.next_cursor) }, "Load more Tasks") : null),
          snapshot.taskList.phase === "error" ? React.createElement("p", { role: "alert" }, "Task list unavailable; the current selection remains usable.") : null,
          snapshot.selection?.mode === "compare"
            ? React.createElement("div", { className: "studio-task-list" }, ...[["Before", "left", before], ["After", "right", after]].flatMap(([label, side, selected]) => [
              React.createElement("strong", { key: `${side}-label` }, label),
              ...visibleTaskItems.map((task) => React.createElement("div", { className: "studio-task-row", "data-wsr-selection-side": side, "data-wsr-task-id": task.task_id, key: `${side}-${task.task_id}` },
                React.createElement("label", null,
                  React.createElement("input", { type: "checkbox", checked: selected.includes(task.task_id), onChange: (event) => setComparedTask(side, task.task_id, event.target.checked) }),
                  React.createElement("span", null, task.display_name ?? task.task_id, React.createElement("small", { className: "studio-task-id" }, task.task_id))),
                React.createElement("span", null, selected.includes(task.task_id) ? "Selected" : "Available")))]))
            : React.createElement("div", { className: "studio-task-list", role: "list" }, ...visibleTaskItems.map((task) => React.createElement("div", { className: "studio-task-row", "data-wsr-task-id": task.task_id, key: task.task_id, role: "listitem" },
              React.createElement("label", null,
                React.createElement("input", { type: "checkbox", checked: current.includes(task.task_id), onChange: (event) => setTask(task.task_id, event.target.checked) }),
                React.createElement("span", null, task.display_name ?? task.task_id, React.createElement("small", { className: "studio-task-id" }, task.task_id))),
              React.createElement("span", null, current.includes(task.task_id) ? "Selected" : "Available")))),
          snapshot.taskList.phase === "ready" && taskItems.length === 0 ? React.createElement("p", { role: "status" }, "No Tasks are available in Evidence.") : null),
        React.createElement("aside", { className: "studio-selection-card", "aria-label": "Current selection" },
          React.createElement("header", { className: "studio-selection-head" },
            React.createElement("div", null,
              React.createElement("h2", null, "Current selection"),
              React.createElement("p", { className: "studio-selection-copy" }, snapshot.selection?.mode === "compare" ? `${before.length} Before · ${after.length} After` : `Single evaluation · ${current.length} Tasks`))),
          React.createElement("div", { className: "studio-selected-list" },
            ...(snapshot.selection?.mode === "compare" ? [["Before", before], ["After", after]] : [["Selected", current]]).flatMap(([label, ids]) => [
              React.createElement("strong", { key: `${label}-heading` }, label),
              ...ids.map((id) => {
                const task = taskItems.find((candidate) => candidate.task_id === id);
                return React.createElement("div", { className: "studio-selected-item", key: `${label}-${id}` },
                  React.createElement("strong", null, task?.display_name ?? id),
                  React.createElement("small", { className: "studio-task-id" }, id));
              }),
            ]),
            React.createElement("p", { className: "studio-selection-copy" }, "Evaluation resolves a current receipt. Layout and display names do not enter evaluation identity.")))) : null,
      studioPage !== "dashboard" || snapshot.route.page !== "results" ? null : snapshot.result === undefined ? React.createElement("p", null, "Choose one or more Tasks to evaluate.")
        : React.createElement("section", { "aria-label": snapshot.result.mode === "COMPARE" ? "Compared Metric Results" : "Metric Results" },
          snapshot.phase === "partial" ? React.createElement("p", { role: "status" }, "Partial comparison: the available side remains visible.") : null,
          React.createElement(Bi.BiSurface, { theme },
            React.createElement("div", {
              "data-wsr-dashboard-layout": DEFAULT_LAYOUT.schemaVersion,
            }, ...dashboardMetrics.filter((metric) => snapshot.result.mode !== "COMPARE" || !deltaCoordinates.has(metric.coordinate))
              .map((metric) => {
                const panelId = metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@"));
                const placement = studioPanelPlacement(panelId, expandedDashboardState.sizes[panelId]);
                return React.createElement("article", {
                  key: metric.coordinate,
                  "data-wsr-bi-metric": metric.coordinate,
                  "data-wsr-dashboard-panel": panelId,
                  style: {
                    "--studio-panel-desktop-columns": placement.desktop,
                    "--studio-panel-tablet-columns": placement.tablet,
                    "--studio-panel-mobile-columns": placement.mobile,
                  },
                },
              editingDashboard ? React.createElement("div", { className: "studio-controls", "aria-label": `${panelId} layout controls` },
                React.createElement(Button, { type: "button", onClick: () => updateDashboard({ type: "RESIZE", panelId, size: placement.desktop >= 12 ? "compact" : placement.desktop >= 6 ? "full" : "wide" }) }, "Resize panel"),
                React.createElement(Button, { type: "button", onClick: () => {
                  const index = expandedDashboardState.order.indexOf(panelId);
                  if (index > 0) updateDashboard({ type: "MOVE", panelId, beforePanelId: expandedDashboardState.order[index - 1] });
                } }, "Move earlier"),
                React.createElement(Button, { type: "button", onClick: () => updateDashboard({ type: "REMOVE", panelId }) }, "Remove panel")) : null,
              snapshot.result.mode === "COMPARE" ? React.createElement("h3", null, metric.coordinate) : null,
              ...metric.sides.map(({ side, slices }) => {
                const result = {
                  metric_id: metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")),
                  metric_version: metric.coordinate.slice(metric.coordinate.lastIndexOf("@") + 1),
                  slices,
                };
                return React.createElement("section", { key: side, "aria-label": `${side} Metric Result` },
                  snapshot.result.mode === "COMPARE" ? React.createElement("h4", null, `${side} side`) : null,
                  React.createElement(Bi.MetricPanel, {
                    result,
                    onEvidence: () => controller.openFacts(metric.coordinate),
                  }));
              }));
              })),
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
                visualizer: Bi.selectDefaultVisualizer({
                  metric_id: delta.metric_coordinate.slice(0, delta.metric_coordinate.lastIndexOf("@")),
                  metric_version: delta.metric_coordinate.slice(delta.metric_coordinate.lastIndexOf("@") + 1),
                  slices: [before ?? after].filter(Boolean),
                }),
              });
            }) : [])),
          React.createElement("details", {
            onToggle: (event) => setTechnicalDetailsOpen(event.currentTarget.open),
          },
          React.createElement("summary", null, "Technical JSON details"),
          technicalDetailsOpen ? json(snapshot.result, "Evaluation result JSON") : null),
          ...presentation.deltas.map((delta) => React.createElement("p", { key: `${delta.metric_coordinate}-${JSON.stringify(delta.slice_key)}` },
            `${delta.metric_coordinate}: ${delta.state}${delta.direction === undefined ? "" : ` · ${delta.direction}`}`))),
      studioPage === "dashboard" && snapshot.route.page === "receipt"
        ? React.createElement("section", { "aria-label": "Evaluation receipts" },
          React.createElement("h2", null, "Receipts"),
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React.createElement(Bi.BiSurface, { theme },
            ...presentation.receipts.map(({ side, receipt }) => React.createElement(Bi.ReceiptView, {
              key: side,
              receipt,
              side,
            }))),
          React.createElement("details", { onToggle: (event) => setTechnicalDetailsOpen(event.currentTarget.open) },
            React.createElement("summary", null, "Technical JSON details"),
            technicalDetailsOpen ? json(snapshot.result, "Evaluation receipt JSON") : null)) : null,
      studioPage === "dashboard" && snapshot.route.page === "facts"
        ? React.createElement("section", { "aria-label": "Fact drill-down" },
          React.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React.createElement(Bi.BiSurface, { theme },
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
      studioPage === "dashboard" && snapshot.route.page === "trace"
        ? React.createElement("section", { "aria-label": "Recorded Trace drill-down" },
          presentation.drilldownError === undefined ? null : React.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          recorded === undefined
            ? React.createElement("p", { role: presentation.trace.length > 0 ? "alert" : "status" },
              presentation.trace.length > 0 ? "Studio received an incompatible formal Trace shape" : "No recorded Trace items")
            : React.createElement(Bi.BiSurface, { theme },
              recorded.status === "INVALID" ? React.createElement("p", { role: "alert" }, recorded.errors.join("; ")) : null,
              React.createElement("div", { className: "studio-controls", role: "group", "aria-label": "Trace view" },
                ...STUDIO_TRACE_VIEWS.map((view) => React.createElement(Button, { key: view.id, type: "button", "aria-pressed": traceView === view.id, onClick: () => setTraceView(view.id) }, view.label))),
              React.createElement(Bi[STUDIO_TRACE_VIEWS.find(({ id }) => id === traceView)?.renderer ?? "TraceWaterfall"], { trace: recorded }))) : null),
      studioPage === "dashboard" && snapshot.route.page === "results" && snapshot.result !== undefined ? React.createElement("footer", { "data-wsr-studio-region": "footer" },
        React.createElement("strong", null, presentation.trace.length > 0 ? "Recorded Trace is available" : "Recorded Trace availability follows current Evidence"),
        React.createElement("span", null, " · exact recorded identities only; no inferred ordering")) : null);
  };
}

export function createStudioClientPlugin({ React, Primitives = {}, Bi, sharedStyles, initialContext, storage, themeMode } = {}) {
  if (React === undefined) throw new Error("STUDIO_REACT_REQUIRED");
  const component = (value) => typeof value === "function" || typeof value === "string";
  if (Bi === undefined || !component(Bi.BiSurface) || !component(Bi.MetricPanel) ||
      !component(Bi.CompareResultFrame) || !component(Bi.ReceiptView) || !component(Bi.ScopedError) ||
      !component(Bi.EvidenceConsoleFoundation) || !component(Bi.TraceWaterfall) || !component(Bi.TraceTree) || !component(Bi.TraceStatistics) ||
      typeof Bi.compileTraceView !== "function" || typeof Bi.selectDefaultVisualizer !== "function" ||
      typeof Bi.createBiTheme !== "function") {
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
        }, StudioView(React, Primitives, Bi, sharedStyles, controller, themeMode, resolvedStorage));
      });
      return Object.assign(() => dispose?.(), { controller });
    },
  };
}
