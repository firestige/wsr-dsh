import React from "react";
import { DisclosureRow, MessageText, StateDot } from "@deepseek-ai/dsh-client-ui-primitives";

import { createActionPresentationView, registerActionPresentation } from "./view.js";

export const WsrExecutionPresentationView = createActionPresentationView({
  React,
  DisclosureRow,
  MessageText,
  StateDot,
});

export function applyActionPresentation(ctx) {
  registerActionPresentation(ctx, WsrExecutionPresentationView);
}
