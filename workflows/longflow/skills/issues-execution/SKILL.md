---
name: issues-execution
description: Use to implement a parent PRD and child issue tree end-to-end with orchestration, predicates, reviews, and closure.
---

# Issues Execution (MetaWatch Longflow)

Orchestrate delivery of a parent PRD's child issue tree. You are the orchestrator. Subagents implement; you own the outcome. A subagent reporting "done" is a claim to verify, not evidence.

## Hard rules

1. **Continuous mode is the default** when the user invokes with end-to-end intent (a child range, "implement issues X to Y", "until done", "no pause", etc.). Interactive mode requires an explicit `interactive mode` instruction. See `../_shared/continuous-mode.md`.
2. **Hard-block list is finite.** See `../_shared/hard-block-conditions.md`. Anything not on it is not a stop condition.
3. **Predicate gate.** A child does not close unless `bash scripts/verify-issue-<n>.sh` exits 0 on the integration branch.
4. **Reviewer verdicts are structured.** See `../_shared/reviewer-protocol.md`. Final close requires `blocking_count == 0` and verdicts in `{PASS, NOT_APPLICABLE}` across all required final reviewers.
5. **State files** (`tasks/CONTINUOUS_DIRECTIVE.md`, `tasks/STATE.json`, `tasks/<date>-<slug>-execplan.md`) are written before any subagent dispatch and updated on every child status change, reviewer verdict, agent lifecycle transition, wave transition, and hard-block. Re-read `CONTINUOUS_DIRECTIVE.md` at the start of every wave.
6. **Suppress, don't surface.** Every "should I check in" impulse becomes a `[CHECKIN-SUPPRESSED]` execplan entry, then a decision, then continue.
7. **Implementers do not modify predicate scripts.** Reject any diff to `scripts/verify-issue-<n>.sh` from an implementer dispatch.
8. **Protected-branch safety.** Local commits are expected. Do not push directly to `main`/`master`, force-push, rewrite shared history, or open/merge PRs unless the workflow invocation or user explicitly authorizes that remote action.
9. **Bound and reap the agent pool.** Apply `../_shared/agent-lifecycle.md` to every dispatch, return, recovery, and closeout. Returned is not closed; consumed agents are closed promptly.

## Operating principles

- You orchestrate; subagents implement.
- Standards first. Read repo standards and the child's predicate script before dispatching the implementer.
- Parallelism requires disjoint files. Verified at dispatch against each issue's `Files likely touched`.
- Parallelism also requires pool capacity. Reserve two agent slots and reconcile tracked threads before every batch.
- Verify before commit: read diff, run predicate, run relevant tests, commit.
- Commit before wave audit. Each verified child gets its own commit.
- Close children only after wave sign-off (predicates green AND wave reviewers in `{PASS, PASS_WITH_NOTES, NOT_APPLICABLE}`).
- Iterate on `BLOCKED` within the gate's review-cycle budget: 3 cycles per gate, hard, counted per gate no matter how a re-review panel is named. At the budget, material findings (security, data loss/corruption, tenant isolation, failing predicate) are hard-block 4; everything else becomes a residual finding for `merge-train`. See `../_shared/reviewer-protocol.md`.
- No parent closure without final sign-off.

## Inputs

Typical invocation:

> "Implement issues 42 to 51. #42 is the parent PRD."

Extract: repo, parent PRD, child issue numbers, Delivery Governance.

If parent or range is ambiguous, ask once before starting. Even continuous mode requires a valid scope.

## Phase 0: Prepare state

Before any other action:

1. Determine mode from invocation (continuous unless `interactive mode` stated).
2. Write `tasks/CONTINUOUS_DIRECTIVE.md` from `../_shared/templates/CONTINUOUS_DIRECTIVE.md` with parent PRD and child range filled in.
3. Write `tasks/STATE.json` from `../_shared/templates/STATE.json`. Set `parent_prd`, `started_at`, `next_action: "phase_1_ingest"`.
   Resolve the harness agent-thread limit if available and store it in `agent_pool.max_threads`; otherwise store `6`. Keep `agent_pool.reserved_slots = 2`.
4. Create `tasks/<YYYY-MM-DD>-<slug>-execplan.md` from `../_shared/templates/execplan.md`. The continuous-mode contract summary is mandatory at the top.
5. Wire the run-scoped Stop guard **project-locally** (never globally): merge a `Stop` hook entry into the project's `.claude/settings.json` (or harness equivalent — see `../_shared/hooks/continuous-stop-guard/HOOK.md`) pointing at the installed `continuous-stop-guard.mjs`. The guard self-scopes — it only rejects stops while `tasks/CONTINUOUS_DIRECTIVE.md` says `mode: continuous` and `STATE.json` is `in_progress`. Some harnesses snapshot hooks at session start, so it may only arm from the next session; proceed either way.

## Phase 1: Ingest

