# Changelog

## 0.2.0 — 2026-08-30

- Upgrade `dsh-wsr-execution` to the stable `wsr-execution@0.2.0` product path.
- Qualify `execution.config@2.0.0`, `runner.v2`, and repository Role-to-Provider bindings for Copilot SDK and Codex CLI.
- Let packages version independently and compose compatible semantic-version ranges; the already-landed `dsh-wsr-studio@0.1.1` coordinate is retained without another bump.

## 0.1.0 — 2026-08-30

- Publish independent `dsh-wsr-execution` and `dsh-wsr-studio` bundles.
- Publish `dsh-wsr` as the exact `0.1.0` composition of both bundles.
- Add clean-profile, lifecycle, real-Harness, outage, checksum, provenance, SPDX SBOM, and compatibility qualification.
- Add npm OIDC promotion and scoped GitHub App release creation.
