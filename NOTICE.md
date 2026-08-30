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
`wsr-execution-0.1.4.tgz` GitHub stable release asset (`0.1.4`, SHA-256
`0b889b707b5fdc84d934e6c807ce101b4edaa356409253a1f48d6ffca7f53420`),
corresponding to owner revision
`d4fa9607e5e3153b969e186866ddd7697a119c81`. Its source and license remain
owned and distributed by `firestige/wsr-execution`; no domain source is
copied into this adapter repository.
