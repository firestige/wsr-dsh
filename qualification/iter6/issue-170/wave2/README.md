# Issue 170 Wave 2 — approved Studio page family

This evidence binds the corrected Host assembly to the locally packed reusable provider. It does not qualify a remote registry artifact.

## Candidate identity

- provider commit: `ab58b56323ffdee6ee4b6d0a650fd0cac8ee94ac`
- provider coordinate: `wsr-ui-core@0.1.0-rc.0`
- local tar SHA-256: `aee476770e14418b3a90d72883b0550a3f89009d7523df81869874f2ab2d3d8e`
- local tar npm shasum: `16a23cb92d29d761de1e39b96ea62bab664a2bff`
- local tar integrity: `sha512-Zmci0Gf4lVGDRM7I3yOUO2eaGnjldbh8rk7L9gnga92/0DZEM96JVkZtzmXiSy8WSmLUsNiM7CWm4O4GnjmFuw==`
- consumer implementation commit: `992538c`
- embedded Studio bundle SHA-256: `daa59f312c33a3dcc7adb32449fe30159c24c0f6e82e85f67a9c2d22142a671d`
- consumer lock SHA-256: `66f899db76e7c32f4d5708237c9c1937549601dac290293f4e88c37c3435879e`
- DSH: `0.1.1-rc.2`

## Green gates

- provider: 225 tests, lint, format, typecheck, build, dependency inventory, package contract, React 18 isolated consumer, and 15 Playwright journeys;
- consumer: 129 tests, boundary check, build, three package inventories, and the real DSH Harness journey;
- real Harness: Select without Footer; 12-column adjustable Dashboard; receipt, Fact, compare, and Trace recovery; Waterfall, Tree, and Statistics siblings; dark/light; 360 × 720 semantic Tree fallback with no Studio overflow; scoped outage; zero browser errors;
- core stylesheet: injected exactly once at the Studio root so every page in the Host-owned family receives the same scoped assets; the 360px run observed 113 CSSOM rules and no overflowing Studio descendants.

`provenance:verify` is intentionally deferred until the clean release candidate directory is constructed in Wave 4; running it before candidate construction fails closed because `artifacts/candidate/provenance.json` does not yet exist.

## Screenshot digests

| Journey | SHA-256 |
|---|---|
| selection dark desktop | `6cdbb462b08f8eae2651839643c86efde08a4d769d87b791470065010459040a` |
| dashboard dark desktop | `7a73bbbec16a02b1e1a01e11416c454ae9dad78d786ee329cd96c35f590c3f40` |
| Waterfall dark desktop | `c12016898164de56fa56a10955be42061f6c8f9487718251f1d794f48097f6eb` |
| Tree dark desktop | `6402f818767fba00ec82f4f0baac302da6f689d90c572ba951d5610e110179f6` |
| Statistics dark desktop | `21df3c683b27e9c8f43f474ed2ef143cff20c94c61f0fd19994cd77c85cb74ce` |
| Tree dark narrow | `f9b5de9a144dc37d3938d24c3ec1fcb11760a99c4544fb438a58f85641be5cf4` |
| Waterfall light narrow | `e0c0051258edead10e3f47d6048695d52f84486de503ec9dc9caddec10712cee` |
