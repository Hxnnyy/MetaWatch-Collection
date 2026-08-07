# Execution Policy

This policy governs issues-execution runs.

## Operating Mode

- Activation: continuous from an explicit continuous directive or persisted `mode: continuous`; the latest explicit interactive override wins. Bare `go` never newly activates continuous mode.
- Pause policy once continuous mode is active: hard-block conditions only (at T1, underspecified acceptance is decided small and flagged; at T2+ it hard-blocks).
- T0 stays outside durable orchestration: keep working in normal conversation and create no Longflow artifacts.

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

At T1, every item closes on one honest check; size remains `null` and there are no predicate scripts. At T2+, an item can close only when its rigour-class gate is met:

1. `production-transferable`: check script passes on the integration branch; gate reviewers no-blocking at the promise gate.
2. `dogfood-disposable`: one honest check passes. Nothing else.
3. `spike`: the answer is recorded in the execplan.

## Promise and Run Closure Policy

A promise normally becomes `verified` when its walkthrough holds, the intent audit (T2+) is aligned, and required reviewers are no-blocking with every note disposed within the 3-cycle budget. If cycle 3 instead ends with only non-material findings open, raw reviewer verdicts remain unchanged, every finding is disposed, and the gate records `review_outcome: closed_with_residuals`. A material finding hard-blocks. `verified` is evidence-relative and may become `needs_recheck` after later in-scope work.

The run closes only when:

1. Every promise is verified.
2. At T1, every ledger item's honest check passes. At T2+, the production predicate roll-up passes.
3. The end-to-end walkthrough holds; at T2+ the final intent audit is `aligned`.
4. At T2+, required final persona audits are `PASS` or `NOT_APPLICABLE` on the normal path; after cycle 3, a separate `review_outcome: closed_with_residuals` may close only when every remaining finding is non-material, disposed, and preserved in its raw verdict. T1 has no final reviewer panel.
5. The retro is appended to `RUNS.md`.

## State Durability Policy

Required files at T1+:

- tasks/INTENT.md
- tasks/STATE.json (carries the continuous directive)
- tasks/ledger/*.json (T1+)
- tasks/<date>-<slug>-execplan.md

These must be updated and re-read according to shared contracts.
Agent registry state is reconciled before new dispatches after compaction, restart, or handoff.
