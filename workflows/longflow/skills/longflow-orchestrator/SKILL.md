---
name: longflow-orchestrator
description: "MetaWatch Longflow router: capture intent, calibrate how much process the task deserves (possibly none), then run the right subset of council, PRD, slicing, and continuous execution to verify every promise."
disable-model-invocation: true
---

# Longflow Orchestrator

Longflow is a toolkit, not a liturgy. This skill routes: it captures the owner's intent, decides how much of the toolkit the task deserves, and runs only that subset. The honest output of routing is sometimes *"this doesn't need Longflow — I'm going to build it."* That is a success of the process.

Why this shape: models over-index on ceremony — literal, maximal execution is what training rewards. The counterweights are structural, not rhetorical: a frozen intent contract, an explicit tier decision, per-item rigour classes, and a fresh-context intent auditor with binding descope authority. Read `../_shared/process-calibration.md` first; it is the spine.

## Phase 0 — Intent and calibration (always)

1. **Capture intent in conversation.** During the intent stress-test, use plain business language, the owner's own words, numbered promises, explicit non-goals, and product class — use `grilling` when assumptions are soft. Read the latest relevant `RUNS.md` retro before calibrating. Do not create run files before the tier is known. Contract: `../_shared/intent-contract.md`.
2. **Propose a tier** (T0–T3) with a plain-English rationale — product class, blast radius, reversibility — and get the owner's sign-off. Owner absent: proceed under the proposed tier, except T3 (hard-block 9). At T1+, persist the captured intent as `tasks/INTENT.md` (template: `../_shared/templates/INTENT.md`) and converge with the owner until confirmed; owner absent → `drafted-unconfirmed`.
3. **Name the riskiest assumption.** If a cheap spike can answer it, run the spike before anything else is funded.
4. **Set a rough budget** and record the calibration entry in the execplan.

Then route:

- **T0**: build it. Normal conversation, no Longflow artifacts or durable run state, even when the owner asked you to keep going. Done.
- **T1**: write `INTENT.md`, `STATE.json`, a short execplan, and a local ledger with `size: null`; run the coverage audit; give each item one honest check; implement; walkthrough per promise; report plainly. There is no PRD or predicate-script apparatus. Acceptance stays visibly provisional while the owner is absent.
- **T2–T3**: the full flow below, scaled per the tier table.

## Hard rules (T1+)

1. **The intent contract outranks everything** — the PRD, the ledger, reviewer opinions, and your own sense of what would be impressive. Only the owner amends it.
2. **Err toward under-engineering.** Follow-ups are trivial to scope later; wasted tokens are unrecoverable. Flag, don't build.
3. **Gates attach to promises, not waves.** Waves schedule; promises gate. Every gate includes a walkthrough. See `../_shared/promise-gates.md`.
4. **Rigour follows the calibrated tier and item.** T1 gives every item one honest check. At T2+, `production-transferable` gets a predicate and risk-routed review, `dogfood-disposable` gets one honest check, and `spike` delivers an answer. A disposable fixture that took three dispatches to perfect is a process failure.
5. **The intent auditor is independent and its T1–T2 descope verdicts are binding.** Dispatch it fresh-context on the strongest model, at slicing, at every T2+ gate, and on every tripwire. See `../_shared/intent-audit.md`.
6. **Breakglass is asymmetric.** Skipping tier-default ceremony: record one line, continue. Adding ceremony above defaults: intent-auditor concurrence first.
7. **Mode activation has durable precedence.** Continuous delivery activates from an explicit continuous directive or persisted `mode: continuous`; the latest explicit interactive override wins. Bare `go` never newly activates continuous mode. Once active, continue until every promise is verified or a finite hard block fires. See `../_shared/continuous-mode.md`.
8. **Fresh reviewers verify from the product and the code, not from reports.** Risk-routed panels within the hard 3-cycle budget per gate (`../_shared/reviewer-protocol.md`).
9. **Execution uses a bounded agent pool** per `../_shared/agent-lifecycle.md`: reserved slots, zero descendant delegation by default, prompt closure of consumed threads.
10. **Every recorded decision carries `serves promise #N because <...>`.** A decision that cannot name its promise is drift in its earliest catchable form.
11. **Durable state carries operative judgement and evidence freshness.** At every resume and promise gate, adopt the decisions, assumptions, binding actions, and residual risks in `STATE.json`; move affected verified promises to `needs_recheck` when later work touches their recorded scope. See `../_shared/state-files.md`.

## Flow (T2–T3)

1. **Council** — at T2, only when genuine plan-level disagreement exists. Architecture risk and broad multi-system scope may surface that disagreement, but they are not independent triggers. T3 runs one round by default. The round has a pragmatist seat; empirical disagreements become spikes, not debate. `council`, `../_shared/council-protocol.md`.
2. **Parent PRD** — `write-a-prd`. Subordinate to the intent contract; promise trace and subtraction pass mandatory; frozen promise-level acceptance authored here.
3. **Slicing** — `prd-to-issues`. Local ledger (GitHub is an optional projection), rigour classes, S/M/L sizing, proportionate checks — then the **coverage audit**: every promise funded, every item cites a promise. Blocking, both directions.
4. **Execution** — `issues-execution`. Continuous mode, tripwire monitoring, promise gates as they come due.
5. **Closeout** — end-to-end walkthrough, aligned final intent audit, and a final reviewer panel. Normal closure accepts only `PASS` / `NOT_APPLICABLE`; the sole exception is documented budget exhaustion with only non-material residuals and gate-level `closed_with_residuals`. Append the retro to `RUNS.md` (`../_shared/templates/RUNS.md`), record `STATE.json.final_closeout`, then give the plain-English handover: which promises are verified, what it cost, what was flagged.

## Reporting

Every substantive execplan entry and every user-facing report opens plain-English: **what happened / what we decided / what it means for the product / intent-match confidence** (`../_shared/state-files.md`). If you cannot fill those lines, that is tripwire 4 — audit now.

## See also

- `../_shared/process-calibration.md` — tiers, rigour classes, breakglass, budgets.
- `../_shared/intent-contract.md`, `../_shared/intent-audit.md` — the anchor and its keeper.
- `../_shared/promise-gates.md`, `../_shared/walkthrough-verification.md` — gate mechanics.
- `grilling` — pre-flow stress testing. `merge-train` — pre-merge audit for existing branches.
