import { projectDeliveryInventory } from "./model.js";

const STYLE_ID = "dsh-wsr-execution-delivery-inventory";
const CSS = ".wsr-sidebar-resources{min-height:0;flex:1;display:flex;flex-direction:column;gap:4px}.wsr-sidebar-resource{min-height:0;display:flex;flex-direction:column}.wsr-sidebar-resource:first-child{flex:1}.wsr-sidebar-resource-header{box-sizing:border-box;width:100%;height:36px;cursor:pointer;color:var(--dsw-alias-label-tertiary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:13px;text-align:left}.wsr-sidebar-resource-header:hover{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row{box-sizing:border-box;width:100%;height:32px;cursor:pointer;color:var(--dsw-alias-label-primary);background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:14px;line-height:20px;text-align:left}.wsr-delivery-row:hover,.wsr-delivery-row[aria-current=page]{background:var(--dsw-alias-interactive-bg-hover)}.wsr-delivery-row:disabled{cursor:default}.wsr-delivery-row>span:first-child{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden;flex:1}.wsr-delivery-status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px}.wsr-delivery-status-recoverable{color:var(--dsw-alias-state-warning-primary)}";

function installStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID) !== null) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.dataset.plugin = "dsh-wsr-execution";
  tag.textContent = CSS;
  document.head.append(tag);
}

function persisted(key) {
  try { return typeof localStorage === "undefined" || localStorage.getItem(key) !== "false"; }
  catch { return true; }
}

function persist(key, value) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, String(value)); }
  catch { /* browser storage is optional */ }
}

export function createSidebarResources(React, WorkspaceBrowser, inventory) {
  return function WsrSidebarResources(props) {
    const [workspaceExpanded, setWorkspaceExpanded] = React.useState(() => persisted("wsr.sidebar.workspace.expanded.v1"));
    const [deliveryExpanded, setDeliveryExpanded] = React.useState(() => persisted("wsr.sidebar.delivery.expanded.v1"));
    const selectedSessionId = props.useSessions((state) => state.current);
    const state = React.useSyncExternalStore(inventory.subscribe, inventory.getSnapshot, inventory.getSnapshot);
    const view = React.useMemo(() => projectDeliveryInventory(state, { selectedSessionId }), [state, selectedSessionId]);
    const toggle = (kind) => {
      if (kind === "workspace") {
        const next = !workspaceExpanded;
        setWorkspaceExpanded(next);
        persist("wsr.sidebar.workspace.expanded.v1", next);
      } else {
        const next = !deliveryExpanded;
        setDeliveryExpanded(next);
        persist("wsr.sidebar.delivery.expanded.v1", next);
      }
    };
    const header = (id, label, expanded, kind) => React.createElement("button", {
      type: "button", className: "wsr-sidebar-resource-header",
      "aria-controls": id, "aria-expanded": expanded, onClick: () => toggle(kind),
    }, React.createElement("span", { "aria-hidden": "true" }, expanded ? "▾" : "▸"), label);
    return React.createElement("div", { className: "wsr-sidebar-resources", "data-wsr-sidebar-resources": "true" },
      React.createElement("section", { className: "wsr-sidebar-resource", "aria-label": "Workspace" },
        header("wsr-sidebar-workspace", "Workspace", workspaceExpanded, "workspace"),
        workspaceExpanded && React.createElement("div", { id: "wsr-sidebar-workspace" }, React.createElement(WorkspaceBrowser, props))),
      React.createElement("section", { className: "wsr-sidebar-resource", "aria-label": "Delivery" },
        header("wsr-sidebar-delivery", "Delivery", deliveryExpanded, "delivery"),
        deliveryExpanded && React.createElement("div", {
          id: "wsr-sidebar-delivery", role: view.kind === "error" ? "alert" : "region", "aria-live": "polite",
        }, view.kind === "ready"
          ? React.createElement("div", { role: "list", "aria-label": "Deliveries" }, view.rows.map((row) => React.createElement("button", {
              key: row.deliveryId, type: "button", role: "listitem", className: "wsr-delivery-row",
              "aria-current": row.selected ? "page" : undefined,
              "aria-label": `${row.label}, ${row.statusLabel}`,
              disabled: row.sessionId === null,
              onClick: row.sessionId === null ? undefined : () => props.open(row.sessionId),
            }, React.createElement("span", null, row.label), React.createElement("span", {
              className: `wsr-delivery-status wsr-delivery-status-${row.availability}`,
            }, row.statusLabel))))
          : React.createElement("div", { role: view.role }, view.label))));
  };
}

/** Fixed-version Workspace UI composition fork; WSR owns the single slot. */
export function applyDeliverySidebar(ctx, { React, workspaceUi, inventory }) {
  installStyle();
  const originalSlots = ctx.slots;
  const slots = Object.create(originalSlots);
  slots.register = (definition, component) => definition?.name === "sidebar.workspaces"
    ? originalSlots.register(definition, createSidebarResources(React, component, inventory))
    : originalSlots.register(definition, component);
  slots.inject = (name, factory) => originalSlots.inject(name, factory);
  const forked = new Proxy(ctx, { get(target, property) { return property === "slots" ? slots : Reflect.get(target, property); } });
  return workspaceUi.apply(forked);
}
