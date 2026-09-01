# Wave 3 — native Delivery layout qualification

## Candidate identity

- Exact qualified `wsr-dsh` commit: `80c365aa780d0ba8f224b87fb8f34dddd0ae9a3a`
- Product commits: `06f45dc474d9e29e6279f74deebf44afc438505f`, `413ece9ecfbbc7a2da97afec5f97026d377bcba2`
- Qualification commits: `2efcd8363c7340f364e0847ab50dc713c200c461`, `71852efb6e21ff9370b71e4b9f6936f073d6a29b`, `80c365aa780d0ba8f224b87fb8f34dddd0ae9a3a`
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

The real-Harness RED also found that selecting a terminal row after submitting
the qualification command moved to an empty Session, where DSH correctly omits
conversation tabs. The fixed fixture gives each terminal Delivery its own
Session and selects the fixed `delivery-completed` / `SUCCEEDED` Session before
submission. A later repeated-screenshot RED caught DSH sidebar transition
frames; the Harness now waits for stable Delivery/composer geometry before each
capture instead of weakening the visual threshold.

Fixtures cover RUNNING, SUCCEEDED, FAILED, detached, stale, UNBOUND, long
identities, absent optional data, and long localized content. Detached and stale
inputs continue to fail closed. No projection, gateway, network, or lifecycle
source changed; the Delivery view still subscribes to the same read-only source
without executing a command or adding a request.

## Exact clean gates

A detached worktree at the exact candidate passed:

```text
npm ci                                       PASS (316 packages, 0 vulnerabilities)
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

- `screenshots/delivery-desktop.png` — `d9ac7de5ac1ad45ea2f5e802708b2d49c687eba8cba80f754150ad8e0ec145be`
- `screenshots/delivery-identities-expanded.png` — `4397faea43552c3160fbafd80c2240d4f260c2495700249237cebc47c1c8d332`
- `screenshots/delivery-narrow-320.png` — `ec8af2cfde1fc633a28f20d40122f6d7ceaa12de12dc16b882956059bdc61e42`
- `screenshots/delivery-zoom-200.png` — `dfbdeee074b12dcfe965ef7b9398aea952d5443944cb65ca8dd9b2771d7cbf13`

The exact clean candidate was captured twice in independent real-Harness runs.
For each pair, FFmpeg computed absolute pixel difference, treated grayscale
differences above 4/255 as changed pixels, and divided the binary-mask mean by
255. Ratios were `0.000000000` (desktop), `0.000292969` (expanded),
`0.000000000` (320px), and `0.000000000` (200% zoom), all below the acceptance
manifest's `maxDiffPixelRatio: 0.005`. The small expanded-only difference is
limited to characters in the per-run temporary Worktree path.

The screenshots use the fixed DSH chrome, typography, tokens, StateDot, Pill,
DisclosureRow, Tooltip, and toolbar Button surfaces. Visual inspection confirms
that the corrected candidate keeps actions unsqueezed, exact values readable,
and the 320px summary in one column without introducing a second visual system.
