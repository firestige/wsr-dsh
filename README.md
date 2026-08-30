# WSR for DeepSeek Harness

This repository is the release authority for the WSR Execution, WSR Studio, and combined WSR suite integrations for DeepSeek Harness.

Release set `0.2.0` adds the Workflow DSL 2 multi-Provider Execution path while retaining the already-landed Studio `0.1.1` coordinate.

Workspace packages:

- `dsh-wsr-execution` — display name `WSR`
- `dsh-wsr-studio` — display name `WSR Studio`
- `dsh-wsr` — compatible combination suite with no additional UI identity

Packages follow semantic versioning independently. The suite accepts
`dsh-wsr-execution@^0.2.0` and `dsh-wsr-studio@^0.1.1`. DeepSeek Harness
compatibility remains fixed at `0.1.1-rc.2`; immutable release evidence records
the exact Execution owner revision and asset digest used for qualification.
The current owner package is qualified from stable asset
`wsr-execution-0.2.0.tgz` in release `0.2.0` (SHA-256
`4f7879edcd55018954aaf0cd226afb75428b04a90c588a654425d4a1afe52309`).
There is no ambient npm resolution of `wsr-execution`: DSH profiles install that
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
publishes changed component packages before the compatible suite through npm OIDC, and
uses the scoped release App for the final GitHub release. See [release and
installation lifecycle](docs/release-lifecycle.md), [changelog](CHANGELOG.md),
and [security policy](SECURITY.md).

See [foundation boundaries](docs/foundation-boundaries.md) for repository ownership and the deferred Workspace UI fork decision.

Project context and system authorities remain in https://github.com/firestige/workflow-self-recursive.
