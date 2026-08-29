import assert from "node:assert/strict";
import test from "node:test";

import {
  DELIVERY_VIEW_ID,
  DELIVERY_VIEW_ORDER,
  createSessionDeliveryView,
  registerSessionDeliveryView,
} from "../src/client/delivery/session-delivery-view.js";

function harness() {
  let subscribe;
  return {
    React: {
      createElement(type, props, ...children) { return { type, props: props ?? {}, children: children.flat(Infinity).filter((child) => child != null) }; },
      useSyncExternalStore(nextSubscribe, getSnapshot) { subscribe = nextSubscribe; return getSnapshot(); },
    },
    subscribe: () => subscribe,
  };
}

function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node?.children ?? []).map(text).join(" ").replace(/\s+/gu, " ").trim();
}

function delivery(overrides = {}) {
  return Object.freeze({
    deliveryId: "delivery-a",
    deliveryBindingIdentity: `sha256:${"a".repeat(64)}`,
    task: Object.freeze({ identity: "task-a", displayName: "Task A" }),
    worktree: "/workspace/a",
    workflow: Object.freeze({
      identity: "workflow-a", packageName: "hello-world", exactPackageVersion: "1.4.2",
      packageDigest: `sha256:${"b".repeat(64)}`, snapshotIdentity: "snapshot-a", snapshotDigest: `sha256:${"c".repeat(64)}`,
    }),
    lifecycle: "RUNNING_CORRELATED",
    detached: false,
    recoverable: true,
    navigation: Object.freeze({ sessionCorrelation: "session-a" }),
    current: Object.freeze({ kind: "ACTION", identity: "action-a" }),
    timing: Object.freeze({ startedAt: Date.parse("2026-08-29T01:00:00.000Z"), updatedAt: Date.parse("2026-08-29T01:00:01.234Z"), elapsedMs: 1234 }),
    terminal: null,
    error: null,
    ...overrides,
  });
}

const bound = (sessionCorrelation = "session-a", value = delivery()) => Object.freeze({
  kind: "ready",
  view: Object.freeze({ kind: "BOUND", sessionCorrelation, delivery: value }),
});
function source(initial) {
  let snapshot = initial;
  const listeners = new Set();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    publish(value) { snapshot = value; for (const listener of listeners) listener(); },
  };
}

test("registers one native Delivery conversation view after Chat and Trajectory", () => {
  const registrations = [];
  const ctx = { slots: {
    inject(name, callback) { assert.equal(name, "conversation.view"); callback(); },
    register(options, component) { registrations.push({ options, component }); },
  } };
  const sessionSource = source({ kind: "loading" });
  registerSessionDeliveryView(ctx, { React: harness().React, bindProjection: () => sessionSource });
  assert.equal(registrations.length, 1);
  assert.equal(registrations[0].options.id, DELIVERY_VIEW_ID);
  assert.equal(registrations[0].options.order, DELIVERY_VIEW_ORDER);
  assert.deepEqual(registrations[0].options.inject("session-a"), { source: sessionSource });
});

test("renders exact formal owner identities and authoritative lifecycle timing", () => {
  const View = createSessionDeliveryView(harness().React);
  const tree = View({ sessionId: "session-a", source: source(bound()) });
  const rendered = text(tree);
  for (const expected of [
    /delivery-a/u, /Task A/u, /workflow-a/u, /hello-world@1\.4\.2/u,
    /sha256:b{64}/u, /snapshot-a/u, /sha256:c{64}/u,
    /RUNNING_CORRELATED/u, /action-a/u, /2026-08-29T01:00:00\.000Z/u, /1\.234s/u,
  ]) assert.match(rendered, expected);
  assert.equal(tree.props["data-wsr-delivery-id"], "delivery-a");
  assert.equal(tree.props.role, "region");
});

test("isolates session switches and rejects a view scoped to another Session", () => {
  const View = createSessionDeliveryView(harness().React);
  const first = View({ sessionId: "session-a", source: source(bound()) });
  const stale = View({ sessionId: "session-b", source: source(bound()) });
  assert.match(text(first), /delivery-a/u);
  assert.equal(stale.props.role, "alert");
  assert.match(text(stale), /projection invalid/u);
});

test("subscribes to replay and recovery without executing a command", () => {
  const hooks = harness();
  const View = createSessionDeliveryView(hooks.React);
  const sessionSource = source({ kind: "loading" });
  assert.match(text(View({ sessionId: "session-a", source: sessionSource })), /Loading Delivery/u);
  let notified = false;
  hooks.subscribe()(() => { notified = true; });
  sessionSource.publish(bound("session-a", delivery({ lifecycle: "RESULT_UNRESOLVED" })));
  assert.equal(notified, true);
  assert.match(text(View({ sessionId: "session-a", source: sessionSource })), /RESULT_UNRESOLVED/u);
});

test("renders unbound, terminal and owner errors accessibly", () => {
  const View = createSessionDeliveryView(harness().React);
  const empty = View({ sessionId: "session-a", source: source({ kind: "ready", view: { kind: "UNBOUND", sessionCorrelation: "session-a" } }) });
  const unavailable = View({ sessionId: "session-a", source: source({ kind: "error", code: "DELIVERY_PROJECTION_UNAVAILABLE", message: "Execution projection unavailable" }) });
  const failed = View({ sessionId: "session-a", source: source(bound("session-a", delivery({
    lifecycle: "TERMINAL", recoverable: false, current: null,
    terminal: Object.freeze({ outcome: "FAILED", finishedAt: Date.parse("2026-08-29T01:01:00.000Z") }),
    error: Object.freeze({ code: "ACTION_FAILED" }),
  }))) });
  assert.equal(empty.props.role, "status");
  assert.match(text(empty), /No Delivery bound/u);
  assert.equal(unavailable.props.role, "alert");
  assert.match(text(unavailable), /DELIVERY_PROJECTION_UNAVAILABLE/u);
  assert.equal(failed.props.role, "alert");
  assert.match(text(failed), /FAILED/u);
  assert.match(text(failed), /ACTION_FAILED/u);
});

test("fails closed for malformed, unknown lifecycle and binding identity drift", () => {
  const View = createSessionDeliveryView(harness().React);
  for (const state of [
    { kind: "ready", view: null },
    bound("session-a", delivery({ lifecycle: "FUTURE" })),
    bound("session-a", delivery({ deliveryBindingIdentity: `sha256:${"d".repeat(63)}` })),
    bound("session-a", delivery({ navigation: { sessionCorrelation: "session-other" } })),
  ]) {
    const tree = View({ sessionId: "session-a", source: source(state) });
    assert.equal(tree.props.role, "alert");
    assert.match(text(tree), /projection invalid/u);
  }
});
