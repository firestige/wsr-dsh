import React from "react";
import { DisclosureRow, HoverCard, IconCheckOutline16, IconCopyOutline16, JsonTree, MessageText, Pill, StateDot, Tooltip, writeClipboard } from "@deepseek-ai/dsh-client-ui-primitives";
import * as workspaceUi from "@deepseek-ai/dsh-client-ui-workspace";

import { createWsrCommandView, registerActionPresentation } from "../action-presentation/view.js";
import { createDeliveryControlPlaneClient } from "./delivery/control-plane-port.js";
import { registerSessionDeliveryView } from "./delivery/session-delivery-view.js";
import { applyDeliverySidebar } from "./delivery-inventory/sidebar.js";

export const name = "wsr-execution-client";
export const inject = Object.freeze([
  "connection", "sessions", "slots", "workspaces", "locale",
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
    DisclosureRow,
    HoverCard,
    Pill,
    StateDot,
    bindProjection(sessionId) {
      const source = controlPlane.bindSession(String(sessionId));
      void source.refresh();
      return source;
    },
  });
  registerActionPresentation(ctx, createWsrCommandView({
    React,
    DisclosureRow,
    IconCheckOutline16,
    IconCopyOutline16,
    JsonTree,
    MessageText,
    StateDot,
    Tooltip,
    writeClipboard,
    inventory: controlPlane.inventory,
  }));
}
