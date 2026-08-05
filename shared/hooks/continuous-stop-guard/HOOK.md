# continuous-stop-guard

A Stop-event hook that rejects agent stops while a continuous-mode execplan has open work. The strongest non-context lever for ensuring 10+ hour orchestrations don't pause prematurely — because hooks live in harness config, not the model's context window, and survive any compaction.

## What it does

On every Stop event:

1. Looks for `tasks/CONTINUOUS_DIRECTIVE.md` in the current working directory.
2. If absent → exit 0 (allow stop).
3. If present and `mode: continuous` → reads `tasks/STATE.json`.
4. If `STATE.json` shows `status: in_progress` → exits **2** with stderr:

   > `continuous-stop-guard: continuous execplan for parent PRD #<N> is in progress (next_action: <X>). Hard-block conditions are not met. Re-read tasks/CONTINUOUS_DIRECTIVE.md and continue working until parent PRD is closed or a hard-block from _shared/hard-block-conditions.md fires.`

5. If `STATE.json` shows `status: hard_blocked` → exit 0 (legitimate stop; user input needed).
6. If `STATE.json` shows `status: complete` → exit 0 (legitimate stop; run finished).
7. If `STATE.json` is missing or malformed → exit 0 with a stderr note (treated as state corruption; let the agent surface the hard-block to the user rather than infinite-looping the stop guard).
8. If `stop_hook_active: true` in the input payload → exit 0 (prevents infinite loops on re-entry).

## Wiring (per harness)

The hook script is `continuous-stop-guard.mjs` in this directory. It expects Node.js on PATH.

**Register project-locally, not globally.** The `issues-execution` orchestrator wires this into the target project's settings at Phase 0 of a continuous run and removes it at parent closure. The guard self-scopes via `tasks/CONTINUOUS_DIRECTIVE.md`, so a stale entry is harmless, but run-scoped registration keeps harness config clean. Note: some harnesses snapshot hooks at session start — an entry added mid-session may only arm from the next session.

### Claude Code

`<project>/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "node \"<absolute-path>/continuous-stop-guard.mjs\"",
        "timeout": 5
      }]
    }]
  }
}
```

Timeout unit: **seconds**.

### Codex CLI

`~/.codex/hooks.json` — same JSON shape as Claude Code. Timeout unit: **seconds**. Requires `codex_hooks = true` in `~/.codex/config.toml`.

### Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "hooks": {
    "AfterAgent": [{
      "hooks": [{
        "type": "command",
        "command": "node \"<absolute-path>/continuous-stop-guard.mjs\"",
        "timeout": 5000,
        "name": "continuous-stop-guard"
      }]
    }]
  }
}
```

Timeout unit: **milliseconds**. Event name: `AfterAgent` (Gemini's equivalent of Stop).

### Other harnesses

The hook contract is generic: stdin JSON in, exit codes out, stderr surfaces feedback to the agent. Wire it to whatever event represents "agent finished its turn".

## Input contract

Reads JSON on stdin. Uses only:

- `cwd` — the current working directory (falls back to `process.cwd()`).
- `stop_hook_active` — boolean; if `true`, the hook exits 0 to avoid infinite loops.

All other input fields are ignored. The hook is read-only against the filesystem.

## Output contract

- **Exit 0**: stop allowed. Stdout is ignored.
- **Exit 2**: stop rejected. Stderr is surfaced to the agent as feedback for it to act on.
- **Other exit codes**: treated as non-blocking warnings (ignored).

## Failure modes

- **Node not on PATH**: hook fails silently; harness treats as non-blocking. Document Node as a prerequisite in repo onboarding.
- **`STATE.json` malformed**: hook exits 0 with a stderr note. The agent's recovery protocol (`_shared/state-files.md`) handles state corruption as hard-block condition 8.
- **Hook script missing or unreadable**: harness logs but does not block. Validate the path on initial wire-up.

## When NOT to use

- For interactive sessions where pausing is desirable. (The hook only activates when `CONTINUOUS_DIRECTIVE.md` is present, so this is automatic.)
- For runs that explicitly want check-ins (use `interactive mode` at dispatch — `CONTINUOUS_DIRECTIVE.md` is never written).

## Tuning

If you want stricter enforcement (e.g. always require an explicit user override to stop, even outside continuous mode), edit the script. The default is permissive: only continuous-mode runs are guarded.
