# BI/Evaluate source attribution

This Studio presentation is a clean DSH-specific adaptation of the BI/Evaluate
interaction model first implemented in `firestige/wsr-ui` at commit
`d92c6ce2e62a7a51edff8591942a2aa0ad5017dd` (Apache-2.0).

The migrated product behaviors are Task selection, single/compare evaluation,
Metric Result navigation, receipt access, Fact/Trace drill-down, partial-result
retention, refresh recovery, and accessible loading/error states. This package
does not copy Evidence or Evolution validators, formulas, persistence, or query
semantics. Those remain owned by their versioned HTTP APIs. `wsr-ui` remains
historical migration provenance and is not a second product publisher.
