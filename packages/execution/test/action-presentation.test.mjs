import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  DSH_ACTION_PRESENTATION_COMPATIBILITY,
  createExecutionPresentationDefinition,
  parseExecutionPresentation,
  projectExecutionPresentation,
  resolveDisclosureOpen,
} from "../src/action-presentation/model.js";
import {
  createActionPresentationView,
  createWsrCommandView,
  registerActionPresentation,
} from "../src/action-presentation/view.js";

const valid = (kind, data = {}, correlation = "delivery-1:action-1") => ({
  schemaVersion: "wsr.presentation@1.0.0",
  correlation,
  kind,
  data,
});

test("locks the renderer to the DSH release that formally exports DisclosureRow", () => {
  assert.deepEqual(DSH_ACTION_PRESENTATION_COMPATIBILITY, {
    dsh: "0.1.1-rc.2",
    uiPrimitives: "@deepseek-ai/dsh-client-ui-primitives@0.1.1-rc.2",
    presentation: "wsr.presentation@1.0.0",
  });
});

test("projects durable Execution progress, tool, Action and final facts without changing their domain identity", () => {
  assert.deepEqual(projectExecutionPresentation(parseExecutionPresentation(valid("delivery-running", {
    deliveryId: "delivery-1", state: "RECOVERING",
  }))), {
    correlation: "delivery-1:action-1", layer: "progress", state: "recovering",
    title: "Workflow delivery", summary: "Recovering · delivery-1", body: undefined,
    defaultOpen: true, focusPolicy: "none", role: "status", compatibility: "current",
  });

  assert.deepEqual(projectExecutionPresentation(parseExecutionPresentation(valid("action-output", {
    channel: "tool", state: "running", label: "Inspect repository", content: { text: "Reading files" },
  }))), {
    correlation: "delivery-1:action-1", layer: "tool", state: "running",
    title: "Inspect repository", summary: "Running", body: "Reading files",
    defaultOpen: true, focusPolicy: "none", role: "status", compatibility: "current",
  });

  assert.deepEqual(projectExecutionPresentation(parseExecutionPresentation(valid("action-output", {
    state: "completed", label: "Review change", content: { text: "All checks passed" },
  }))), {
    correlation: "delivery-1:action-1", layer: "action", state: "completed",
    title: "Review change", summary: "Completed", body: "All checks passed",
    defaultOpen: false, focusPolicy: "none", role: "status", compatibility: "current",
  });

  assert.deepEqual(projectExecutionPresentation(parseExecutionPresentation(valid("terminal-result", {
    outcome: "SUCCEEDED", finalOutput: "The delivery is ready.",
  }))), {
    correlation: "delivery-1:action-1", layer: "final", state: "completed",
    title: "Final result", summary: "Succeeded", body: "The delivery is ready.",
    defaultOpen: true, focusPolicy: "none", role: "article", compatibility: "current",
  });
});

test("keeps Action input visible and focusable instead of hiding it behind a completed disclosure", () => {
  assert.deepEqual(projectExecutionPresentation(parseExecutionPresentation(valid("action-input-request", {
    label: "Choose deployment", prompt: { question: "Promote now?" },
  }))), {
    correlation: "delivery-1:action-1", layer: "action", state: "waiting",
    title: "Choose deployment", summary: "Waiting for input", body: "Promote now?",
    defaultOpen: true, focusPolicy: "preserve", role: "status", compatibility: "current",
  });
});

test("keeps focused content open across completion and otherwise applies lifecycle defaults", () => {
  assert.equal(resolveDisclosureOpen({ current: true, previousState: "running", nextState: "completed", containsFocus: true }), true);
  assert.equal(resolveDisclosureOpen({ current: true, previousState: "running", nextState: "completed", containsFocus: false }), false);
  assert.equal(resolveDisclosureOpen({ current: false, previousState: "completed", nextState: "failed", containsFocus: false }), true);
  assert.equal(resolveDisclosureOpen({ current: false, previousState: "waiting", nextState: "waiting", containsFocus: false }), true);
});

test("supports the previous terminal summary explicitly while never duplicating Action output as a final answer", () => {
  const legacyFinal = projectExecutionPresentation(parseExecutionPresentation(valid("terminal-result", {
    outcome: "SUCCEEDED", summary: "Legacy durable answer",
  })));
  assert.equal(legacyFinal.body, "Legacy durable answer");
  assert.equal(legacyFinal.compatibility, "legacy-summary");

  const action = projectExecutionPresentation(parseExecutionPresentation(valid("action-output", {
    content: { text: "internal Action output" },
  })));
  assert.equal(action.layer, "action");
  assert.notEqual(action.role, "article");
});

