---
name: issues-execution
description: Use to implement a ledger tree end-to-end with mode-aware orchestration, rigour-classed checks, tripwire monitoring, and promise gates with walkthroughs and intent audits.
---

# Issues Execution (MetaWatch Longflow)

Orchestrate delivery of the ledger tree until every promise in `tasks/INTENT.md` is verified. You are the orchestrator. Subagents implement; you own the outcome. A subagent reporting "done" is a claim to verify, not evidence — and a promise gate passing on paper while the walkthrough stumbles is the walkthrough's win.

## T0 boundary

This skill is a T1+ executor. If calibration routes the task to T0, return to normal conversational implementation before Phase 0. Do not create or require `INTENT.md`, `STATE.json`, an execplan, or a ledger; run one honest final product check and report normally.

## Hard rules

1. **Mode activation has durable precedence.** Continuous mode activates from an explicit continuous directive or persisted `mode: continuous`; the latest explicit interactive override wins. Bare `go` never newly activates continuous mode. See `../_shared/continuous-mode.md`.
2. **Hard-block list is finite** (`../_shared/hard-block-conditions.md`). Anything not on it is not a stop condition.
3. **Gates attach to promises, not waves** (`../_shared/promise-gates.md`). Waves are silent scheduling. Every gate opens with a walkthrough (`../_shared/walkthrough-verification.md`).
4. **Rigour follows tier and item.** T1 uses one honest check per item. At T2+, `production-transferable` gets a predicate script and risk-routed review by default, `dogfood-disposable` gets one honest check, and `spike` delivers the recorded answer.
5. **Tripwires fire audits now, not at the next gate.** Watch the list in `../_shared/intent-audit.md`; a binding descope verdict is implemented, not relitigated.
6. **Reviewer verdicts are structured** (`../_shared/reviewer-protocol.md`), risk-routed, and budgeted: 3 review cycles per gate, hard, however panels are named.
7. **State files** (`tasks/STATE.json`, ledger, execplan) are reused when they exist and updated per `../_shared/state-files.md`; never overwrite an existing `STATE.json` or execplan from a template. Re-read `STATE.json` (with its `directive`) and `INTENT.md` at every promise gate and on every resume. Its decisions, assumptions, binding actions, and residual risks are operative judgement; its promise metadata governs evidence freshness and `needs_recheck`.
8. **Respect the selected mode.** In continuous mode, suppress routine check-ins into `[CHECKIN-SUPPRESSED]` execplan entries, decide with a `serves promise #N` line, and continue. In interactive mode, surface the checkpoints and ambiguities allowed by `../_shared/continuous-mode.md`.
9. **Implementers do not silently modify checks.** At T2+, a diff touching `scripts/verify-issue-<id>.sh` from an implementation dispatch is rejected; any check believed miscalibrated goes through the course-correction channel (`../_shared/course-correction-protocol.md`) and the proportionality rules.
10. **Protected-branch safety.** Local commits are expected. Do not push to `main`/`master`, force-push, rewrite shared history, or open/merge PRs unless explicitly authorized.
11. **Bound and reap the agent pool** per `../_shared/agent-lifecycle.md`: reserved slots, zero descendant delegation by default, prompt closure of consumed threads.

## Phase 0: Prepare state

1. Determine mode from the activation contract: explicit directive or persisted continuous state, unless the latest message explicitly overrides to interactive.
2. First distinguish initial calibrated preparation from resume or mid-run execution. Only during initial calibrated preparation may Phase 0 create a missing `tasks/STATE.json` and execplan from the templates; then record tier, promises from `INTENT.md`, budget, and `next_action`. On resume or mid-run, missing or malformed `STATE.json` fires hard-block 8 — do not reconstruct it. Reuse existing artifacts and preserve their directive and judgement while migrating an older valid snapshot in place to the current schema. Resolve the harness agent-thread limit into `agent_pool.max_threads` (default 6), `reserved_slots: 2`.
3. Never replace a populated state or execplan: append or make the smallest truthful update.
4. Optional, long unattended runs only: wire the run-scoped Stop guard project-locally (`../_shared/hooks/continuous-stop-guard/HOOK.md`). Modern harnesses rarely stop prematurely; skip it by default and rely on `STATE.json.directive`.

## Phase 1: Ingest

1. Read `INTENT.md`, `STATE.json`, the ledger, and repo standards.
2. At T1, verify every item names one honest check. At T2+, an explicit logged below-default breakglass waives the predicate requirement for the named `production-transferable` item. Only an unwaived missing T2+ production predicate is a configuration bug — dispatch a `prd-to-issues` correction pass, not a workaround.
3. Confirm the coverage audit ran at slicing. If it never did, run it now before funding implementation (`../_shared/intent-audit.md`).
4. Derive the dispatch frontier: items with no open `blockedBy`, grouped for parallelism by disjoint file sets.

## Phase 2: The loop

Repeat until every promise is verified:

### 2a. Reconcile

