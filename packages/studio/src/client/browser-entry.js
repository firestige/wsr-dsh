import React from "react";
import * as Primitives from "@deepseek-ai/dsh-client-ui-primitives";
import * as Bi from "wsr-ui-core";
import sharedStyles from "wsr-ui-core/styles.css";

import { createStudioClientPlugin } from "./studio.js";

const plugin = createStudioClientPlugin({ React, Primitives, Bi, sharedStyles });
export const name = plugin.name;
export const inject = plugin.inject;
export const apply = plugin.apply;
