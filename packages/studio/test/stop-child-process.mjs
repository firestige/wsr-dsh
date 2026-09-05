function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForExit(child, timeoutMs) {
  if (hasExited(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(hasExited(child));
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

export async function stopChildProcess(child, options = {}) {
  if (child === undefined || hasExited(child)) return;
  const termTimeoutMs = options.termTimeoutMs ?? 5_000;
  const killTimeoutMs = options.killTimeoutMs ?? 5_000;
  child.kill("SIGTERM");
  if (await waitForExit(child, termTimeoutMs)) return;
  child.kill("SIGKILL");
  if (!await waitForExit(child, killTimeoutMs)) {
    throw new Error("CHILD_PROCESS_TERMINATION_TIMEOUT");
  }
}
