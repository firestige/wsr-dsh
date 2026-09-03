# Source and license notice

Copyright 2026 firestige.

This monorepo is licensed under Apache-2.0. It contains DSH-specific adapters
and no copied Execution, Evidence, Evolution, or Workflow Package domain
implementation.

DeepSeek Harness is an external runtime dependency and compatibility target. The package metadata pins `@deepseek-ai/dsh` compatibility to `0.1.1-rc.2`; no DeepSeek Harness code is vendored in these packages. DeepSeek Harness is distributed by its owner under its own license.

The active fixed-version composition fork build consumes and embeds the exact
published client module from
`@deepseek-ai/dsh-client-ui-workspace@0.1.1-rc.2` (MIT, Copyright (c) 2026
DeepSeek) without DOM reparenting. Exact source, integrity, hashes, and license
attribution ship in `dsh-wsr-execution`.

The Execution domain owner is installed from the immutable
`wsr-execution-0.2.6.tgz` stable GitHub release asset (`0.2.6`, SHA-256
`8aee92d34018a9e48ec52630faf9774f02e563b846d910a77e8adab165eb468e`),
corresponding to owner revision
`0e8d937570de451f32764a99e9f6c5dfdb55474f`. Its source and license remain
owned and distributed by `firestige/wsr-execution`; no domain source is
copied into this adapter repository.
