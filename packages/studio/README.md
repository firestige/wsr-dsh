# WSR Studio

`dsh-wsr-studio` is the independently installable **WSR Studio** bundle. It
provides the Harness-native, non-modal top-level Evaluate view, Task single/compare selection,
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

The DSH 0.1.1-rc.2 Session summary formally supplies `cwd`, so Studio can use
it as replaceable repository context. It does not supply a WSR Task identity,
and frozen `evidence.query@1.0.0` Task listing accepts only `limit` and
`cursor`; consequently the current formal API cannot seed a Session Task or
perform repository-scoped Task discovery. Studio does not infer, scrape, or
client-filter either value.

For local component work, `npm run studio:dev` mounts the production Studio
plugin in a minimal development Harness at `127.0.0.1:4173`. It is not a
separate product or release artifact and deliberately owns no domain logic.
