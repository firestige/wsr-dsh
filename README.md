# WSR for DeepSeek Harness

This repository is the release authority for the WSR Execution, WSR Studio, and combined WSR suite integrations for DeepSeek Harness.

Release `0.1.1` binds the first qualified Execution, Studio, and suite package set to the stable
Execution `0.1.4` bytes.

Workspace packages:

- `dsh-wsr-execution` — display name `WSR`
- `dsh-wsr-studio` — display name `WSR Studio`
- `dsh-wsr` — exact combination suite with no additional UI identity

All three packages share version `0.1.1`. The suite binds the other
two by that exact version. DeepSeek Harness compatibility is frozen to
`0.1.1-rc.2`; the Execution projection contract is pinned to owner merge
`d4fa9607e5e3153b969e186866ddd7697a119c81`.
The owner package is qualified only from the immutable GitHub prerelease asset
`wsr-execution-0.1.4.tgz` in stable release `0.1.4` (SHA-256
`0b889b707b5fdc84d934e6c807ce101b4edaa356409253a1f48d6ffca7f53420`).
There is no npm `wsr-execution@0.1.4` dependency: DSH profiles install that
asset explicitly as a top-level root because DSH blocks exotic transitive
dependencies.

## Development gates

Use Node `24.12.0` and npm `11.6.2`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run pack:verify
npm run qualify:clean-profile
npm run qualify:real-harness
```

`npm run build` generates the two CSP-compatible browser bundles and verifies
workspace identity, compatibility, dependency direction, activation
composition, and the active fixed-version Workspace UI fork. `npm run
boundaries:check -- <external-package.json...>` additionally rejects
domain-owner repositories that depend back on a `dsh-wsr*` package.

`npm run pack:verify` creates temporary archives and checks their actual tar inventories, including license and source notices. `npm run qualify:clean-profile` uses temporary DSH homes, the pinned local DSH CLI, and the immutable Execution owner asset; it performs no publication. `npm run qualify:real-harness` additionally boots the real Host and Chrome against a clean profile. DSH `0.1.1-rc.2` emits no CSP header, so the automated bundle gate separately rejects `eval`, `new Function`, and inline-script injection; qualification does not claim a CSP header supplied by DSH.

The Release Candidate workflow runs clean-profile, lifecycle, real-Harness,
downstream-outage, and remote-artifact gates before creating an immutable
prerelease. Release Promote verifies the same bytes and qualification record,
publishes the component packages before the exact suite through npm OIDC, and
uses the scoped release App for the final GitHub release. See [release and
installation lifecycle](docs/release-lifecycle.md), [changelog](CHANGELOG.md),
and [security policy](SECURITY.md).

See [foundation boundaries](docs/foundation-boundaries.md) for repository ownership and the deferred Workspace UI fork decision.

Project context and system authorities remain in https://github.com/firestige/workflow-self-recursive.
