# WSR Studio

`dsh-wsr-studio` is the independently installable **WSR Studio** bundle. It
provides the Harness-native Evaluate overlay, Task single/compare selection,
Metric Result, receipt, Fact, and recorded Trace navigation.

The browser calls only the DSH Host channel. The Host gateway accepts exact
loopback Evidence/Evolution origins and exposes a closed read/evaluate
allowlist; downstream outage remains isolated from WSR Execution. Configure:

```sh
./wsr-compose host-config > /path/to/wsr-loopback-host.json
```

Then set `hostConfigFile: /path/to/wsr-loopback-host.json` in the plugin config.

Evidence and Evolution retain API, validation, persistence, and calculation
authority. The published service bundle's `./wsr-compose host-config` command
materializes the same `wsr.loopback-host@1.0.0` fixture, including the Evidence
base reused by Execution Observation and the operation-scoped
`evidence.query@0.1.0` facts/traces plus `evidence.query@1.0.0` Task revisions.
Service outage, restart, timeout, partial
stack, malformed health, and incompatible health appear only as typed Studio
degradation; they never change Execution Delivery lifecycle. Migration
provenance is recorded in `src/client/UPSTREAM.md`.
