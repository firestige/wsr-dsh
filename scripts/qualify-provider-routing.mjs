#!/usr/bin/env node
import { AgentProviderFactoryRegistry, resolveRoleModelBindings } from "wsr-execution";

function factory(identity, version, adapterKey) {
  return Object.freeze({
    descriptor: Object.freeze({
      schemaVersion: "execution.agent-provider-factory@1.0.0",
      identity,
      version,
      adapterKey,
      capabilities: Object.freeze(["structured-completion"]),
    }),
    async acquire() { throw new Error("qualification admission must not open a Provider or read credentials"); },
  });
}

try {
  const registry = new AgentProviderFactoryRegistry([
    factory("provider.copilot", "1.0.78", "copilot-sdk"),
    factory("provider.codex", "0.144.5", "codex-cli"),
  ]);
  const bindings = resolveRoleModelBindings({
    registry,
    repository: {
      schemaVersion: "execution.repository-role-provider-bindings-snapshot@1.0.0",
      documentState: "PRESENT",
      documentDigest: `sha256:${"a".repeat(64)}`,
      bindings: {
        "role.implementation": { agentProvider: { identity: "provider.copilot", version: "1.0.78" }, model: { provider: "github-copilot", model: "gpt-5.3-codex" } },
        "role.review": { agentProvider: { identity: "provider.codex", version: "0.144.5" }, model: { provider: "openai", model: "gpt-5.6-sol" } },
      },
    },
    agentActionRoles: [
      { roleId: "role.implementation", rolePromptIdentity: "prompt.implementation", rolePromptDigest: `sha256:${"b".repeat(64)}`, requiredCapabilities: ["structured-completion"] },
      { roleId: "role.review", rolePromptIdentity: "prompt.review", rolePromptDigest: `sha256:${"c".repeat(64)}`, requiredCapabilities: ["structured-completion"] },
    ],
  });
  const evidence = bindings.resolvedRoles.map(({ roleId, agentProviderId, agentProviderAdapterKey, modelProviderId, modelId }) => ({ roleId, agentProviderId, agentProviderAdapterKey, modelProviderId, modelId }));
  if (new Set(evidence.map(({ agentProviderId }) => agentProviderId)).size !== 2) throw new Error("PROVIDER_ROUTING_COLLAPSED");
  process.stdout.write(`${JSON.stringify({ schemaVersion: "wsr.dsh.provider-routing-qualification@1.0.0", credentialMaterialRead: false, roles: evidence }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
}
