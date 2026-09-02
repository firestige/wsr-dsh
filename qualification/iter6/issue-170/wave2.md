# Wave 2 — `dsh-wsr-studio` shared BI qualification

## Candidate identity

- Product implementation commit: `f2eb20d52733d4d51278fd221fff879afa379e44`
- Exact qualified commit: `69bbdf567aa2ce3bd77037f69ef8db3a822666d5`
- Shared provider: `wsr-ui-core@0.1.0-rc.0`
- Provider integrity: `sha512-jHK1jASNAw0WqNMrzgOK9KWZls/DiA7q8J2shE96/Gatb2mTw+lzG7UY+8rWuh1PWfyTFuvqnS3u/hVfyCrOBw==`
- Provider tarball: `https://registry.npmjs.org/wsr-ui-core/-/wsr-ui-core-0.1.0-rc.0.tgz`
- `package-lock.json` SHA-256: `66f899db76e7c32f4d5708237c9c1937549601dac290293f4e88c37c3435879e`

The Studio manifest pins the exact registry version. The lock and bundle contain
no `file:`, `workspace:`, adjacent `wsr-ui` source path, scoped predecessor
`@wsr/bi`, or copied shared source.

## Host adapter and bundle

- Studio keeps the existing DSH connection gateway, slot registration, routing,
  storage, chrome, and DSH primitives.
- The browser entry imports only `wsr-ui-core` and its public `styles.css`
  export. The build treats the scoped stylesheet as text and mounts it inside
  the shared `BiSurface`; the stylesheet itself is scoped to `.wsr-bi`.
- Studio maps the existing formal compute/facts/traces DTOs into public shared
  component inputs. Shared code never accesses the DSH gateway or chooses a
  Host route.
- React and `react/jsx-runtime` remain Host imports. D3 and the qualified shared
  package bytes are bundled once into the Studio browser artifact.
- Studio bundle size: `218759` bytes.
- Studio bundle SHA-256: `4d3c8c46596d65157515fbb1532e29b85f6999b2b81dd253857bb845611d56d2`.
- Studio manifest SHA-256: `fb653b83f5c782ed869cb1461ce890f8174885c76437ccde011ee5c08e62b92e`.
- Local Studio pack integrity: `sha512-JiBpYqmW3lq2ASGB6az5Gz6lr8gmrwHs3T0GOdaWXgAvPh1BmMsg3UZIPvtqxqt6JrgYQsiVTZZD6xo2ZTtsag==`.
- Local Studio pack shasum: `1904ecf62766c0188f7dbea727f874075775f7cb`.

The local Studio archive is qualification-only and has not been published or
promoted. Final package versioning and promotion remain Wave 5 checkpoints.

## Product behavior

- AVAILABLE metrics render the compatible shared panel and exact value; ratio
  values select the static SVG ratio panel.
- UNAVAILABLE metrics render the shared semantic state and withholding reason.
- Compare results use shared panels for each side, and use
  `CompareResultFrame` when the formal delta contract supplies a delta.
- Evaluation receipts use `ReceiptView`; Fact drill-down uses
  `EvidenceConsoleFoundation`; formal recorded Trace items are projected with
  the public `projectRecordedStructure` domain function and rendered through
  `RecordedStructureFoundation`.
- JSON is absent from the default product surface. The complete response is
  mounted only after the explicit `Technical JSON details` disclosure opens.
- Incompatible Metric, Fact, or Trace shapes fail closed into shared semantic
  error states instead of falling back to JSON-first rendering.

## RED → GREEN evidence

The initial RED product/dependency tests failed because Studio had no formal
dependency, imported no public shared surface, rendered metric slices through
`JsonTree`, and had no shared compare/receipt/Fact/Trace foundations. The GREEN
suite adds exact dependency/provenance tests, shared product rendering tests,
bundle inventory checks, and Host-React externalization checks.

## Exact clean qualification

A detached clean worktree at `69bbdf5` passed:

```text
npm ci --ignore-scripts         PASS
npm test                        PASS (120 tests)
npm run build                   PASS
npm run boundaries:check        PASS
npm run pack:verify             PASS (3 archives)
npm run qualify:clean-profile   PASS (execution, studio, suite)
npm run qualify:real-harness    PASS
```

The real DSH Web journey used fixed DSH `0.1.1-rc.2` and reported zero browser
errors. It verified native tab order, task load, compare Evaluate, shared metric
panels, receipt, Fact Evidence Console, recorded Trace graph, sessionStorage
deep-link recovery after reload, narrow viewport, keyboard disclosure, outage
degradation, and retained conversation-view behavior on Escape.

Three earlier real-Harness failures were retained in the execution transcript:
two exposed a stale diagnostic gate that queried content before opening its
native disclosure, and one exposed old Studio action labels. The final gate
opens the real disclosure and clicks the shared `View evidence` and exact trace
identity controls; it does not relax uniqueness, ordering, diagnostic content,
or browser-error assertions.
