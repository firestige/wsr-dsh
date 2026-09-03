# Changelog

## 0.2.4 — 2026-09-03

- Bind the adapter to the immutable `wsr-execution@0.2.2` owner release and verify its tag, revision, qualification record, and exact remote archive bytes before candidate construction.
- Preserve bounded Execution diagnostics in command replay and expose unresolved outcomes consistently in Chat and Delivery views.
- Accept selector-only create intake as a prompt-bearing Task diagnostic and infer no-ID abandon only from the Delivery occupying the current Session slot.
- Publish `dsh-wsr-execution@0.2.3` and the compatible `dsh-wsr@0.2.3` suite while retaining unchanged `dsh-wsr-studio@0.1.2` bytes.

## 0.2.3 — 2026-09-02

- Render WSR Studio as the native conversation tab immediately after Delivery without changing the SPA URL.
- Replace the generic one-line `/wsr` result with one keyed command view that exposes friendly diagnostics and complete bounded JSON details.
- Reject selector-only create requests with an actionable Task-prompt diagnostic before Core admission and remove duplicate immediate command rows.
- Publish `dsh-wsr-execution@0.2.2`, `dsh-wsr-studio@0.1.2`, and `dsh-wsr@0.2.2` with Studio consuming `wsr-ui-core@0.1.0-rc.1`.
- Add the adjustable metric dashboard and recorded Trace Waterfall, Tree, and Statistics product views.

## 0.2.2 — 2026-08-30

- Qualify `dsh-wsr-execution@0.2.1` against stable `wsr-execution@0.2.1`, including the Codex structured-output schema compatibility fix.
- Keep `dsh-wsr-studio@0.1.1` and the compatible `dsh-wsr@0.2.1` suite unchanged.

## 0.2.1 — 2026-08-30

- Ensure the suite disables the upstream Workspace UI before activating the fixed-version WSR Workspace shell, matching the independently installed Execution bundle.
- Keep `dsh-wsr-execution@0.2.0` and `dsh-wsr-studio@0.1.1` unchanged.

## 0.2.0 — 2026-08-30

- Upgrade `dsh-wsr-execution` to the stable `wsr-execution@0.2.0` product path.
- Qualify `execution.config@2.0.0`, `runner.v2`, and repository Role-to-Provider bindings for Copilot SDK and Codex CLI.
- Let packages version independently and compose compatible semantic-version ranges; the already-landed `dsh-wsr-studio@0.1.1` coordinate is retained without another bump.

## 0.1.0 — 2026-08-30

- Publish independent `dsh-wsr-execution` and `dsh-wsr-studio` bundles.
- Publish `dsh-wsr` as the exact `0.1.0` composition of both bundles.
- Add clean-profile, lifecycle, real-Harness, outage, checksum, provenance, SPDX SBOM, and compatibility qualification.
- Add npm OIDC promotion and scoped GitHub App release creation.
