# Issue 170 Wave 2 — approved Studio page family

This evidence binds the corrected Host assembly to the locally packed reusable provider. It does not qualify a remote registry artifact.

## Candidate identity

- provider commit: `a20530e08a39a4999f6ef5acd96553019eed2af0`
- provider coordinate: `wsr-ui-core@0.1.0-rc.0`
- local tar SHA-256: `4bd3e31e7a84cc9adbebe191f23f288281a864d948191ad3881388f86840661a`
- local tar npm shasum: `fac8016ae107a57b29f56fc8061ed28b8493830d`
- local tar integrity: `sha512-R5mwdJ2zLsppSIkvTsgh5uZM6mtwRlwBVMglcfmpeNGKy3+zZNsPCXjRuDY6Bb2ht6yR4nnJicx03VvmDezwCw==`
- consumer implementation commit: `9affdd2476e89213d8887db151b5c16ffce57dc6`
- embedded Studio bundle SHA-256: `9491dc88b9cf7222cf46fad45dc6e628005a970767a365071644fe12290d9e6a`
- consumer lock SHA-256: `66f899db76e7c32f4d5708237c9c1937549601dac290293f4e88c37c3435879e`
- DSH: `0.1.1-rc.2`

## Green gates

- provider: 240 tests, lint, format, typecheck, build, dependency inventory, package contract, React 18 isolated consumer, and 15 Playwright journeys;
- consumer: 138 tests, boundary check, build, three package inventories, lifecycle qualification, clean-profile qualification, and the saved-evidence real DSH Harness journey;
- real Harness: Select without Footer; 12-column adjustable Dashboard; receipt, Fact, compare, and Trace recovery; Waterfall, Tree, and Statistics siblings; dark/light; 360 × 720 semantic Tree fallback with no Studio overflow; scoped outage; zero browser errors;
- core stylesheet: injected exactly once at the Studio root so every page in the Host-owned family receives the same scoped assets; the 360px run observed 113 CSSOM rules and no overflowing Studio descendants.

`provenance:verify` is intentionally deferred until the clean release candidate directory is constructed in Wave 4; running it before candidate construction fails closed because `artifacts/candidate/provenance.json` does not yet exist.

The owner accepted the WSR Studio page family manually on 2026-09-02. The remaining Waterfall Span Tree/DataZoom cohesion defect is tracked by [#178](https://github.com/firestige/workflow-self-recursive/issues/178) and does not block issue 170. Benchmark execution is intentionally deferred; this Wave 2 acceptance uses functional, structural, package, lifecycle, and saved-evidence replay gates only.

## Screenshot digests

| Journey | SHA-256 |
|---|---|
| selection dark desktop | `86797dbb5e29cbefdca83b46d83ac063c638c85bcfd63b2a79c3e6ea1bed7f18` |
| dashboard dark desktop | `e72aec18122e54389c21c2d8e59d9ff43858a9722216b867801edba1be369ac8` |
| Waterfall dark desktop | `ef310af27c26690647c496d196bf41253bcbde1f6cfa21eaf695142173515166` |
| Tree dark desktop | `1f6261cece9becba2c1e453ef0f342e2a8069d6d3732ddc59cb74e02dc186c37` |
| Statistics dark desktop | `fee6a1ee1e4cf0eb00ce3082cc15e539ed025263c51d34f23d7055e546e35224` |
| Tree dark narrow | `84679f6eb1e746888136f85c153175724d8919c38a5d6d2a99d15ac86ce447a6` |
| Waterfall light narrow | `343d4f2d4006ce4865f4d79ff7e5e627a8253657bf02d95e00b01cdbd2bb3b3f` |
