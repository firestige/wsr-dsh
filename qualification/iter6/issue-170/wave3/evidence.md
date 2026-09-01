# Wave 3 — native Delivery layout qualification

## Candidate identity

- Exact qualified `wsr-dsh` commit: `2efcd8363c7340f364e0847ab50dc713c200c461`
- Product commits: `06f45dc474d9e29e6279f74deebf44afc438505f`, `413ece9ecfbbc7a2da97afec5f97026d377bcba2`
- Fixed DSH: `0.1.1-rc.2`
- Execution bundle SHA-256: `fa6ecb2aea1e6ccdc81468032513086a45ebd73a95f0727a3f9479cd82703b06`
- Consumer lock SHA-256: `66f899db76e7c32f4d5708237c9c1937549601dac290293f4e88c37c3435879e`
- Execution manifest SHA-256: `d9a8f37699574f1ab32e43adb4aeed0019c08c2131720de6594eed32b515fa61`

The layout consumes the unchanged `execution.delivery-control-plane@1.0.0`
Session projection. It labels only a non-null projection `current` as Current
Action or Current Intervention. Terminal records have `current: null`, so they
show the authoritative Outcome and never infer or promise a final Action.

## RED to GREEN

The first RED run failed the old flat `<dl>` on compact summary structure,
native status primitives, identity disclosure/copy controls, and responsive
layout rules. A second RED exposed that pointer-only HoverCard content did not
satisfy the keyboard gate. GREEN uses the fixed DSH `DisclosureRow`, `Pill`,
`StateDot`, `Tooltip`, `Button`, copy icons, and `writeClipboard` exports.
Expanded identity values are exact and wrap safely; every value has a stable
accessible Copy label and polite success/failure feedback.

Working-tree screenshots then exposed two visual defects before qualification:
long digests squeezed Copy controls into vertical text, and viewport-only media
queries left four summary columns in a 320px container. The final candidate uses
`minmax(0, 1fr) auto` for value/action rows and container-responsive `auto-fit`
grids. Both defects are locked by source and real-browser assertions.

Fixtures cover RUNNING, SUCCEEDED, FAILED, detached, stale, UNBOUND, long
identities, absent optional data, and long localized content. Detached and stale
inputs continue to fail closed. No projection, gateway, network, or lifecycle
source changed; the Delivery view still subscribes to the same read-only source
without executing a command or adding a request.

## Exact clean gates

A detached worktree at the exact candidate passed:

```text
npm ci --ignore-scripts --no-audit --no-fund  PASS
npm test                                      PASS (126 tests)
npm run build                                 PASS
npm run boundaries:check                      PASS
npm run pack:verify                           PASS (3 archives)
npm run qualify:clean-profile                 PASS (execution, studio, suite)
WSR_QUALIFY_TERMINAL=1 npm run qualify:real-harness
                                              PASS (DSH 0.1.1-rc.2, 0 browser errors)
```

The real Harness verified terminal inventory and reload recovery, native tab
order, first-fold Status/Workflow/Outcome/Elapsed bounds, a four-column desktop
grid, no document or view overflow, keyboard disclosure with retained focus,
nine uniquely labelled copy controls and announced copy-denial feedback, a
single-column 320px container, 200% zoom, Studio regression paths, and zero
browser errors. Headless clipboard permission was denied, so the expected
accessible `Delivery copy failed` feedback was observed; the injected primitive
unit path separately proves that an accepted write receives the exact value.

## Visual evidence

- `screenshots/delivery-desktop.png` — `d1a404c79104f8b1a3e6b5bf3ff5f3b12545a543af1552e8e9df50b62938c350`
- `screenshots/delivery-identities-expanded.png` — `e9cdd1c705b7e099144a725abd16f99ca1725ecfd24183d457e0db366c61c67c`
- `screenshots/delivery-narrow-320.png` — `820243559d10304fad5e2688492b594d3720172f7a2e23af0828bc2f38fe978d`
- `screenshots/delivery-zoom-200.png` — `c236c09eec48b843423cf86b384e74b3bf73254314ecc9dddd134ddde3fa72ad`

The screenshots use the fixed DSH chrome, typography, tokens, StateDot, Pill,
DisclosureRow, Tooltip, and toolbar Button surfaces. Visual inspection confirms
that the corrected candidate keeps actions unsqueezed, exact values readable,
and the 320px summary in one column without introducing a second visual system.
