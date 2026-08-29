import { registerStudioGateway } from "./host/gateway.js";

export const name = "wsr-studio";
export const inject = ["connection"];

export function apply(ctx, config) {
  return registerStudioGateway(ctx, {
    evidenceBaseUrl: config?.evidenceBaseUrl,
    evolutionBaseUrl: config?.evolutionBaseUrl,
  });
}

export * from "./host/gateway.js";
