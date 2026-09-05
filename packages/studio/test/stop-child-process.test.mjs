import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { stopChildProcess } from "./stop-child-process.mjs";

test("forced child shutdown resolves only after the process emits exit", async () => {
  class DelayedForcedExitChild extends EventEmitter {
    exitCode = null;
    signalCode = null;
    signals = [];

    kill(signal) {
      this.signals.push(signal);
      if (signal === "SIGKILL") {
        setTimeout(() => {
          this.signalCode = signal;
          this.emit("exit", null, signal);
        }, 10);
      }
      return true;
    }
  }

  const child = new DelayedForcedExitChild();
  await stopChildProcess(child, { termTimeoutMs: 1, killTimeoutMs: 100 });

  assert.deepEqual(child.signals, ["SIGTERM", "SIGKILL"]);
  assert.equal(child.signalCode, "SIGKILL");
});

test("forced child shutdown fails closed when exit never arrives", async () => {
  class StuckChild extends EventEmitter {
    exitCode = null;
    signalCode = null;
    kill() { return true; }
  }

  await assert.rejects(
    stopChildProcess(new StuckChild(), { termTimeoutMs: 1, killTimeoutMs: 1 }),
    /CHILD_PROCESS_TERMINATION_TIMEOUT/u,
  );
});
