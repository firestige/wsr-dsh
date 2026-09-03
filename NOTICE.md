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
`wsr-execution-0.2.4.tgz` stable GitHub release asset (`0.2.4`, SHA-256
`f38f3b3af21ace416418385b860aa70a89ce8388e9e5eef436eb706f63b6c6f1`),
corresponding to owner revision
`3c2f23e8a06b8a8dd5d61d4ed07637092323b93e`. Its source and license remain
owned and distributed by `firestige/wsr-execution`; no domain source is
copied into this adapter repository.