1. Re-read `tasks/CONTINUOUS_DIRECTIVE.md`.
2. Fetch parent PRD: `gh issue view <prd> --comments`.
3. Fetch every child: `gh issue view <n> --comments`.
4. For each child, record in `STATE.json`: title, ACs, predicate script path, files owned, delivery standards source, risk tags, required reviewers, escalation triggers, blocked-by relationships.
5. Read repo standards (`AGENTS.md`, `CLAUDE.md`, `docs/DeliveryStandards.md`, etc.).
6. **Verify predicate scripts exist** for every child. If any are missing, dispatch a `prd-to-issues` correction pass to author them before implementation. Missing predicates is a configuration bug, not a hard-block.
7. Build the wave plan from Delivery Governance.
8. Append the execution plan to the execplan and proceed (interactive mode would surface here; continuous mode logs and continues).
9. Update `STATE.json`: `next_action: "dispatch_wave_1"`.

## Phase 2: Implement a wave

For each wave in dependency order:

### 2a. Re-read directive

Re-read `tasks/CONTINUOUS_DIRECTIVE.md`. This is the structural beat that re-injects the contract regardless of compaction state.
Reconcile the current run's agent registry per `../_shared/agent-lifecycle.md` before trusting the next dispatch action.

### 2b. Partition work

Verify parallel issues have disjoint file sets (cross-check `Files likely touched`). If two share a file, move one to a sequential tail.

If a child lacks a file list, inspect the repo and write a conservative file-ownership contract before dispatch (and update the issue body).

### 2c. Dispatch implementation subagents

Before dispatch, apply the dispatch gate in `../_shared/agent-lifecycle.md`. Dispatch one subagent per parallel-safe issue up to the remaining normal pool budget. Each subagent receives:

- Full child issue body
- Relevant parent PRD excerpts
- The child's `scripts/verify-issue-<n>.sh` (their AC contract)
- Exclusive file list
- Delivery standards source
- Required tests and commands
- Explicit instruction: not alone in the codebase; do not modify off-list files; **do not modify the predicate script**.
- Explicit instruction: `Delegation budget: 0. Do not spawn subagents.` unless the orchestrator intentionally authorizes a bounded descendant.
- Explicit deliverables: summary, files modified, predicate run output, test results, anything skipped/deferred and why.

Immediately record the spawned agent ID in `STATE.json.agent_pool.threads` and update `child.status = "in_progress"`.

If your harness does not support parallel subagents, run sequentially. Parallelism is a throughput optimization, not a requirement.
If dispatch hits the agent limit, perform one reconciliation-and-reap pass and retry once; then reduce concurrency or continue sequentially. Never loop on failed spawns.

### 2d. Verify each child

When a subagent reports complete:

1. Mark its registry entry `returned` and persist the result summary in the execplan.
2. Run `git status` and `git diff` scoped to the child's files.
3. Confirm no off-scope files modified, including `scripts/verify-issue-<n>.sh`.
4. Run `bash scripts/verify-issue-<n>.sh`. If exit ≠ 0:
   - If small/obvious, fix directly.
   - Otherwise steer the same agent once when its context remains useful; if a replacement is needed, close the old thread before dispatching a corrective implementer with the predicate output as input.
   - Cap retries at 3 per child. Three failures with the same root cause = hard-block 3.
5. Run broader project tests for confidence.
6. Map every AC to file/line evidence.
7. Stage only the child's files; commit with issue reference (e.g. `feat: <slice> (#<n>)`).
8. Update `STATE.json`: `child.status = "predicate_passed"`, `commit_sha`, `predicate_last_exit = 0`; mark the result consumed and close the agent thread.

Do not close the issue yet. Wait for the wave gate.

### 2e. Run wave-gate audits

After all wave children are predicate-passed and committed:

- Reviewer selection per `../_shared/reviewer-protocol.md` and the wave's declared reviewers from Delivery Governance.
- Add reviewers if actual diffs triggered escalation conditions.
- Always include `implementation-quality-reviewer` and `documentation-reviewer` (unless explicitly justified).

Each reviewer receives:

- Canonical reviewer prompt (or named-agent dispatch)
- Parent PRD body
- Wave's child issues
- Delivery Governance
- Standards source
- Commit range
- Test commands and results
- Predicate run summaries
- Required output: structured verdict per `../_shared/reviewer-protocol.md`

Update `STATE.json`: `reviewer_verdicts.wave_<N>.<reviewer> = ...`.
Close each reviewer thread as soon as its valid verdict is stored, following `../_shared/agent-lifecycle.md`.

### 2f. Iterate on findings

Verdict handling per `../_shared/reviewer-protocol.md`:

- `PASS`, `NOT_APPLICABLE`: no action.
- `PASS_WITH_NOTES`: record notes for final sweep (only if non-structural; otherwise treat as `BLOCKED`).
- `BLOCKED`: dispatch corrective implementer with structured findings as input. Re-run predicates. Re-run affected reviewer(s). Re-run full wave panel if cross-cutting.

