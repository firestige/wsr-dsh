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
`wsr-execution-0.2.3.tgz` stable GitHub release asset (`0.2.3`, SHA-256
`6066972da9d3ff20ab370bdd921d14754cfc8de8069e3f1c985ef5a98ac273fd`),
corresponding to owner revision
`d4287b9230da4b6be1f06785cbb841db048b4a84`. Its source and license remain
owned and distributed by `firestige/wsr-execution`; no domain source is
copied into this adapter repository.
