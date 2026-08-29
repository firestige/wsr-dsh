import assert from "node:assert/strict";
import test from "node:test";

import {
  DELIVERY_VIEW_ID,
  DELIVERY_VIEW_ORDER,
  createSessionDeliveryView,
  registerSessionDeliveryView,
} from "../src/client/delivery/session-delivery-view.js";

function createReactHarness() {
  let subscribe;
  return {
    React: {
      createElement(type, props, ...children) {
        return { type, props: props ?? {}, children: children.flat(Infinity).filter((child) => child !== null && child !== undefined) };
      },
      useSyncExternalStore(nextSubscribe, getSnapshot) {
        subscribe = nextSubscribe;
        return getSnapshot();
      },
    },
    subscribe: () => subscribe,
  };
}

function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node === null || node === undefined || typeof node !== "object") return "";
  return (node.children ?? []).map(text).join(" ").replace(/\s+/gu, " ").trim();
}

function nodes(node, predicate, output = []) {
  if (node !== null && typeof node === "object") {
    if (predicate(node)) output.push(node);
    for (const child of node.children ?? []) nodes(child, predicate, output);
  }
  return output;
}

function projection(overrides = {}) {
  return Object.freeze({
    sessionId: "session-a",
    binding: Object.freeze({
      state: "current",
      identity: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      deliveryId: "delivery-a",
    }),
    delivery: Object.freeze({
      id: "delivery-a",
      workflow: Object.freeze({ id: "workflow-a", version: "2.1.0" }),
      package: Object.freeze({ name: "hello-world", version: "1.4.2", digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" }),
      snapshot: Object.freeze({ id: "snapshot-a", digest: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" }),
      lifecycle: "running",
      current: Object.freeze({ kind: "action", id: "action-a", label: "Implement" }),
      timing: Object.freeze({ startedAt: "2026-08-29T01:00:00.000Z", endedAt: null, elapsedMs: 1234 }),
      terminal: null,
    }),
    ...overrides,
  });
}

function source(initial) {
  let snapshot = initial;
  const listeners = new Set();
  const calls = { commands: 0 };
  return {
    calls,
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    publish(value) { snapshot = value; for (const listener of listeners) listener(); },
    command() { calls.commands += 1; },
  };
}

test("registers the native Delivery conversation view after Chat and Trajectory without querying status", () => {
  const registrations = [];
  const ctx = { slots: {
    inject(name, callback) { assert.equal(name, "conversation.view"); callback(); },
    register(options, component) { registrations.push({ options, component }); return () => undefined; },
  } };
  const harness = createReactHarness();
  const sessionSource = source({ kind: "empty" });

  registerSessionDeliveryView(ctx, {
    React: harness.React,
    bindProjection: () => sessionSource,
  });

  assert.equal(registrations.length, 1);
  assert.deepEqual(registrations[0].options, {
    name: "conversation.view",
    id: DELIVERY_VIEW_ID,
    order: DELIVERY_VIEW_ORDER,
    label: "Delivery",
    inject: registrations[0].options.inject,
  });
  assert.equal(DELIVERY_VIEW_ORDER, 20);
  assert.deepEqual(registrations[0].options.inject("session-a"), { source: sessionSource });
  assert.equal(sessionSource.calls.commands, 0);
});

test("renders exact owner identities and authoritative lifecycle timing for the current session", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const tree = View({ sessionId: "session-a", source: source({ kind: "ready", projection: projection() }) });
  const rendered = text(tree);

  assert.match(rendered, /delivery-a/u);
  assert.match(rendered, /workflow-a@2\.1\.0/u);
  assert.match(rendered, /hello-world@1\.4\.2/u);
  assert.match(rendered, /sha256:b{64}/u);
  assert.match(rendered, /snapshot-a/u);
  assert.match(rendered, /sha256:c{64}/u);
  assert.match(rendered, /running/u);
  assert.match(rendered, /action-a/u);
  assert.match(rendered, /Implement/u);
  assert.match(rendered, /2026-08-29T01:00:00\.000Z/u);
  assert.match(rendered, /1\.234s/u);
  assert.equal(tree.props["data-wsr-delivery-id"], "delivery-a");
  assert.equal(tree.props.role, "region");
  assert.ok(nodes(tree, (node) => node.props?.["aria-label"] === "Delivery lifecycle").length === 1);
});

test("isolates session switches and rejects a projection scoped to another session", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const first = View({ sessionId: "session-a", source: source({ kind: "ready", projection: projection() }) });
  const second = View({
    sessionId: "session-b",
    source: source({ kind: "ready", projection: projection({ sessionId: "session-b", binding: { state: "current", identity: `sha256:${"d".repeat(64)}`, deliveryId: "delivery-b" }, delivery: { ...projection().delivery, id: "delivery-b" } }) }),
  });
  const stale = View({ sessionId: "session-b", source: source({ kind: "ready", projection: projection() }) });

  assert.match(text(first), /delivery-a/u);
  assert.doesNotMatch(text(first), /delivery-b/u);
  assert.match(text(second), /delivery-b/u);
  assert.doesNotMatch(text(second), /delivery-a/u);
  assert.equal(stale.props.role, "alert");
  assert.match(text(stale), /stale binding/u);
});

test("subscribes to owner replay so reload and recovered state render without a command", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const sessionSource = source({ kind: "loading" });
  const first = View({ sessionId: "session-a", source: sessionSource });
  let notified = false;
  const unsubscribe = harness.subscribe()(() => { notified = true; });
  sessionSource.publish({ kind: "ready", projection: projection({ binding: { ...projection().binding, state: "recovered" } }) });
  const replay = View({ sessionId: "session-a", source: sessionSource });

  assert.match(text(first), /Loading Delivery/u);
  assert.equal(notified, true);
  assert.match(text(replay), /recovered/u);
  assert.equal(sessionSource.calls.commands, 0);
  unsubscribe();
});

test("renders empty, detached, recoverable, terminal and provider-error states accessibly", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const empty = View({ sessionId: "session-a", source: source({ kind: "empty" }) });
  const error = View({ sessionId: "session-a", source: source({ kind: "error", code: "CONTROL_UNAVAILABLE", message: "Execution projection unavailable" }) });
  const detached = View({ sessionId: "session-a", source: source({ kind: "ready", projection: projection({ binding: { ...projection().binding, state: "detached" }, delivery: { ...projection().delivery, lifecycle: "recoverable" } }) }) });
  const failed = View({ sessionId: "session-a", source: source({ kind: "ready", projection: projection({ delivery: { ...projection().delivery, lifecycle: "failed", current: { kind: "intervention", id: "intervention-a", label: "Review failure" }, timing: { startedAt: "2026-08-29T01:00:00.000Z", endedAt: "2026-08-29T01:01:00.000Z", elapsedMs: 60000 }, terminal: { outcome: "failed", error: { code: "ACTION_FAILED", message: "Action failed safely" } } } }) }) });

  assert.equal(empty.props.role, "status");
  assert.match(text(empty), /No Delivery bound/u);
  assert.equal(error.props.role, "alert");
  assert.match(text(error), /CONTROL_UNAVAILABLE/u);
  assert.match(text(detached), /detached/u);
  assert.match(text(detached), /recoverable/u);
  assert.equal(failed.props.role, "alert");
  assert.match(text(failed), /intervention-a/u);
  assert.match(text(failed), /Review failure/u);
  assert.match(text(failed), /ACTION_FAILED/u);
  assert.match(text(failed), /Action failed safely/u);
  assert.match(text(failed), /1m 0s/u);
});

