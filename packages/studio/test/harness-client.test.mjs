import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  createStudioClientPlugin,
  createStudioGatewayPort,
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

test("Harness registration adds one Studio entry and an overlay without replacing Conversation, Workspace, or Execution", () => {
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
  createStudioClientPlugin({ React }).apply(ctx);
  assert.deepEqual(injected, ["sidebar.footer.action", "shell.overlay"]);
  assert.deepEqual(registrations.map(({ options }) => [options.name, options.id]), [
    ["sidebar.footer.action", "wsr-studio"],
    ["shell.overlay", "wsr-studio"],
  ]);
  assert.ok(registrations.every(({ options }) => !["conversation", "sidebar.workspaces"].includes(options.name)));
});

test("the Studio shell advertises one Evaluate route and complete keyboard/screen-reader landmarks", () => {
  const model = studioAccessibilityModel();
  assert.deepEqual(model.routes, ["Evaluate"]);
  assert.deepEqual(model.landmarks, ["dialog", "navigation", "main"]);
  assert.equal(model.closeKey, "Escape");
  assert.equal(model.focusReturnsToTrigger, true);
  assert.equal(model.liveRegions.loading, "polite");
  assert.equal(model.liveRegions.error, "assertive");
  assert.equal(model.minimumTargetPixels, 44);
  assert.equal(JSON.stringify(model).includes("Builder"), false);
  assert.equal(JSON.stringify(model).includes("improvement"), false);
});

test("the real slot components expose single/compare Task selection and repository switching without empty future entries", () => {
  const components = new Map();
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    slots: {
      inject(_name, factory) { factory(); },
      register(options, component) { components.set(options.name, component); return () => undefined; },
    },
  };
  const React = {
    createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
    useEffect() {},
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => undefined]; },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot(); },
  };
  const runtime = createStudioClientPlugin({ React, initialContext: { taskId: "task-a", repository: "repo-a" } }).apply(ctx);
  runtime.store.open({ focus() {} });
  const rendered = components.get("shell.overlay")();
  const text = textOf(rendered);
  const inputs = elementsOf(rendered).filter((element) => element.type === "input");
  assert.match(text, /Evaluate/);
  assert.match(text, /Single/);
  assert.match(text, /Compare/);
  assert.ok(inputs.some(({ props }) => props["aria-label"] === "Repository"));
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "single"));
  assert.ok(inputs.some(({ props }) => props.type === "radio" && props.value === "compare"));
  assert.doesNotMatch(text, /Builder|improvement/i);
});

test("the browser source has no direct downstream transport, credential, or mutation escape hatch", async () => {
  const root = resolve(import.meta.dirname, "../src/client");
  const source = `${await readFile(resolve(root, "studio.js"), "utf8")}\n${await readFile(resolve(root, "evaluate-model.js"), "utf8")}`;
  assert.doesNotMatch(source, /\bfetch\s*\(/u);
  assert.doesNotMatch(source, /127\.0\.0\.1|localhost|\/v1\/evidence|evaluations:compute/u);
  assert.doesNotMatch(source, /Authorization|Cookie|credentials/u);
  assert.doesNotMatch(source, /facts\/(?:write|delete)|traces\/(?:write|delete)|repository\/(?:write|commit)/u);
});
