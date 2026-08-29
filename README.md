# WSR for DeepSeek Harness

This repository is the release authority for the WSR Execution, WSR Studio, and combined WSR suite integrations for DeepSeek Harness.

The repository is being initialized for Iteration 6 and is not yet production-ready. The foundation can build and qualify unpublished skeleton archives, but functional releases and stable promotion remain disabled until #122 passes.

Planned npm packages:

- `dsh-wsr-execution` — display name `WSR`
- `dsh-wsr-studio` — display name `WSR Studio`
- `dsh-wsr` — exact combination suite with no additional UI identity

All three packages share version `0.0.0-development` in this foundation. The suite binds the other two by that exact version. DeepSeek Harness compatibility is frozen to `0.1.1-rc.2`.

## Development gates

Use Node `24.12.0` and npm `11.6.2`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run pack:verify
npm run qualify:clean-profile
```

`npm run build` verifies workspace identity, compatibility, dependency direction, activation composition and the deferred fixed-version Workspace UI fork decision. `npm run boundaries:check -- <external-package.json...>` additionally rejects domain-owner repositories that depend back on a `dsh-wsr*` package.

`npm run pack:verify` creates temporary archives and checks their actual tar inventories, including license and source notices. `npm run qualify:clean-profile` uses temporary DSH homes and the pinned local DSH CLI; it performs no publication.

The manual Release Promote workflow first builds an unpublished candidate skeleton and verifies its checksums, then intentionally fails. There is no npm publish or stable promotion path in this foundation.

See [foundation boundaries](docs/foundation-boundaries.md) for repository ownership and the deferred Workspace UI fork decision.

Project context and system authorities remain in https://github.com/firestige/workflow-self-recursive.
