import React from "react";

import { createStudioClientPlugin } from "./studio.js";

const plugin = createStudioClientPlugin({ React });
export const name = plugin.name;
export const inject = plugin.inject;
export const apply = plugin.apply;

