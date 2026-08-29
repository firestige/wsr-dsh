# Monorepo foundation boundaries

`wsr-dsh` is the only release authority for WSR DSH adapters. It is not a domain authority.

## Package ownership

- `packages/execution` owns DSH-specific Execution adapter, Host and client integration only. The displayed product name is `WSR`.
- `packages/studio` owns DSH-specific Studio adapter, Host gateway and client composition only. The displayed product name is `WSR Studio`.
- `packages/suite` owns exact version composition only. It has no module entry, display name, Host activation or UI registration.

Execution, Delivery, Manifest, Runner, BI/Evaluation, Evidence, Evolution, Workflow Package and shared Contract implementations remain in their formal owner repositories and must be consumed through published package/API coordinates at exact compatible versions. Source-relative imports across repository boundaries and copied/shadow domain implementations fail the boundary check.

Domain owner repositories must not depend on any `dsh-wsr*` package. Their manifests can be passed to `npm run boundaries:check -- <manifest...>` to enforce the reverse-dependency rule during assembly.

## Deferred Workspace UI fork

The accepted strategy is a fixed-version fork of `@deepseek-ai/dsh-client-ui-workspace@0.1.1-rc.2` for the later Delivery resource integration. The compatibility record preserves that decision, but this foundation neither copies nor activates the fork. Wave 7 must qualify its source attribution and exact DSH compatibility before activation.

## Release state

The repository can build and verify development archives plus deterministic checksum provenance. Stable promotion and publication remain disabled until #122 qualifies the final Execution, Studio and suite artifacts. No source checkout or local workspace is a final release prerequisite.
