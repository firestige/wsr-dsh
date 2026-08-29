const SCHEMA_VERSION = "execution.delivery-inventory@1.0.0";
const PHASES = new Set(["loading", "ready", "reconnecting", "error"]);
const AVAILABILITY = new Set(["bound", "detached", "recoverable"]);
const WORKSPACE_KEY = "wsr.sidebar.workspace.expanded.v1";
const DELIVERY_KEY = "wsr.sidebar.delivery.expanded.v1";

function errorView(label = "Delivery inventory unavailable") {
  return Object.freeze({ kind: "error", role: "alert", label, rows: Object.freeze([]) });
}

function validString(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 512;
}

function rowsFrom(items, selectedSessionId) {
  if (!Array.isArray(items)) return undefined;
  const identities = new Set();
  const rows = [];
  for (const item of items) {
    if (item === null || typeof item !== "object" || Array.isArray(item)
      || !validString(item.deliveryId) || !validString(item.label)
      || !validString(item.statusLabel) || !validString(item.sortKey)
      || !AVAILABILITY.has(item.availability)
      || !(item.sessionId === null || validString(item.sessionId))
      || (item.availability === "bound" && item.sessionId === null)
      || (item.availability !== "bound" && item.sessionId !== null)
      || identities.has(item.deliveryId)) return undefined;
    identities.add(item.deliveryId);
    rows.push(Object.freeze({
      deliveryId: item.deliveryId,
      label: item.label,
      statusLabel: item.statusLabel,
      sessionId: item.sessionId,
      availability: item.availability,
      selected: item.sessionId !== null && item.sessionId === selectedSessionId,
      sortKey: item.sortKey,
    }));
  }
  rows.sort((left, right) => left.sortKey.localeCompare(right.sortKey) || left.deliveryId.localeCompare(right.deliveryId));
  return Object.freeze(rows.map(({ sortKey: _sortKey, ...row }) => Object.freeze(row)));
}

export function projectDeliveryInventory(snapshot, { selectedSessionId } = {}) {
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)
    || snapshot.schemaVersion !== SCHEMA_VERSION || !PHASES.has(snapshot.phase)
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0) return errorView();
  const rows = rowsFrom(snapshot.items, selectedSessionId);
  if (rows === undefined) return errorView();
  if (snapshot.phase === "loading") return Object.freeze({ kind: "loading", role: "status", label: "Loading Deliveries", rows });
  if (snapshot.phase === "reconnecting") return Object.freeze({ kind: "reconnecting", role: "status", label: "Reconnecting to Delivery inventory", rows });
  if (snapshot.phase === "error") {
    const label = validString(snapshot.error?.message) ? snapshot.error.message : "Delivery inventory unavailable";
    return errorView(label);
  }
  if (rows.length === 0) return Object.freeze({ kind: "empty", role: "status", label: "No Deliveries", rows });
  return Object.freeze({ kind: "ready", role: "list", label: "Deliveries", rows });
}

export function createDeliveryInventoryController(projection) {
  if (projection === null || typeof projection !== "object"
    || typeof projection.getSnapshot !== "function" || typeof projection.subscribe !== "function") {
    throw new TypeError("Execution inventory projection must be read-only and subscribable");
  }
  const controller = {
    getSnapshot() {
      try { return projectDeliveryInventory(projection.getSnapshot()); }
      catch { return errorView(); }
    },
    subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("inventory listener must be a function");
      const unsubscribe = projection.subscribe(() => listener(controller.getSnapshot()));
      if (typeof unsubscribe !== "function") throw new TypeError("inventory subscription must return an unsubscribe function");
      return unsubscribe;
    },
  };
  return Object.freeze(controller);
}

function persistedBoolean(value) {
  return value === "false" ? false : true;
}

export function createMemoryCollapseStore(storage = {}) {
  const listeners = new Set();
  const read = typeof storage.read === "function" ? storage.read : () => undefined;
  const write = typeof storage.write === "function" ? storage.write : () => undefined;
  let snapshot;
  try {
    snapshot = Object.freeze({
      workspaceExpanded: persistedBoolean(read(WORKSPACE_KEY)),
      deliveryExpanded: persistedBoolean(read(DELIVERY_KEY)),
    });
  } catch {
    snapshot = Object.freeze({ workspaceExpanded: true, deliveryExpanded: true });
  }
  const update = (name, key, value) => {
    const next = Boolean(value);
    if (snapshot[name] === next) return;
    snapshot = Object.freeze({ ...snapshot, [name]: next });
    try { write(key, String(next)); } catch { /* persistence denial is non-fatal */ }
    for (const listener of listeners) listener();
  };
  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setWorkspaceExpanded(value) { update("workspaceExpanded", WORKSPACE_KEY, value); },
    setDeliveryExpanded(value) { update("deliveryExpanded", DELIVERY_KEY, value); },
  });
}

