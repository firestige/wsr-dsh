import React from "react";
import { DisclosureRow, MessageText, StateDot } from "@deepseek-ai/dsh-client-ui-primitives";
import * as workspaceUi from "@deepseek-ai/dsh-client-ui-workspace";

import { createActionPresentationView, registerActionPresentation } from "../action-presentation/view.js";
import { createDeliveryControlPlaneClient } from "./delivery/control-plane-port.js";
import { registerSessionDeliveryView } from "./delivery/session-delivery-view.js";
import { applyDeliverySidebar } from "./delivery-inventory/sidebar.js";

export const name = "wsr-execution-client";
export const inject = Object.freeze([
  "connection", "conversationEvents", "sessions", "slots",
]);

export function apply(ctx) {
  const controlPlane = createDeliveryControlPlaneClient(ctx.connection.rpc);
  const refresh = () => { void controlPlane.refresh(); };
  refresh();
  const timer = setInterval(refresh, 2_000);
  ctx.effect(() => () => clearInterval(timer), "wsr-execution: control-plane refresh");

  applyDeliverySidebar(ctx, { React, workspaceUi, inventory: controlPlane.inventory });
  registerSessionDeliveryView(ctx, {
    React,
    bindProjection(sessionId) {
      const source = controlPlane.bindSession(String(sessionId));
      void source.refresh();
      return source;
    },
  });
  registerActionPresentation(ctx, createActionPresentationView({ React, DisclosureRow, MessageText, StateDot }));
}
