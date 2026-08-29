import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

import {
  createDeliveryInventoryController,
  createMemoryCollapseStore,
  projectDeliveryInventory,
} from "./model.js";

const READY = Object.freeze({
  schemaVersion: "execution.delivery-inventory@1.0.0",
  phase: "ready",
  revision: 7,
  items: Object.freeze([
    Object.freeze({ deliveryId: "delivery-b", label: "Beta", statusLabel: "Running", sessionId: "session-b", availability: "bound", sortKey: "002" }),
    Object.freeze({ deliveryId: "delivery-a", label: "Alpha", statusLabel: "Recoverable", sessionId: null, availability: "recoverable", sortKey: "001" }),
  ]),
});

test("projects owner labels deterministically without deriving domain state", () => {
  const view = projectDeliveryInventory(READY, { selectedSessionId: "session-b" });
  assert.equal(view.kind, "ready");
  assert.deepEqual(view.rows.map(({ deliveryId }) => deliveryId), ["delivery-a", "delivery-b"]);
  assert.deepEqual(view.rows[0], {
    deliveryId: "delivery-a",
    label: "Alpha",
    statusLabel: "Recoverable",
    sessionId: null,
    availability: "recoverable",
    selected: false,
  });
  assert.equal(view.rows[1].selected, true);
  assert.ok(Object.isFrozen(view));
  assert.ok(Object.isFrozen(view.rows));
});

test("represents loading, empty, error and reconnecting accessibly", () => {
  assert.deepEqual(projectDeliveryInventory({ schemaVersion: "execution.delivery-inventory@1.0.0", phase: "loading", revision: 0, items: [] }), {
    kind: "loading", role: "status", label: "Loading Deliveries", rows: [],
  });
  assert.deepEqual(projectDeliveryInventory({ schemaVersion: "execution.delivery-inventory@1.0.0", phase: "ready", revision: 1, items: [] }), {
    kind: "empty", role: "status", label: "No Deliveries", rows: [],
  });
  assert.deepEqual(projectDeliveryInventory({ schemaVersion: "execution.delivery-inventory@1.0.0", phase: "reconnecting", revision: 2, items: READY.items }), {
    kind: "reconnecting", role: "status", label: "Reconnecting to Delivery inventory", rows: projectDeliveryInventory(READY).rows,
  });
  assert.deepEqual(projectDeliveryInventory({ schemaVersion: "execution.delivery-inventory@1.0.0", phase: "error", revision: 3, items: [], error: { message: "Inventory unavailable" } }), {
    kind: "error", role: "alert", label: "Inventory unavailable", rows: [],
  });
});

test("fails closed for malformed snapshots and duplicate identities", () => {
  assert.deepEqual(projectDeliveryInventory(null), { kind: "error", role: "alert", label: "Delivery inventory unavailable", rows: [] });
  assert.deepEqual(projectDeliveryInventory({ ...READY, items: [READY.items[0], READY.items[0]] }), {
    kind: "error", role: "alert", label: "Delivery inventory unavailable", rows: [],
  });
});

test("controller subscribes and replays/recoveries without commands or mutation", () => {
  let snapshot = { schemaVersion: "execution.delivery-inventory@1.0.0", phase: "loading", revision: 0, items: [] };
  let listener;
  let reads = 0;
  let unsubscriptions = 0;
  const projection = Object.freeze({
    getSnapshot() { reads += 1; return snapshot; },
    subscribe(notify) { listener = notify; return () => { unsubscriptions += 1; }; },
  });
  const controller = createDeliveryInventoryController(projection);
  const observed = [];
  const unsubscribe = controller.subscribe((value) => observed.push(value.kind));
  assert.deepEqual(Object.keys(controller).sort(), ["getSnapshot", "subscribe"]);
  assert.equal(controller.getSnapshot().kind, "loading");
  snapshot = READY;
  listener();
  snapshot = { schemaVersion: "execution.delivery-inventory@1.0.0", phase: "error", revision: 8, items: [], error: { message: "Disconnected" } };
  listener();
  snapshot = { ...READY, revision: 9 };
  listener();
  assert.deepEqual(observed, ["ready", "error", "ready"]);
  assert.equal(reads, 4);
  unsubscribe();
  assert.equal(unsubscriptions, 1);
});

test("collapse state is independent and persists with safe defaults", () => {
  const persisted = new Map();
  const store = createMemoryCollapseStore({
    read: (key) => persisted.get(key),
    write: (key, value) => persisted.set(key, value),
  });
  assert.deepEqual(store.getSnapshot(), { workspaceExpanded: true, deliveryExpanded: true });
  store.setWorkspaceExpanded(false);
  assert.deepEqual(store.getSnapshot(), { workspaceExpanded: false, deliveryExpanded: true });
  store.setDeliveryExpanded(false);
  assert.deepEqual(store.getSnapshot(), { workspaceExpanded: false, deliveryExpanded: false });
  assert.equal(persisted.get("wsr.sidebar.workspace.expanded.v1"), "false");
  assert.equal(persisted.get("wsr.sidebar.delivery.expanded.v1"), "false");
  const restored = createMemoryCollapseStore({ read: (key) => persisted.get(key), write() {} });
  assert.deepEqual(restored.getSnapshot(), { workspaceExpanded: false, deliveryExpanded: false });
});