Re-read state per the re-read discipline. Adopt its active decisions, open assumptions, binding actions, and residual risks before deciding what remains; use git only to check each verified promise's recorded evidence revision and scope. Transition affected evidence to `needs_recheck`, then reconcile the agent registry per `../_shared/agent-lifecycle.md` before trusting any dispatch decision.

### 2b. Dispatch

One subagent per frontier item up to the normal pool budget. Each receives: the item file, relevant T1 intent/execplan context or T2+ PRD excerpts, its check (as contract), exclusive file list, standards source, test commands, and explicit instructions — not alone in the codebase; no off-list files; no check edits; `Delegation budget: 0`; deliverables are summary, files modified, check output, anything skipped and why. Record the agent ID in `STATE.json` immediately; mark the item `in_progress`.

Scale dispatch effort to the item: a `dogfood-disposable` S item gets a short prompt and no ceremony. If the harness lacks parallel subagents, run sequentially — parallelism is a throughput optimization, not a requirement. On agent-limit errors: one reconcile-and-reap, one retry, then sequential fallback. Never loop on failed spawns.

### 2c. Verify per item

On return: consume the result; `git diff` scoped to the item's files; confirm no off-scope or check-script modifications; run the item's check.

- Check fails on a **production** item: fix directly if small; otherwise dispatch corrective work against the same evidence. Hard-block 3 fires only when the same root cause remains unresolved after three corrective dispatches against that item; the initial failed check is not a corrective dispatch.
- Check fails on a **disposable** item: fix or simplify in one move. It needs to work, not to be perfect.
- Watch tripwire 2 as you read the diff: machinery whose purpose is satisfying the check means the check is probably miscalibrated — raise the proposal instead of admiring the workaround.

Stage only the item's files; commit referencing the item; update the ledger file (status, evidence, spend note if the item ran ~2× its size — that is tripwire 3).

### 2d. Promise gates as they come due

After every verified item, ask whether a credible runnable path may already satisfy any promise. If so, run that promise's gate now per `../_shared/promise-gates.md`; gate opening is forced no later than completion of the last mapped item serving it.

1. Set the promise to `verifying`, then run the **walkthrough** — fresh walker, the promise's user journey, plain-English narrative. `does_not_hold` is unfinished work (back to 2b), not a review finding.
2. **Intent audit** (T2+) — fresh auditor, strongest model, evidence pack per `../_shared/intent-audit.md`.
3. **Reviewer panel** (T2+, production items only) — risk-routed, structured verdicts, iterate-on-blocked within the 3-cycle budget. A gate entering its third cycle has already tripwired.

Append every raw verdict unchanged and record applied dispositions separately. Close the gate by the normal or budget-exhaustion path in the shared contract: `review_outcome: passed` normally, `closed_with_residuals` only on the exceptional path. Mark the promise `verified` with verification time, SHA, evidence references, and exact file-or-directory-prefix scope; append the plain-English gate entry to the execplan; challenge/cancel remaining mapped work that no longer contributes; close all consumed threads.

## Phase 3: Closeout

1. Resolve or convert every remaining `PASS_WITH_NOTES` note; run the full test suite. At T1, run each item's honest check. Run the production predicate roll-up (T2+ only): `for f in scripts/verify-issue-*.sh; do bash "$f"; done`.
2. **End-to-end walkthrough** of the whole journey, all promises in sequence.
3. **Final intent audit** (T2+) against the full contract: all promises verified, nothing unfunded shipped, proportionality held.
4. **Final reviewer panel** (T2+) — fresh where possible, verifying from the codebase. Normal closure accepts only `PASS` / `NOT_APPLICABLE`. The same 3-cycle budget applies; at exhaustion only non-material findings may close via `review_outcome: closed_with_residuals`, with raw verdicts preserved and every finding disposed. `merge-train` is the pre-merge backstop. T1 skips steps 3–4.
5. **Append the retro** to `RUNS.md` (`../_shared/templates/RUNS.md`): what ceremony paid for itself, what didn't, tripwires fired or missed, auditor performance, lessons that generalise.
6. Reconcile and close every agent thread. Record `final_closeout` with its walkthrough, audit, review, check, and retro references. Set `STATE.json` to `complete` only after the retro is durable.
7. **Report once, plain-English first**: which promises are verified (quote the walkthrough), what it cost against budget, what was flagged for follow-up and why the follow-ups are follow-ups.

## Anti-patterns

- Wave-gate ceremony: reviewer panels, closure summaries, or state entries keyed to waves.
- Re-deriving state from ledger scans or `git log` instead of `STATE.json` on resume.
- Applying the full review apparatus to a promise whose items are all disposable — its gate is the walkthrough.
- Treating a binding descope verdict as a finding to rebut.

## See also

- `../_shared/promise-gates.md`, `../_shared/walkthrough-verification.md`, `../_shared/intent-audit.md`
- `../_shared/continuous-mode.md`, `../_shared/hard-block-conditions.md`, `../_shared/state-files.md`
- `../_shared/reviewer-protocol.md`, `../_shared/agent-lifecycle.md`, `../_shared/ledger.md`
- `tdd` — implementation subagents use red-green-refactor through public seams for production behavior changes.
