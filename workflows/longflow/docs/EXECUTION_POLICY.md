# Execution Policy

This policy governs issues-execution runs.

## Operating Mode

- Default mode: continuous.
- Pause policy: hard-block conditions only (tier-parameterised — at T0–T1, underspecified acceptance is decided small and flagged, not blocked).

## Isolation Policy

If enabled in config or governance:

1. Run on a fresh branch.
2. Run in a fresh worktree.
3. Do not mutate protected environment surfaces used for demos.

## Delegation Policy

- Orchestrator controls flow and evidence.
- Implementers perform most code changes.
- Orchestrator direct edits only for tiny low-risk fixes.
- The normal delegated-thread budget is the harness limit minus two reserved slots.
- Child prompts default to zero descendant delegation unless the orchestrator grants a named bounded exception.
- Returned results are consumed and their threads closed promptly; agent-limit errors get one reconcile/reap and retry before sequential fallback.

## Routing Policy

Use model routing from config for:

- lead by issue type
- reviewer sets by issue type
- promise-gate panel (risk-routed; disposable-only gates get walkthrough only)
- final closeout panel
- intent auditor (`routing.intentAuditor` — strongest available model, always fresh-context)

## Item Closure Policy

An item can close only when its rigour-class gate is met:

1. `production-transferable`: check script passes on the integration branch; gate reviewers no-blocking at the promise gate.
2. `dogfood-disposable`: one honest check passes. Nothing else.
3. `spike`: the answer is recorded in the execplan.

## Promise and Run Closure Policy

A promise is `true` only when its walkthrough holds, the intent audit (T2+) is not misaligned, and required reviewers are no-blocking within the 3-cycle budget.

The run closes only when:

1. Every promise is true.
2. The production predicate rollup passes.
3. The end-to-end walkthrough holds and the final intent audit is `aligned`.
4. Required final persona audits are no-blocking.
5. The retro is appended to `RUNS.md`.

## State Durability Policy

Required files:

- tasks/INTENT.md
- tasks/STATE.json (carries the continuous directive)
- tasks/ledger/*.json (T2+)
- tasks/<date>-<slug>-execplan.md

These must be updated and re-read according to shared contracts.
Agent registry state is reconciled before new dispatches after compaction, restart, or handoff.