test("fails closed for unknown revisions, kinds, states and unusable final results", () => {
  for (const event of [
    { ...valid("action-output", { content: { text: "secret" } }), schemaVersion: "wsr.presentation@2.0.0" },
    valid("future-kind", { content: { text: "secret" } }),
    valid("action-output", { state: "future", content: { text: "secret" } }),
    valid("delivery-status", { state: "FUTURE", message: "secret" }),
    valid("terminal-result", { outcome: "SUCCEEDED", finalOutput: "" }),
    { ...valid("action-output"), extra: true },
  ]) {
    const parsed = parseExecutionPresentation(event);
    assert.equal(parsed.kind, "error");
    assert.equal(parsed.correlation, "presentation-invalid");
    assert.deepEqual(parsed.data, { code: "WSR_PRESENTATION_INVALID", message: "WSR presentation unavailable" });
    assert.doesNotMatch(JSON.stringify(parsed), /secret/u);
  }
});

test("parses bounded durable JSON in the browser without relying on Node Buffer", () => {
  const saved = globalThis.Buffer;
  try {
    globalThis.Buffer = undefined;
    assert.equal(parseExecutionPresentation(JSON.stringify(valid("action-output", {
      content: { text: "browser-safe" },
    }))).correlation, "delivery-1:action-1");
  } finally {
    globalThis.Buffer = saved;
  }
});

test("builds a replay-stable WSR conversation node from durable Harness command facts", () => {
  const definition = createExecutionPresentationDefinition();
  const startEvent = { seq: 41, type: "command/run", data: {
    commandId: "presentation-1", name: "wsr", source: { kind: "plugin", plugin: "workflow-execution" },
  } };
  const doneEvent = { seq: 42, type: "command/done", data: {
    commandId: "presentation-1", kind: "success", text: JSON.stringify(valid("action-output", {
      state: "cancelled", content: { text: "Stopped by user" },
    })),
  } };

  const start = definition.match(startEvent);
  assert.deepEqual(start, { id: "presentation-1", role: "start" });
  const context = { key: "wsr:presentation-1", id: start.id, start: { location: { kind: "turn", turn: 2 } } };
  const initial = definition.start(context, { ...start, event: startEvent });
  const updateMatch = definition.match(doneEvent);
  const state = definition.update({ ...context, state: initial }, { ...updateMatch, event: doneEvent });
  const node = definition.buildViewNode({ ...context, state });

  assert.deepEqual(node, {
    key: "wsr:presentation-1", kind: "wsr-execution-presentation", id: "presentation-1",
    target: "chat", anchorSeq: 41, location: { kind: "turn", turn: 2 }, visibility: "visible",
    data: {
      correlation: "delivery-1:action-1", layer: "action", state: "cancelled",
      title: "Workflow Action", summary: "Cancelled", body: "Stopped by user",
      defaultOpen: true, focusPolicy: "none", role: "status", compatibility: "current",
    },
  });
  assert.deepEqual(definition.buildViewNode({ ...context, state }), node);
});

test("leaves the known delivery-list event to its feature owner instead of rendering a false error", () => {
  const definition = createExecutionPresentationDefinition();
  const context = {
    key: "wsr:list-1", id: "list-1", start: { location: { kind: "turn", turn: 2 } },
    state: { seq: 51, presentation: undefined },
  };
  const state = definition.update(context, { event: { seq: 52, type: "command/done", data: {
    commandId: "list-1", kind: "success", text: JSON.stringify(valid("delivery-list", { items: [] })),
  } } });
  assert.equal(definition.buildViewNode({ ...context, state }), null);
});

test("keeps a successful control-plane terminal without public output out of the chat instead of fabricating an invalid presentation", () => {
  const definition = createExecutionPresentationDefinition();
  const context = {
    key: "wsr:terminal-1", id: "terminal-1", start: { location: { kind: "turn", turn: 2 } },
    state: { seq: 61, presentation: undefined },
  };
  const state = definition.update(context, { event: { seq: 62, type: "command/done", data: {
    commandId: "terminal-1", kind: "success", text: JSON.stringify(valid("terminal-result", { outcome: "SUCCEEDED" })),
  } } });

  assert.equal(definition.buildViewNode({ ...context, state }), null);
});

test("hides the native command row and renders only the later ordered presentation row", () => {
  const calls = [];
  const ctx = {
    slots: {
      inject(name, callback) { calls.push(["inject", name]); callback(); },
      register(specification, view) { calls.push(["register", specification, view]); },
    },
  };
  const View = () => null;
  registerActionPresentation(ctx, View);

  assert.deepEqual(calls[0], ["inject", "conversation.chat.commandview"]);
  assert.deepEqual(calls[1][1], { name: "conversation.chat.commandview", key: "wsr" });
  assert.equal(calls[1][2](), null);
  assert.deepEqual(calls[2][1], { name: "conversation.chat.commandview", key: "wsr-presentation" });
  assert.equal(calls[2][2], View);
  assert.equal(calls.some((entry) => JSON.stringify(entry).includes("conversation.chat.node")), false);
  assert.equal(calls.some((entry) => JSON.stringify(entry).includes("tool.call.toolview")), false);
});