Review-cycle budget: **3 cycles per gate, hard.** Every reviewer dispatch against the gate — partial re-run, full-panel re-run, or any relabelled "fresh"/"final"/"zero-blocker" pass — consumes one cycle; increment `reviewer_verdicts.wave_<N>.review_cycles` each time. At the budget: material findings (security, data loss/corruption, tenant isolation, failing predicate) = hard-block 4; all other open findings are recorded as residual findings in the execplan and gate comment, and the gate closes — `merge-train` catches stragglers pre-merge. Do not dispatch a fourth cycle.

Do not rationalize away findings. Document any rebuttal with code evidence in the execplan.
Corrective implementers and rerun reviewers use the same tracked return/reuse/close lifecycle as the original threads.

### 2g. Close wave children

When all wave reviewers are in `{PASS, PASS_WITH_NOTES, NOT_APPLICABLE}` — or the wave's review-cycle budget is exhausted with only residual (non-material) findings open and recorded:

1. Reconcile the wave's agent threads. Every returned result must be consumed and every terminal thread must have closure attempted.
2. Append wave summary to execplan: children, commits, reviewers, verdicts, predicate roll-up.
3. Append a parent PRD comment with the same summary.
4. Close each wave child with a one-line shipped summary.
5. Update `STATE.json`: each child `status = "closed"`; wave `status = "closed"`; advance `current_wave` and `next_action`.
6. Move to next wave (back to 2a).

## Phase 3: Final sweep

Before final closeout:

1. Resolve all wave-gate `PASS_WITH_NOTES` items, or convert to follow-up issues if truly out-of-scope.
2. Run the full project test suite.
3. Run the full predicate roll-up: `for f in scripts/verify-issue-*.sh; do bash "$f"; done`. All must exit 0.
4. Confirm docs are current and not bloated.
5. Confirm every child closed.
6. Commit cleanup separately if anything changed.
7. Update `STATE.json`: `next_action: "final_audit"`.

## Phase 4: Final parent closeout audit

Run final reviewers per Delivery Governance. Final reviewers start fresh where possible.

Each receives:

- Parent PRD
- Delivery Governance
- Closed child list
- Full commit range
- Current code/docs
- Full test results
- Predicate roll-up (all green)
- Explicit instructions:
  - Verify the PRD from the codebase, not from implementation reports.
  - Final closeout accepts only `PASS`, `BLOCKED`, or `NOT_APPLICABLE`. `PASS_WITH_NOTES` here is treated as `BLOCKED`.

If any returns `BLOCKED`: fix, commit, re-run that reviewer. Re-run the full final panel if cross-cutting. The final panel has the same hard budget as a wave gate: 3 review cycles total. At the budget, material findings hard-block; all other open findings become residual findings converted to follow-up issues — `merge-train` re-reviews the full branch before merge.

**Closure condition**: every required final reviewer returns `PASS` or `NOT_APPLICABLE` with `blocking_count == 0` — or the final panel's review-cycle budget is exhausted with only residual (non-material) findings, recorded and converted to follow-up issues.

Update `STATE.json`: `reviewer_verdicts.final.<reviewer> = ...` for each.
Close each final reviewer thread as soon as its valid verdict is stored.

## Phase 5: Close parent PRD

1. Reconcile the agent registry, consume every returned result, and attempt closure of every terminal thread.
2. Close the parent PRD with a comment linking:
   - Closed child issues
   - Wave summaries
   - Final reviewer verdicts
   - Test commands and results
   - Predicate roll-up
   - Any follow-up issues created from out-of-scope notes
3. Update `STATE.json`: `status = "complete"`, `mode = "complete"`, `next_action = null`, `updated_at`.
4. Update `tasks/CONTINUOUS_DIRECTIVE.md`: change `mode: continuous` to `mode: complete`. Do not delete — it's part of the audit trail.
5. Remove the run-scoped `continuous-stop-guard` hook entry from the project's `.claude/settings.json` (or harness equivalent). Leave the settings file otherwise untouched.
6. Append final summary to execplan.
7. Report back to the user once.

Do not push directly to `main`/`master`, force-push, rewrite shared history, or open/merge PRs unless explicitly authorized.

## Anti-patterns

Everything the hard rules state positively is omitted here. Two mistakes the rules don't already cover:

- Creating wave-gate issues instead of recording wave gates in parent comments + `STATE.json`.
- Re-deriving state from `gh issue list` instead of reading `STATE.json` on resume.

## Relationship to other skills

- `write-a-prd`: produces the parent PRD this skill consumes.
- `prd-to-issues`: produces child issues, predicate scripts, file-ownership contracts, risk tags, audit plans.
- `tdd`: implementation subagents should use red-green-refactor through public seams for behavior changes.
- `codebase-quality-sweep`: Phase 4 dispatches to this skill for orchestration.

## See also

- `../_shared/continuous-mode.md`
- `../_shared/hard-block-conditions.md`
- `../_shared/acceptance-predicates.md`
- `../_shared/reviewer-protocol.md`
- `../_shared/agent-lifecycle.md`
- `../_shared/state-files.md`
- `../_shared/hooks/continuous-stop-guard/`
