import React from "react";
import * as Primitives from "@deepseek-ai/dsh-client-ui-primitives";

import { createStudioClientPlugin } from "./studio.js";

const plugin = createStudioClientPlugin({ React, Primitives });
export const name = plugin.name;
export const inject = plugin.inject;
export const apply = plugin.apply;