test("large inventory stays deterministic and navigates bound sessions only", () => {
  const items = Array.from({ length: 2000 }, (_, index) => Object.freeze({
    deliveryId: `delivery-${String(1999 - index).padStart(4, "0")}`,
    label: `Delivery ${index}`,
    statusLabel: "Owner-projected",
    sessionId: index % 2 === 0 ? `session-${index}` : null,
    availability: index % 2 === 0 ? "bound" : "detached",
    sortKey: String(1999 - index).padStart(4, "0"),
  }));
  const view = projectDeliveryInventory({ ...READY, items });
  assert.equal(view.rows.length, 2000);
  assert.equal(view.rows[0].deliveryId, "delivery-0000");
  assert.equal(view.rows.at(-1).deliveryId, "delivery-1999");
  assert.equal(view.rows.find(({ availability }) => availability === "detached").sessionId, null);
});

test("Harness client owns the single sidebar slot and never scrapes commands or reparents DOM", async () => {
  const source = await readFile(new URL("./client.js", import.meta.url), "utf8");
  assert.match(source, /require\("@deepseek-ai\/dsh-client-ui-workspace"\)/u);
  assert.match(source, /originalSlots\.register\(definition, createSidebarResources\(component, projection\)\)/u);
  assert.match(source, /React\.createElement\(WorkspaceBrowser/u);
  assert.doesNotMatch(source, /\.command\(|\/wsr list|querySelector|appendChild|insertBefore/u);
  assert.match(source, /height:32px/u);
  assert.match(source, /font-size:14px/u);
  assert.match(source, /--dsw-alias-interactive-bg-hover/u);

  let loaded;
  const context = vm.createContext({
    window: { __ModuleLoader__: { load(definition) { loaded = definition; } } },
  });
  vm.runInContext(source, context);
  assert.equal(loaded.id, "dsh-wsr-execution/delivery-inventory");
  const registrations = [];
  let upstreamApplied = false;
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useMemo(factory) { return factory(); },
    useState(initial) { return [initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  function WorkspaceBrowser() { return null; }
  const module = loaded.factory((name) => {
    if (name === "react") return React;
    if (name === "@deepseek-ai/dsh-client-ui-workspace") return { inject: ["slots"], apply(ctx) {
      upstreamApplied = true;
      ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({ name: "sidebar.workspaces", inject: () => ({}) }, WorkspaceBrowser));
      ctx.slots.inject("conversation.hero.workspace", () => ctx.slots.register({ name: "conversation.hero.workspace" }, () => null));
    } };
    throw new Error(`unexpected module ${name}`);
  });
  const projection = Object.freeze({ getSnapshot: () => READY, subscribe: () => () => undefined });
  const ctx = {
    opened: [],
    get(name) { assert.equal(name, "executionInventory"); return projection; },
    slots: {
      inject(_name, factory) { return factory(); },
      register(definition, component) { registrations.push({ definition, component }); return () => undefined; },
    },
  };
  module.apply(ctx);
  assert.equal(upstreamApplied, true);
  assert.deepEqual(registrations.map(({ definition }) => definition.name), ["sidebar.workspaces", "conversation.hero.workspace"]);
  assert.equal(registrations[0].component.name, "WsrSidebarResources");
  const tree = registrations[0].component({
    wide: true,
    useSessions: (select) => select({ current: "session-b" }),
    open: (sessionId) => ctx.opened.push(sessionId),
  });
  assert.equal(tree.props["data-wsr-sidebar-resources"], "true");
  assert.equal(tree.children[0].props["aria-label"], "Workspace");
  assert.equal(tree.children[1].props["aria-label"], "Delivery");
  const deliveryList = tree.children[1].children[1].children[0];
  const rows = deliveryList.children[0];
  assert.equal(rows[0].props.disabled, true);
  assert.equal(rows[1].props["aria-current"], "page");
  rows[1].props.onClick();
  assert.deepEqual(ctx.opened, ["session-b"]);
});

test("fixed upstream Workspace UI coordinate and MIT attribution are exact", async () => {
  const attribution = await readFile(new URL("./UPSTREAM.md", import.meta.url), "utf8");
  const license = await readFile(new URL("./LICENSE.upstream", import.meta.url), "utf8");
  assert.match(attribution, /@deepseek-ai\/dsh-client-ui-workspace@0\.1\.1-rc\.2/u);
  assert.match(attribution, /sha512-k\/jB5ke2e\+oNyNKzu4\/PBlriwCHKVg5bY3kn7Co3MtWZdqbJ42hfwZkRNMnn\+nmziQXCVXWRzuiHZt0xNTAveA==/u);
  assert.match(attribution, /75d8a09a43a820e0ff8470e7b9c87b6dced523764ee650a8382317f6ef7a314b/u);
  assert.match(attribution, /packages\/client\/ui-workspace/u);
  assert.match(license, /MIT License/u);
  assert.match(license, /Copyright \(c\) 2026 DeepSeek/u);
});
