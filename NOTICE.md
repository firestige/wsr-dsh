# Source and license notice

Copyright 2026 firestige.

This monorepo is licensed under Apache-2.0. It contains DSH-specific adapters
and no copied Execution, Evidence, Evolution, or Workflow Package domain
implementation.

DeepSeek Harness is an external runtime dependency and compatibility target. The package metadata pins `@deepseek-ai/dsh` compatibility to `0.1.1-rc.2`; no DeepSeek Harness code is vendored in these packages. DeepSeek Harness is distributed by its owner under its own license.

The active fixed-version composition fork consumes
`@deepseek-ai/dsh-client-ui-workspace@0.1.1-rc.2` (MIT, Copyright (c) 2026
DeepSeek) without vendoring or DOM reparenting. Exact source, integrity, hashes,
and license attribution ship in `dsh-wsr-execution`.