test("renders friendly diagnostics and the complete bounded presentation JSON from a single-line command result", () => {
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...(props ?? {}), children } }; },
    useEffect() {},
    useRef(value) { return { current: value }; },
    useState(value) { return [value, () => undefined]; },
  };
  const DisclosureRow = (props) => ({ type: "DisclosureRow", props });
  const MessageText = (props) => ({ type: "MessageText", props });
  const StateDot = (props) => ({ type: "StateDot", props });
  const JsonTree = (props) => ({ type: "JsonTree", props });
  const View = createWsrCommandView({ React, DisclosureRow, MessageText, StateDot, JsonTree });
  const presentation = valid("error", {
    code: "TASK_PROMPT_REQUIRED",
    message: "Add a Task instruction after the Workflow selector or attach a file.",
  }, "presentation-error-1");

  const tree = View({ node: {
    commandId: "command-1", name: "wsr", args: " create hello-world-workflow@0.2.0",
    outcome: { kind: "error", text: JSON.stringify(presentation) },
  } });

  assert.equal(tree.type, DisclosureRow);
  assert.equal(tree.props.open, true);
  assert.match(JSON.stringify(tree), /Add a Task instruction/u);
  const detail = tree.props.children[0].props.children.find((child) => child?.type === "details");
  assert.equal(detail.props.children[1].type, JsonTree);
  assert.deepEqual(detail.props.children[1].props.data, presentation);
  assert.equal(detail.props.children[1].props.copyable, true);
});

test("never echoes rejected command bytes in technical details", () => {
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...(props ?? {}), children } }; },
    useEffect() {}, useRef(value) { return { current: value }; }, useState(value) { return [value, () => undefined]; },
  };
  const View = createWsrCommandView({
    React,
    DisclosureRow: (props) => ({ type: "DisclosureRow", props }),
    MessageText: (props) => ({ type: "MessageText", props }),
    StateDot: (props) => ({ type: "StateDot", props }),
    JsonTree: (props) => ({ type: "JsonTree", props }),
  });
  const tree = View({ node: { commandId: "command-1", name: "wsr", args: null, outcome: { kind: "error", text: '{"secret":"must-not-render"}' } } });
  assert.doesNotMatch(JSON.stringify(tree), /must-not-render/u);
  assert.match(JSON.stringify(tree), /WSR presentation unavailable/u);
});

test("renders process through DisclosureRow and final output as a persistent assistant-style MessageText", () => {
  const calls = [];
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...props, children } }; },
    useEffect() {},
    useRef(value) { return { current: value }; },
    useState(value) { return [value, () => undefined]; },
  };
  const DisclosureRow = (props) => ({ type: "DisclosureRow", props });
  const MessageText = (props) => ({ type: "MessageText", props });
  const StateDot = (props) => ({ type: "StateDot", props });
  const View = createActionPresentationView({ React, DisclosureRow, MessageText, StateDot, observe: (value) => calls.push(value) });

  const processTree = View({ node: { data: projectExecutionPresentation(parseExecutionPresentation(valid("action-output", {
    state: "failed", content: { text: "compiler failed" },
  }))) } });
  assert.equal(processTree.type, DisclosureRow);
  assert.equal(processTree.props.open, true);
  assert.equal(processTree.props.expandOnRowClick, true);
  assert.equal(processTree.props.previewChevron, false);
  assert.equal(processTree.props.children[0].props["data-wsr-layer"], "action");
  assert.equal(processTree.props.children[0].props.children[0].props.style.maxHeight, "20rem");

  const waitingTree = View({ node: { data: projectExecutionPresentation(parseExecutionPresentation(valid("action-input-request", {
    prompt: { question: "Continue?" },
  }))) } });
  assert.equal(waitingTree.type, DisclosureRow);
  assert.equal(waitingTree.props.open, true);
  assert.equal(waitingTree.props.expandable, false);
  assert.equal(waitingTree.props.children[0].props.tabIndex, 0);
  assert.equal(waitingTree.props.children[0].props["data-wsr-action-input"], "true");

  const finalTree = View({ node: { data: projectExecutionPresentation(parseExecutionPresentation(valid("terminal-result", {
    outcome: "SUCCEEDED", finalOutput: "Ship it",
  }))) } });
  assert.equal(finalTree.type, "article");
  assert.equal(finalTree.props["data-wsr-chat-role"], "assistant");
  assert.equal(finalTree.props.children[0].type, MessageText);
  assert.deepEqual(calls.map(({ layer }) => layer), ["action", "action", "final"]);
});

test("the unified Harness binding imports the public primitive root and no private DSH source", async () => {
  const source = await readFile(resolve(import.meta.dirname, "../src/client/browser-entry.js"), "utf8");
  assert.match(source, /import React from ["']react["']/u);
  assert.match(source, /import \{ DisclosureRow, JsonTree, MessageText, StateDot \} from ["']@deepseek-ai\/dsh-client-ui-primitives["']/u);
  assert.doesNotMatch(source, /\/src\/|tool\.call\.toolview/u);
});
