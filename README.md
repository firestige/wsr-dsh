# WSR for DeepSeek Harness

This repository is the release authority for the WSR Execution, WSR Studio, and combined WSR suite integrations for DeepSeek Harness.

The repository is under Iteration 6 qualification and is not yet
production-ready. Execution and Studio feature bundles are active in source;
publication and stable promotion remain disabled until #122 passes.

Workspace packages:

- `dsh-wsr-execution` — display name `WSR`
- `dsh-wsr-studio` — display name `WSR Studio`
- `dsh-wsr` — exact combination suite with no additional UI identity

All three packages share version `0.0.0-development`. The suite binds the other
two by that exact version. DeepSeek Harness compatibility is frozen to
`0.1.1-rc.2`; the Execution projection contract is pinned to owner merge
`0feb3333afd88e00444f80a7a0d135d2f93582db`.

## Development gates

Use Node `24.12.0` and npm `11.6.2`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run pack:verify
npm run qualify:clean-profile
```

`npm run build` generates the two CSP-compatible browser bundles and verifies
workspace identity, compatibility, dependency direction, activation
composition, and the active fixed-version Workspace UI fork. `npm run
boundaries:check -- <external-package.json...>` additionally rejects
domain-owner repositories that depend back on a `dsh-wsr*` package.

`npm run pack:verify` creates temporary archives and checks their actual tar inventories, including license and source notices. `npm run qualify:clean-profile` uses temporary DSH homes and the pinned local DSH CLI; it performs no publication.

The manual Release Promote workflow first builds an unpublished candidate and
verifies its checksums, then intentionally fails. There is no npm publish or
stable promotion path before #122.

See [foundation boundaries](docs/foundation-boundaries.md) for repository ownership and the deferred Workspace UI fork decision.

Project context and system authorities remain in https://github.com/firestige/workflow-self-recursive.
