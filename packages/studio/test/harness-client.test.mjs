import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  createStudioClientPlugin,
  createStudioGatewayPort,
  STUDIO_PAGES,
  studioAccessibilityModel,
} from "../src/client/studio.js";

function textOf(element) {
  if (element === null || element === undefined || typeof element === "boolean") return "";
  if (typeof element === "string" || typeof element === "number") return String(element);
  if (Array.isArray(element)) return element.map(textOf).join("");
  return textOf(element.children);
}

function elementsOf(element) {
  if (element === null || element === undefined || typeof element !== "object") return [];
  if (Array.isArray(element)) return element.flatMap(elementsOf);
  return [element, ...elementsOf(element.children)];
}

test("the browser port uses only the DSH Host channel and exposes no downstream URL or credentials", async () => {
  const calls = [];
  const port = createStudioGatewayPort({
    connection: {
      rpc: {
        async call(channel, endpoint, payload, signal) {
          calls.push({ channel, endpoint, payload, signal });
          return { ok: true, value: { items: [] } };
        },
      },
    },
  });
  await port.call("tasks/list", { limit: 1 });
  assert.deepEqual(calls.map(({ channel, endpoint, payload }) => ({ channel, endpoint, payload })), [
    { channel: "/wsr-studio", endpoint: "tasks/list", payload: { limit: 1 } },
  ]);
  assert.doesNotMatch(JSON.stringify(port), /127\.0\.0\.1|Authorization|cookie/i);
});

test("Harness registration adds WSR Studio as the native conversation tab immediately after Delivery", () => {
  const registrations = [];
  const injected = [];
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    slots: {
      inject(name, factory) {
        injected.push(name);
        factory();
      },
      register(options, component) {
        registrations.push({ options, component });
        return () => undefined;
      },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const runtime = createStudioClientPlugin({ React }).apply(ctx);
  assert.deepEqual(injected, ["conversation.view"]);
  assert.deepEqual(registrations.map(({ options }) => options), [{
    name: "conversation.view", id: "wsr-studio", order: 30, label: "WSR Studio",
  }]);
  assert.equal(typeof runtime.controller.getSnapshot, "function");
  assert.ok(registrations.every(({ options }) => !["sidebar.footer.action", "shell.overlay", "sidebar.workspaces"].includes(options.name)));
});

test("the Studio shell advertises one Evaluate route and complete keyboard/screen-reader landmarks", () => {
  const model = studioAccessibilityModel();
  assert.deepEqual(model.routes, ["Evaluate"]);
  assert.deepEqual(STUDIO_PAGES, [{ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" }]);
  assert.deepEqual(model.landmarks, ["region", "navigation", "main"]);
  assert.equal(model.surface, "conversation-view");
  assert.equal(model.modal, false);
  assert.equal("closeKey" in model, false);
  assert.equal("focusReturnsToTrigger" in model, false);
  assert.equal(model.liveRegions.loading, "polite");
  assert.equal(model.liveRegions.error, "assertive");
  assert.equal(model.minimumTargetPixels, 44);
  assert.equal(JSON.stringify(model).includes("Builder"), false);
  assert.equal(JSON.stringify(model).includes("improvement"), false);
});

test("the native Studio tab exposes a non-modal Evidence view without Session repository context", () => {
  const components = new Map();
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    slots: {
      inject(_name, factory) { factory(); },
      register(options, component) {
        components.set(options.name, component);
        return () => components.delete(options.name);
      },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const Primitives = { Button: "dsh-button", Input: "dsh-input", DisclosureRow: "dsh-disclosure", JsonTree: "dsh-json-tree", Pill: "dsh-pill", StateDot: "dsh-state-dot" };
  const runtime = createStudioClientPlugin({ React, Primitives, initialContext: { taskId: "task-a" } }).apply(ctx);
  assert.equal(typeof runtime, "function");
  const rendered = components.get("conversation.view")({ sessionId: "session-a" });
  const text = textOf(rendered);
  const inputs = elementsOf(rendered).filter((element) => element.type === "input" || element.type === "dsh-input");
  assert.match(text, /Evaluate/);
  assert.match(text, /Single/);
  assert.match(text, /Compare/);
  assert.equal(inputs.some(({ props }) => props["aria-label"] === "Repository"), false);
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "single"));
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "compare"));
  assert.doesNotMatch(text, /Builder|improvement/i);
  const view = elementsOf(rendered).find((element) => element.props?.["data-wsr-studio-view"] === "evaluate");
  assert.equal(view.props.role, "region");
  assert.equal(view.props["aria-modal"], undefined);
  assert.equal(view.props.id, "wsr-studio-view");
  assert.equal(Object.hasOwn(runtime.controller.getSnapshot(), "repository"), false);
  assert.equal(Object.hasOwn(runtime.controller.getSnapshot(), "workspaceId"), false);
  assert.ok(elementsOf(rendered).some((element) => element.type === "dsh-button"));
  assert.equal(view.props.onKeyDown, undefined);
  assert.equal(components.has("shell.overlay"), false);
  assert.equal(components.has("sidebar.footer.action"), false);
});

test("the browser source has no direct downstream transport, credential, or mutation escape hatch", async () => {
  const root = resolve(import.meta.dirname, "../src/client");
  const source = `${await readFile(resolve(root, "studio.js"), "utf8")}\n${await readFile(resolve(root, "evaluate-model.js"), "utf8")}`;
  assert.doesNotMatch(source, /\bfetch\s*\(/u);
  assert.doesNotMatch(source, /127\.0\.0\.1|localhost|\/v1\/evidence|evaluations:compute/u);
  assert.doesNotMatch(source, /Authorization|Cookie|credentials/u);
  assert.doesNotMatch(source, /facts\/(?:write|delete)|traces\/(?:write|delete)|repository\/(?:write|commit)/u);
});
