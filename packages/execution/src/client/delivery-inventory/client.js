window.__ModuleLoader__.load({
  id: "dsh-wsr-execution/delivery-inventory",
  factory: (require) => {
    const module = { exports: {} };
    const React = require("react");
    const workspaceUi = require("@deepseek-ai/dsh-client-ui-workspace");
    const SCHEMA_VERSION = "execution.delivery-inventory@1.0.0";
    const AVAILABILITY = new Set(["bound", "detached", "recoverable"]);
    const storage = typeof localStorage === "undefined" ? undefined : localStorage;
    const STYLE_ID = "dsh-wsr-execution-delivery-inventory";
    const css = ".wsr-sidebar-resources{min-height:0;flex:1;display:flex;flex-direction:column;gap:4px}.wsr-sidebar-resource{min-height:0;display:flex;flex-direction:column}.wsr-sidebar-resource:first-child{flex:1}.wsr-sidebar-resource-header{box-sizing:border-box;width:100%;height:36px;cursor:pointer;color:var(--dsw-alias-label-tertiary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:13px;text-align:left}.wsr-sidebar-resource-header:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row{box-sizing:border-box;width:100%;height:32px;cursor:pointer;color:var(--dsw-alias-label-primary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:14px;line-height:20px;text-align:left}.wsr-delivery-row:hover,.wsr-delivery-row[aria-current=page]{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row:disabled{cursor:default}.wsr-delivery-row>span:first-child{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden;flex:1}.wsr-delivery-status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px}.wsr-delivery-status-recoverable{color:var(--dsw-alias-state-warning-primary)}#wsr-sidebar-delivery>[role=status],#wsr-sidebar-delivery>[role=alert]{color:var(--dsw-alias-label-tertiary);padding:10px 12px;font-size:12px;line-height:18px}";
    if (typeof document !== "undefined" && document.getElementById(STYLE_ID) === null) {
      const tag = document.createElement("style");
      tag.id = STYLE_ID;
      tag.dataset.plugin = "dsh-wsr-execution";
      tag.textContent = css;
      document.head.append(tag);
    }

    function safeSnapshot(projection) {
      try { return projection.getSnapshot(); }
      catch { return null; }
    }

    function rowsFrom(snapshot, selectedSessionId) {
      if (snapshot === null || typeof snapshot !== "object" || snapshot.schemaVersion !== SCHEMA_VERSION
        || !Array.isArray(snapshot.items)) return [];
      const identities = new Set();
      const rows = [];
      for (const item of snapshot.items) {
        if (item === null || typeof item !== "object" || typeof item.deliveryId !== "string"
          || typeof item.label !== "string" || typeof item.statusLabel !== "string"
          || typeof item.sortKey !== "string" || !AVAILABILITY.has(item.availability)
          || !(item.sessionId === null || typeof item.sessionId === "string")
          || identities.has(item.deliveryId)) return [];
        identities.add(item.deliveryId);
        rows.push({ ...item, selected: item.sessionId !== null && item.sessionId === selectedSessionId });
      }
      return rows.sort((left, right) => left.sortKey.localeCompare(right.sortKey) || left.deliveryId.localeCompare(right.deliveryId));
    }

    function persisted(key) {
      try { return storage?.getItem(key) !== "false"; }
      catch { return true; }
    }

    function persist(key, value) {
      try { storage?.setItem(key, String(value)); } catch { /* browser storage is optional */ }
    }

    function createSidebarResources(WorkspaceBrowser, projection) {
      return function WsrSidebarResources(props) {
        const [workspaceExpanded, setWorkspaceExpanded] = React.useState(() => persisted("wsr.sidebar.workspace.expanded.v1"));
        const [deliveryExpanded, setDeliveryExpanded] = React.useState(() => persisted("wsr.sidebar.delivery.expanded.v1"));
        const selectedSessionId = props.useSessions((state) => state.current);
        const snapshot = React.useSyncExternalStore(
          (listener) => projection.subscribe(listener),
          () => safeSnapshot(projection),
          () => safeSnapshot(projection),
        );
        const rows = React.useMemo(() => rowsFrom(snapshot, selectedSessionId), [snapshot, selectedSessionId]);
        const phase = snapshot?.phase;
        const status = phase === "error" ? snapshot?.error?.message ?? "Delivery inventory unavailable"
          : phase === "loading" ? "Loading Deliveries"
            : phase === "reconnecting" ? "Reconnecting to Delivery inventory"
              : rows.length === 0 ? "No Deliveries" : null;
        const toggleWorkspace = () => {
          const next = !workspaceExpanded;
          setWorkspaceExpanded(next);
          persist("wsr.sidebar.workspace.expanded.v1", next);
        };
        const toggleDelivery = () => {
          const next = !deliveryExpanded;
          setDeliveryExpanded(next);
          persist("wsr.sidebar.delivery.expanded.v1", next);
        };
        const header = (id, label, expanded, toggle) => React.createElement("button", {
          type: "button",
          className: "wsr-sidebar-resource-header",
          "aria-controls": id,
          "aria-expanded": expanded,
          onClick: toggle,
        }, React.createElement("span", { "aria-hidden": "true" }, expanded ? "▾" : "▸"), label);
        return React.createElement("div", { className: "wsr-sidebar-resources", "data-wsr-sidebar-resources": "true" },
          React.createElement("section", { className: "wsr-sidebar-resource", "aria-label": "Workspace" },
            header("wsr-sidebar-workspace", "Workspace", workspaceExpanded, toggleWorkspace),
            workspaceExpanded && React.createElement("div", { id: "wsr-sidebar-workspace" }, React.createElement(WorkspaceBrowser, props))),
          React.createElement("section", { className: "wsr-sidebar-resource", "aria-label": "Delivery" },
            header("wsr-sidebar-delivery", "Delivery", deliveryExpanded, toggleDelivery),
            deliveryExpanded && React.createElement("div", { id: "wsr-sidebar-delivery", role: phase === "error" ? "alert" : "region", "aria-live": "polite" },
              status === null
                ? React.createElement("div", { role: "list", "aria-label": "Deliveries" }, rows.map((row) => React.createElement("button", {
                    key: row.deliveryId,
                    type: "button",
                    role: "listitem",
                    className: "wsr-delivery-row",
                    "aria-current": row.selected ? "page" : undefined,
                    "aria-label": `${row.label}, ${row.statusLabel}`,
                    disabled: row.sessionId === null,
                    onClick: row.sessionId === null ? undefined : () => props.open(row.sessionId),
                  }, React.createElement("span", null, row.label), React.createElement("span", { className: `wsr-delivery-status wsr-delivery-status-${row.availability}` }, row.statusLabel))))
                : React.createElement("div", { role: phase === "error" ? "alert" : "status" }, status))));
      };
    }

    function unavailableProjection() {
      const snapshot = Object.freeze({ schemaVersion: SCHEMA_VERSION, phase: "error", revision: 0, items: Object.freeze([]), error: Object.freeze({ message: "Delivery inventory unavailable" }) });
      return Object.freeze({ getSnapshot: () => snapshot, subscribe: () => () => undefined });
    }

    function apply(ctx) {
      let projection;
      try {
        const candidate = ctx.get("executionInventory");
        projection = candidate !== null && typeof candidate === "object"
          && typeof candidate.getSnapshot === "function" && typeof candidate.subscribe === "function"
          ? candidate : unavailableProjection();
      } catch { projection = unavailableProjection(); }
      const originalSlots = ctx.slots;
      const slots = Object.create(originalSlots);
      slots.register = (definition, component) => {
        if (definition?.name !== "sidebar.workspaces") return originalSlots.register(definition, component);
        return originalSlots.register(definition, createSidebarResources(component, projection));
      };
      slots.inject = (name, factory) => originalSlots.inject(name, factory);
      const forked = Object.create(ctx);
      forked.slots = slots;
      workspaceUi.apply(forked);
    }

    module.exports.apply = apply;
    module.exports.inject = Object.freeze([...new Set([...(workspaceUi.inject ?? []), "executionInventory"])]);
    return module.exports;
  },
});
