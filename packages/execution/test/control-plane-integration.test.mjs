import assert from "node:assert/strict";
import test from "node:test";

import {
  createDeliveryControlPlaneGateway,
  createDshSessionControlPlaneReadModel,
} from "../src/host/delivery-control-plane.js";
import { inject as intakeInject } from "../src/intake/plugin.js";

test("DSH Intake declares the Host connection service used by its formal projection gateway", () => {
  assert.ok(intakeInject.includes("connection"));
});
import {
  createDeliveryControlPlaneClient,
} from "../src/client/delivery/control-plane-port.js";

const item = Object.freeze({
  deliveryId: "delivery-a",
  deliveryBindingIdentity: `sha256:${"a".repeat(64)}`,
  task: Object.freeze({ identity: "task-a", displayName: "Task A" }),
  worktree: "/workspace/a",
  workflow: Object.freeze({
    identity: "workflow-a",
    packageName: "hello-world",
    exactPackageVersion: "1.2.3",
    packageDigest: `sha256:${"b".repeat(64)}`,
    snapshotIdentity: "snapshot-a",
    snapshotDigest: `sha256:${"c".repeat(64)}`,
  }),
  lifecycle: "RUNNING_CORRELATED",
  detached: false,
  recoverable: true,
  navigation: Object.freeze({ sessionCorrelation: "session-a" }),
  current: Object.freeze({ kind: "ACTION", identity: "action-a" }),
  timing: Object.freeze({ startedAt: 1_777_000_000_000, updatedAt: 1_777_000_001_000, elapsedMs: 1000 }),
  terminal: null,
  error: null,
});

const snapshot = (generation = 1, deliveries = [item]) => Object.freeze({
  schemaVersion: "execution.delivery-control-plane@1.0.0",
  generation,
  deliveries: Object.freeze(deliveries),
});

test("Host gateway consumes the exact async DeliveryControlPlaneReadModel and exposes read RPC only", async () => {
  let inventory = snapshot();
  let listener;
  let onError;
  let disposed = 0;
  const readModel = Object.freeze({
    async snapshot() { return inventory; },
    async session(sessionCorrelation) {
      return sessionCorrelation === "session-a"
        ? Object.freeze({ kind: "BOUND", sessionCorrelation, delivery: item })
        : Object.freeze({ kind: "UNBOUND", sessionCorrelation });
    },
    async subscribe(next, error) {
      listener = next;
      onError = error;
      next(await this.snapshot());
      return () => { disposed += 1; };
    },
  });
  const gateway = await createDeliveryControlPlaneGateway(readModel);

  assert.deepEqual(Object.keys(gateway).sort(), ["close", "handle"]);
  assert.deepEqual(await gateway.handle("inventory/read", {}), { ok: true, value: snapshot() });
  assert.deepEqual(await gateway.handle("session/read", { sessionCorrelation: "session-a" }), {
    ok: true,
    value: { kind: "BOUND", sessionCorrelation: "session-a", delivery: item },
  });
  inventory = snapshot(2, []);
  listener(inventory);
  assert.deepEqual(await gateway.handle("inventory/read", {}), { ok: true, value: inventory });
  onError(Object.assign(new Error("unavailable"), { code: "DELIVERY_PROJECTION_UNAVAILABLE" }));
  assert.deepEqual(await gateway.handle("inventory/read", {}), {
    ok: false,
    error: { code: "DELIVERY_PROJECTION_UNAVAILABLE", message: "Delivery control plane unavailable" },
  });
  await assert.rejects(() => gateway.handle("delivery/delete", { deliveryId: "delivery-a" }), /CONTROL_PLANE_RPC_INVALID/u);
  await gateway.close();
  assert.equal(disposed, 1);
});

test("browser store maps unary Host reads into replayable React snapshots without commands", async () => {
  let remote = snapshot();
  const calls = [];
  const rpc = Object.freeze({ async call(channel, endpoint, payload) {
    calls.push({ channel, endpoint, payload });
    if (endpoint === "inventory/read") return { ok: true, value: remote };
    if (endpoint === "session/read") return { ok: true, value: remote.deliveries.length === 0
      ? { kind: "UNBOUND", sessionCorrelation: payload.sessionCorrelation }
      : { kind: "BOUND", sessionCorrelation: payload.sessionCorrelation, delivery: remote.deliveries[0] } };
    throw new Error("unexpected endpoint");
  } });
  const client = createDeliveryControlPlaneClient(rpc);
  const changes = [];
  const unsubscribe = client.inventory.subscribe(() => changes.push(client.inventory.getSnapshot()));

  assert.deepEqual(client.inventory.getSnapshot(), { kind: "loading" });
  await client.refresh();
  assert.deepEqual(client.inventory.getSnapshot(), { kind: "ready", snapshot: remote });
  const session = client.bindSession("session-a");
  await session.refresh();
  assert.deepEqual(session.getSnapshot(), { kind: "ready", view: { kind: "BOUND", sessionCorrelation: "session-a", delivery: item } });
  remote = snapshot(2, []);
  await client.refresh();
  await session.refresh();
  assert.deepEqual(session.getSnapshot(), { kind: "ready", view: { kind: "UNBOUND", sessionCorrelation: "session-a" } });
  assert.equal(calls.some(({ endpoint }) => endpoint.includes("command") || endpoint.includes("delete") || endpoint.includes("recover")), false);
  assert.equal(changes.length, 2);
  unsubscribe();
});

test("DSH Host edge maps owner correlations to Session ids without changing the formal schema", async () => {
  const owner = Object.freeze({
    async snapshot() { return snapshot(1, [{ ...item, navigation: { sessionCorrelation: "intake-correlation-a" } }]); },
    async session(sessionCorrelation) {
      assert.equal(sessionCorrelation, "intake-correlation-a");
      return { kind: "BOUND", sessionCorrelation, delivery: { ...item, navigation: { sessionCorrelation } } };
    },
    async subscribe(listener) { listener(await this.snapshot()); return () => undefined; },
  });
  const bindings = Object.freeze({
    async list() { return [{ sessionKey: "session-a", correlation: "intake-correlation-a" }]; },
    async bySession(sessionKey) { return sessionKey === "session-a" ? { sessionKey, correlation: "intake-correlation-a" } : undefined; },
  });
  const dsh = createDshSessionControlPlaneReadModel(owner, bindings);
  const inventory = await dsh.snapshot();
  assert.equal(inventory.schemaVersion, "execution.delivery-control-plane@1.0.0");
  assert.deepEqual(inventory.deliveries[0].navigation, { sessionCorrelation: "session-a" });
  assert.deepEqual(await dsh.session("session-a"), {
    kind: "BOUND",
    sessionCorrelation: "session-a",
    delivery: { ...item, navigation: { sessionCorrelation: "session-a" } },
  });
  assert.deepEqual(await dsh.session("session-unknown"), { kind: "UNBOUND", sessionCorrelation: "session-unknown" });
});
