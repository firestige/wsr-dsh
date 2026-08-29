import React from "react";
import { createRoot } from "react-dom/client";
import * as Primitives from "@deepseek-ai/dsh-client-ui-primitives";

import { createStudioClientPlugin } from "../src/client/studio.js";

const roots = new Map();
const mount = (name, Component) => {
  const target = document.querySelector(name === "shell.overlay" ? "#studio" : "#entry");
  roots.get(name)?.unmount();
  const root = createRoot(target);
  roots.set(name, root);
  root.render(React.createElement(Component, {
    useSessions: (select) => select({ current: "dev-session", byId: { "dev-session": { cwd: "/example/repository" } } }),
  }));
  return () => { root.unmount(); roots.delete(name); };
};

const taskPage = Object.freeze({
  contract: { name: "evidence.query", revision: "1.0.0" }, observation_profile: "2.0.0",
  read_model_revision: "2.0.0", snapshot: "dev", items: [{ task_id: "task-example", display_name: "Example Task" }], next_cursor: null,
});
const result = Object.freeze({ api_version: 1, mode: "SINGLE", result: {
  tag: "SIDE_RESULT", receipt: { population_state: "COMPLETE", evidence_bindings: [] },
  metric_results: [{ metric_id: "delivery-cycle-time-ms", metric_version: "2.0.0", slices: [] }],
} });

const ctx = {
  connection: { rpc: { async call(_channel, endpoint) {
    if (endpoint === "tasks/list") return { ok: true, value: taskPage };
    if (endpoint === "evaluations/compute") return { ok: true, value: result };
    return { ok: true, value: { items: [] } };
  } } },
  slots: {
    inject(_name, factory) { factory(); },
    register({ name }, Component) { return mount(name, Component); },
  },
};

createStudioClientPlugin({ React, Primitives }).apply(ctx);
