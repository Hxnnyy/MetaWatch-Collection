---
name: longflow-orchestrator
description: "MetaWatch Longflow router: capture intent, calibrate how much process the task deserves (possibly none), then run the right subset of council, PRD, slicing, and continuous execution to make every promise true."
disable-model-invocation: true
---

# Longflow Orchestrator

Longflow is a toolkit, not a liturgy. This skill routes: it captures the owner's intent, decides how much of the toolkit the task deserves, and runs only that subset. The honest output of routing is sometimes *"this doesn't need Longflow — I'm going to build it."* That is a success of the process.

Why this shape: models over-index on ceremony — literal, maximal execution is what training rewards. The counterweights are structural, not rhetorical: a frozen intent contract, an explicit tier decision, per-item rigour classes, and a fresh-context intent auditor with binding descope authority. Read `../_shared/process-calibration.md` first; it is the spine.

## Phase 0 — Intent and calibration (always)

1. **Capture intent.** Draft `tasks/INTENT.md` (template: `../_shared/templates/INTENT.md`) during the intent stress-test — use `grilling` when assumptions are soft. Plain business language, the owner's own words, numbered promises, explicit non-goals, product class. Converge with the owner until confirmed; owner absent → `drafted-unconfirmed` (except T3, which blocks). Contract: `../_shared/intent-contract.md`.
2. **Propose a tier** (T0–T3) with a plain-English rationale — product class, blast radius, reversibility — and get the owner's sign-off. Owner absent: proceed under the proposed tier, except T3 (hard-block 9).
3. **Name the riskiest assumption.** If a cheap spike can answer it, run the spike before anything else is funded.
4. **Set a rough budget** and record the calibration entry in the execplan.

Then route:

- **T0**: build it. Normal conversation, no Longflow artifacts. Done.
- **T1**: write `STATE.json` + a short plan in the execplan; ledger items with a coverage check; implement; walkthrough per promise; report plainly.
- **T2–T3**: the full flow below, scaled per the tier table.

## Hard rules (T1+)

1. **The intent contract outranks everything** — the PRD, the ledger, reviewer opinions, and your own sense of what would be impressive. Only the owner amends it.
2. **Err toward under-engineering.** Follow-ups are trivial to scope later; wasted tokens are unrecoverable. Flag, don't build.
3. **Gates attach to promises, not waves.** Waves schedule; promises gate. Every gate includes a walkthrough. See `../_shared/promise-gates.md`.
4. **Rigour follows the item, not the run.** `production-transferable` gets the full gate; `dogfood-disposable` gets one honest check; `spike` delivers an answer. A disposable fixture that took three dispatches to perfect is a process failure.
5. **The intent auditor is independent and its T1–T2 descope verdicts are binding.** Dispatch it fresh-context on the strongest model, at slicing, at every T2+ gate, and on every tripwire. See `../_shared/intent-audit.md`.
6. **Breakglass is asymmetric.** Skipping tier-default ceremony: record one line, continue. Adding ceremony above defaults: intent-auditor concurrence first.
7. **Continuous delivery is the default once execution starts.** Continue until every promise is true or a finite hard block fires. See `../_shared/continuous-mode.md`.
8. **Fresh reviewers verify from the product and the code, not from reports.** Risk-routed panels within the hard 3-cycle budget per gate (`../_shared/reviewer-protocol.md`).
9. **Execution uses a bounded agent pool** per `../_shared/agent-lifecycle.md`: reserved slots, zero descendant delegation by default, prompt closure of consumed threads.
10. **Every recorded decision carries `serves promise #N because <...>`.** A decision that cannot name its promise is drift in its earliest catchable form.

## Flow (T2–T3)

1. **Council** — only when there is genuine plan-level disagreement or architecture risk (T3: default). One time-boxed adversarial round with a pragmatist seat; empirical disagreements become spikes, not debate. `council`, `../_shared/council-protocol.md`.
2. **Parent PRD** — `write-a-prd`. Subordinate to the intent contract; promise trace and subtraction pass mandatory; frozen promise-level acceptance authored here.
3. **Slicing** — `prd-to-issues`. Local ledger (GitHub is an optional projection), rigour classes, S/M/L sizing, proportionate checks — then the **coverage audit**: every promise funded, every item cites a promise. Blocking, both directions.
4. **Execution** — `issues-execution`. Continuous mode, tripwire monitoring, promise gates as they come due.
5. **Closeout** — end-to-end walkthrough, final intent audit, final reviewer panel (no `PASS_WITH_NOTES`), plain-English handover: which promises are true, what it cost, what was flagged. Append the retro to `RUNS.md` (`../_shared/templates/RUNS.md`).

## Reporting

Every substantive execplan entry and every user-facing report opens plain-English: **what happened / what we decided / what it means for the product / intent-match confidence** (`../_shared/state-files.md`). If you cannot fill those lines, that is tripwire 4 — audit now.

## See also

- `../_shared/process-calibration.md` — tiers, rigour classes, breakglass, budgets.
- `../_shared/intent-contract.md`, `../_shared/intent-audit.md` — the anchor and its keeper.
- `../_shared/promise-gates.md`, `../_shared/walkthrough-verification.md` — gate mechanics.
- `grilling` — pre-flow stress testing. `merge-train` — pre-merge audit for existing branches.
