# WSR Studio

`dsh-wsr-studio` is the independently installable **WSR Studio** bundle. It
provides the Harness-native Evaluate overlay, Task single/compare selection,
Metric Result, receipt, Fact, and recorded Trace navigation.

The browser calls only the DSH Host channel. The Host gateway accepts exact
loopback Evidence/Evolution origins and exposes a closed read/evaluate
allowlist; downstream outage remains isolated from WSR Execution. Configure:

```yaml
evidenceBaseUrl: http://127.0.0.1:4318
evolutionBaseUrl: http://127.0.0.1:4320
```

Evidence and Evolution retain API, validation, persistence, and calculation
authority. Migration provenance is recorded in `src/client/UPSTREAM.md`.