test("fails closed for malformed, unknown lifecycle and mismatched Delivery identity projections", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const values = [
    { kind: "ready", projection: null },
    { kind: "ready", projection: projection({ delivery: { ...projection().delivery, lifecycle: "invented" } }) },
    { kind: "ready", projection: projection({ delivery: { ...projection().delivery, id: "delivery-other" } }) },
  ];

  for (const value of values) {
    const tree = View({ sessionId: "session-a", source: source(value) });
    assert.equal(tree.props.role, "alert");
    assert.match(text(tree), /projection invalid/u);
  }
});

test("fails closed when the owner marks a persisted binding stale", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const tree = View({ sessionId: "session-a", source: source({ kind: "stale", code: "BINDING_IDENTITY_DRIFT" }) });

  assert.equal(tree.props.role, "alert");
  assert.match(text(tree), /Delivery stale binding/u);
  assert.match(text(tree), /BINDING_IDENTITY_DRIFT/u);
});

test("keeps waiting and every terminal lifecycle semantically distinct", () => {
  const harness = createReactHarness();
  const View = createSessionDeliveryView(harness.React);
  const cases = [
    { lifecycle: "waiting", current: { kind: "intervention", id: "approval-a", label: "Approve release" }, outcome: null },
    { lifecycle: "completed", current: null, outcome: "completed" },
    { lifecycle: "cancelled", current: null, outcome: "cancelled" },
    { lifecycle: "detached", current: null, outcome: null },
  ];

  for (const value of cases) {
    const tree = View({ sessionId: "session-a", source: source({
      kind: "ready",
      projection: projection({ delivery: {
        ...projection().delivery,
        lifecycle: value.lifecycle,
        current: value.current,
        terminal: value.outcome === null ? null : { outcome: value.outcome, error: null },
      } }),
    }) });
    assert.match(text(tree), new RegExp(value.lifecycle, "u"));
    if (value.current !== null) assert.match(text(tree), /approval-a · Approve release/u);
    if (value.outcome !== null) assert.match(text(tree), new RegExp(`Outcome ${value.outcome}`, "u"));
  }
});
