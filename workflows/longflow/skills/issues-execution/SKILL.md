---
name: issues-execution
description: Use to implement a ledger tree end-to-end with continuous orchestration, rigour-classed checks, tripwire monitoring, and promise gates with walkthroughs and intent audits.
---

# Issues Execution (MetaWatch Longflow)

Orchestrate delivery of the ledger tree until every promise in `tasks/INTENT.md` is true. You are the orchestrator. Subagents implement; you own the outcome. A subagent reporting "done" is a claim to verify, not evidence — and a promise gate passing on paper while the walkthrough stumbles is the walkthrough's win.

## Hard rules

1. **Continuous mode is the default** when invoked with end-to-end intent. Interactive mode requires an explicit `interactive mode` instruction. See `../_shared/continuous-mode.md`.
2. **Hard-block list is finite** (`../_shared/hard-block-conditions.md`). Anything not on it is not a stop condition.
3. **Gates attach to promises, not waves** (`../_shared/promise-gates.md`). Waves are silent scheduling. Every gate opens with a walkthrough (`../_shared/walkthrough-verification.md`).
4. **Rigour follows the item.** `production-transferable`: check passes on the integration branch, risk-routed review at the gate. `dogfood-disposable`: one honest check, ship it, move on — corrective ping-pong on a fixture is a process failure. `spike`: the answer, recorded.
5. **Tripwires fire audits now, not at the next gate.** Watch the list in `../_shared/intent-audit.md`; a binding descope verdict is implemented, not relitigated.
6. **Reviewer verdicts are structured** (`../_shared/reviewer-protocol.md`), risk-routed, and budgeted: 3 review cycles per gate, hard, however panels are named.
7. **State files** (`tasks/STATE.json`, ledger, execplan) are written before any dispatch and updated per `../_shared/state-files.md`. Re-read `STATE.json` (with its `directive`) and `INTENT.md` at every promise gate and on every resume.
8. **Suppress, don't surface.** Every "should I check in" impulse becomes a `[CHECKIN-SUPPRESSED]` execplan entry in the plain-English format, then a decision with its `serves promise #N` line, then continue.
9. **Implementers do not silently modify checks.** A diff touching `scripts/verify-issue-<id>.sh` from an implementation dispatch is rejected; a check believed miscalibrated goes through the course-correction channel (`../_shared/course-correction-protocol.md`) and the proportionality rules.
10. **Protected-branch safety.** Local commits are expected. Do not push to `main`/`master`, force-push, rewrite shared history, or open/merge PRs unless explicitly authorized.
11. **Bound and reap the agent pool** per `../_shared/agent-lifecycle.md`: reserved slots, zero descendant delegation by default, prompt closure of consumed threads.

## Phase 0: Prepare state

1. Determine mode from invocation.
2. Write `tasks/STATE.json` from `../_shared/templates/STATE.json`: tier, promises from `INTENT.md`, budget from calibration, `next_action`. Resolve the harness agent-thread limit into `agent_pool.max_threads` (default 6), `reserved_slots: 2`.
3. Create `tasks/<YYYY-MM-DD>-<slug>-execplan.md` from `../_shared/templates/EXECPLAN.md`, contract summary at top.
4. Optional, long unattended runs only: wire the run-scoped Stop guard project-locally (`../_shared/hooks/continuous-stop-guard/HOOK.md`). Modern harnesses rarely stop prematurely; skip it by default and rely on `STATE.json.directive`.

## Phase 1: Ingest

1. Read `INTENT.md`, `STATE.json`, the ledger, and repo standards.
2. Verify every `production-transferable` item has its check script; missing checks are a configuration bug — dispatch a `prd-to-issues` correction pass, not a workaround.
3. Confirm the coverage audit ran at slicing. If it never did, run it now before funding implementation (`../_shared/intent-audit.md`).
4. Derive the dispatch frontier: items with no open `blockedBy`, grouped for parallelism by disjoint file sets.

## Phase 2: The loop

Repeat until every promise is true:

### 2a. Reconcile

Re-read state per the re-read discipline. Reconcile the agent registry per `../_shared/agent-lifecycle.md` before trusting any dispatch decision.

### 2b. Dispatch

One subagent per frontier item up to the normal pool budget. Each receives: the item file, relevant PRD excerpts, its check (as contract), exclusive file list, standards source, test commands, and explicit instructions — not alone in the codebase; no off-list files; no check edits; `Delegation budget: 0`; deliverables are summary, files modified, check output, anything skipped and why. Record the agent ID in `STATE.json` immediately; mark the item `in_progress`.

Scale dispatch effort to the item: a `dogfood-disposable` S item gets a short prompt and no ceremony. If the harness lacks parallel subagents, run sequentially — parallelism is a throughput optimization, not a requirement. On agent-limit errors: one reconcile-and-reap, one retry, then sequential fallback. Never loop on failed spawns.

### 2c. Verify per item

On return: consume the result; `git diff` scoped to the item's files; confirm no off-scope or check-script modifications; run the item's check.

- Check fails on a **production** item: fix directly if small; otherwise steer the same agent once, then one corrective dispatch. Three same-root-cause failures = hard-block 3.
- Check fails on a **disposable** item: fix or simplify in one move. It needs to work, not to be perfect.
- Watch tripwire 2 as you read the diff: machinery whose purpose is satisfying the check means the check is probably miscalibrated — raise the proposal instead of admiring the workaround.

Stage only the item's files; commit referencing the item; update the ledger file (status, evidence, spend note if the item ran ~2× its size — that is tripwire 3).

### 2d. Promise gates as they come due

When the last item serving a promise completes, run its gate per `../_shared/promise-gates.md`:

1. **Walkthrough** — fresh walker, the promise's user journey, plain-English narrative. `does_not_hold` is unfinished work (back to 2b), not a review finding.
2. **Intent audit** (T2+) — fresh auditor, strongest model, evidence pack per `../_shared/intent-audit.md`.
3. **Reviewer panel** (T2+, production items only) — risk-routed, structured verdicts, iterate-on-blocked within the 3-cycle budget. A gate entering its third cycle has already tripwired.

Close the gate; mark the promise `true`; append the plain-English gate entry to the execplan; close all consumed threads.

## Phase 3: Closeout

1. Resolve or convert every remaining `PASS_WITH_NOTES` note; run the full test suite and the production predicate roll-up (`for f in scripts/verify-issue-*.sh; do bash "$f"; done`).
2. **End-to-end walkthrough** of the whole journey, all promises in sequence.
3. **Final intent audit** against the full contract: all promises true, nothing unfunded shipped, proportionality held.
4. **Final reviewer panel** — fresh where possible, verifying from the codebase, `PASS_WITH_NOTES` treated as `BLOCKED`, same 3-cycle budget; residual non-material findings convert to follow-up items with `merge-train` as the pre-merge backstop.
5. Reconcile and close every agent thread. Set `STATE.json` to `complete`.
6. **Report once, plain-English first**: which promises are true (quote the walkthrough), what it cost against budget, what was flagged for follow-up and why the follow-ups are follow-ups.
7. **Append the retro** to `RUNS.md` (`../_shared/templates/RUNS.md`): what ceremony paid for itself, what didn't, tripwires fired or missed, auditor performance, lessons that generalise.

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
