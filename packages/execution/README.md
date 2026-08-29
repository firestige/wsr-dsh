# WSR

`dsh-wsr-execution` is the DeepSeek Harness bundle displayed as **WSR**. It
owns only DSH-specific Intake, Host gateway, Delivery resource, Session view,
Action disclosure, and final-message presentation.

Delivery state comes from the read-only `DeliveryControlPlaneReadModel` exported
by `wsr-execution`; the browser reaches it only through the loopback Host RPC
channel. Sidebar reads never execute `/wsr list`. Execution domain behavior,
recovery, mutation, and Provider authority remain in `wsr-execution`.

The required Cordis configuration is:

```yaml
configFile: /absolute/path/to/execution-config.yaml
bindingFile: /absolute/path/to/dsh-intake-bindings.json
```

The package is locked to DSH `0.1.1-rc.2`. Its Workspace UI composition fork
and exact MIT provenance are documented under
`src/client/delivery-inventory/UPSTREAM.md`.
