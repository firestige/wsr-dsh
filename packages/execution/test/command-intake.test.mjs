import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { parseWsrCommand, promptDiagnostic } from "../src/intake/command.js";
import { ensureGitWorktree, presentToDshSession, recordWsrCommandInput } from "../src/intake/plugin.js";

const execute = promisify(execFile);

test("selector-only create returns an actionable safe Task diagnostic before Core admission", () => {
  const operation = parseWsrCommand("create hello-world-workflow@0.2.0");
  assert.deepEqual(promptDiagnostic(operation, []), {
    code: "TASK_PROMPT_REQUIRED",
    message: "Add a Task instruction after the Workflow selector or attach a file.",
  });
  assert.equal(promptDiagnostic(parseWsrCommand("create hello-world-workflow@0.2.0\nReview the greeting."), []), undefined);
  assert.equal(promptDiagnostic(operation, [{ type: "image" }]), undefined);
});

test("the handler emits an ordered presentation while the earlier native row remains hidden", async () => {
  const source = await readFile(resolve(import.meta.dirname, "../src/intake/plugin.js"), "utf8");
  const handler = source.split("async handler(invocation)", 2)[1].split("const { defineTool }", 1)[0];
  assert.match(handler, /presentToDshSession/u);
  assert.ok(handler.indexOf("recordWsrCommandInput") < handler.indexOf("parseWsrCommand"));
});

test("records each WSR user turn before its presentation without scheduling a later followup", async () => {
  const events = [];
  const agent = {
    session: { append(type, data, options) { events.push({ type, data, options }); } },
    followup() { throw new Error("late followup must not be used"); },
    async whenIdle() { throw new Error("command input must not wait for another agent turn"); },
  };
  await recordWsrCommandInput(agent, "create hello-world-workflow@0.2.0\nSay hello.", [], () => "message-1");
  presentToDshSession(agent, {
    schemaVersion: "wsr.presentation@1.0.0",
    correlation: "presentation-1",
    kind: "command-accepted",
    data: {},
  }, () => "presentation-command-1");

  assert.deepEqual(events.map(({ type }) => type), ["user/message", "command/run", "command/done"]);
  assert.equal(events[0].data.content[0].text, "/wsr create hello-world-workflow@0.2.0\nSay hello.");
  assert.equal(events[1].data.name, "wsr-presentation");
});

test("creates a clean Git baseline containing the existing workspace when create first needs a worktree", async () => {
  const root = await mkdtemp(join(tmpdir(), "wsr-create-worktree-"));
  const workspace = await realpath(root);
  try {
    await writeFile(join(workspace, "README.md"), "# User workspace\n", "utf8");
    assert.deepEqual(await ensureGitWorktree(workspace), { path: workspace, initialized: true });
    assert.equal((await stat(join(workspace, ".git"))).isDirectory(), true);
    assert.match((await execute("git", ["rev-parse", "HEAD^{tree}"], { cwd: workspace })).stdout.trim(), /^[0-9a-f]{40}$/u);
    assert.equal((await execute("git", ["show", "HEAD:README.md"], { cwd: workspace })).stdout, "# User workspace\n");
    assert.equal((await execute("git", ["status", "--porcelain"], { cwd: workspace })).stdout, "");
    const baseline = (await execute("git", ["rev-parse", "HEAD"], { cwd: workspace })).stdout.trim();
    assert.deepEqual(await ensureGitWorktree(workspace), { path: workspace, initialized: false });
    assert.equal((await execute("git", ["rev-parse", "HEAD"], { cwd: workspace })).stdout.trim(), baseline);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("repairs an already initialized workspace that has no HEAD", async () => {
  const root = await mkdtemp(join(tmpdir(), "wsr-create-headless-worktree-"));
  const workspace = await realpath(root);
  try {
    await execute("git", ["init", "--quiet"], { cwd: workspace });
    await writeFile(join(workspace, "README.md"), "# Existing headless workspace\n", "utf8");
    await assert.rejects(execute("git", ["rev-parse", "--verify", "HEAD"], { cwd: workspace }));

    assert.deepEqual(await ensureGitWorktree(workspace), { path: workspace, initialized: false });
    assert.match((await execute("git", ["rev-parse", "HEAD^{tree}"], { cwd: workspace })).stdout.trim(), /^[0-9a-f]{40}$/u);
    assert.equal((await execute("git", ["status", "--porcelain"], { cwd: workspace })).stdout, "");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("returns a typed failure when Git initialization cannot establish the worktree marker", async () => {
  const root = await mkdtemp(join(tmpdir(), "wsr-create-worktree-failure-"));
  const workspace = await realpath(root);
  try {
    await assert.rejects(
      ensureGitWorktree(workspace, async () => undefined),
      (error) => error?.code === "GIT_INIT_FAILED",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
