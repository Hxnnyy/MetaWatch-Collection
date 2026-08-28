---
name: merge-train
description: Rigorous pre-merge audit/remediation loop for feature branches and large PRs, with child PR slicing, parent checkpoints, and fresh-reviewer closeout.
disable-model-invocation: true
---

# Merge Train

Run Merge Train when the user wants a feature branch or parent PR reviewed before merging to `main`/`master`. The starting point may be no PR, one parent PR, existing child PRs, or a partially completed train.

## Promise

Before a feature branch is ready for human merge, drive a rigorous audit/remediation loop until fresh reviewers find no material issues and every remaining finding carries an explicit disposition — across correctness, structure, security, tests, documentation, product, and integration.

## Authority

Invocation of this skill authorizes local commits, feature-branch pushes, parent PR creation or updates, child branch/PR creation, labels, comments, state files, ledgers, and risk-register updates needed for the train.

It does **not** authorize direct pushes to `main`/`master`, force-pushes, history rewrites, destructive production actions, or merging the parent PR unless the user explicitly requests that action.

## Hard rules

1. **Detect state before acting.** Inspect branch, PRs, labels, comments, train files, child PRs, checks, and merge base before deciding the next phase.
2. **Strict review is a consequence bar.** Apply `references/strict-review-bar.md` at child audit, parent checkpoints, and final closeout: a finding blocks by naming its consequence, and passing tests are not enough.
3. **Findings are adjudicated, not obeyed.** Every finding gets a disposition — `fix-now`, `follow-up`, `residual-risk`, or `rebutted` (evidence-backed) — before remediation is dispatched; only `fix-now` reaches a remediator. Raw verdicts stay immutable; the ledger's dispositions table is the decision record, and it travels with every later reviewer. A `rebutted` finding returns only with new evidence.
4. **Fresh verification is required.** The verifier must inspect code and evidence after remediation; do not accept the remediator's completion report as signoff.
5. **No child integration without adjudicated signoff.** A child may merge into the parent only after audit, adjudication, remediation of `fix-now` findings, deterministic checks, and fresh verification pass — or after the cap settles it per `references/audit-remediate-loop.md`.
6. **Run parent checkpoints after risk triggers.** Shared abstractions, auth/security/data/schema/public APIs/background jobs/build or test config/architecture boundaries require checkpoint review.
7. **Risk-class defaults are a ceiling as well as a floor.** Ceremony above a child's risk-class defaults requires intent-auditor concurrence recorded in the execplan; skipping below them is a one-line breakglass entry (`references/risk-classes.md`).
8. **Recover rather than restart.** If train state exists, reconstruct progress and continue from the next unsafe or incomplete step.
9. **Final closeout accepts no material findings and no undispositioned notes.** Parent readiness requires zero open material findings and an explicit disposition on every note; a structural note whose consequence does not reach material closes as `follow-up` or `residual-risk` in the packet.

## Phase 0: Detect start state

Read `references/start-state-detection.md`.

Classify the workspace:

- `NO_PARENT_PR`: current branch has no parent PR.
- `PARENT_ONLY`: parent PR exists but no train state or child PRs.
- `CHILDREN_EXIST`: parent and child PRs exist.
- `PARTIAL_TRAIN`: train state, ledgers, labels, or comments indicate progress.
- `FINAL_READY_CANDIDATE`: children appear merged/deferred and only final closeout remains.

Write or update `MERGE_TRAIN_STATE.json` before starting destructive or remote work.

## Phase 1: Prepare parent and slices

If no parent PR exists:

1. Identify base branch (`main` preferred, otherwise `master`).
2. Inspect diff from merge base.
3. Create or prepare the parent PR from the current feature branch.
4. Decide whether child PRs are needed using `references/child-slicing.md`.

If parent PR exists:

1. Ingest parent intent, branch state, current checks, comments, and labels.
2. Discover existing children by labels, branch names, comments, and parent references.
3. Create missing child slices only when the parent diff is too large or conceptually tangled for reliable review.

## Phase 2: Audit and remediate children

Read `references/audit-remediate-loop.md`.

For each child slice or child PR:

1. Classify risk with `references/risk-classes.md`.
2. Audit the child diff against parent intent and strict review bar.
3. Adjudicate: disposition every finding; only `fix-now` findings fund remediation.
4. Remediate `fix-now` findings within child scope.
5. Run configured tests and predicates.
6. Dispatch a fresh verifier carrying the dispositions table.
7. Iterate until a cycle yields no `fix-now` dispositions, the 3-cycle cap settles the child (material findings hold for owner disposition; the rest close with residuals), or a hard block fires. A child on its second cycle dispatches the intent auditor.
8. Post/update the child completion comment and child report.
9. Integrate into the parent branch according to repo policy.
10. Update parent ledger (including dispositions), risk register, and state.

## Phase 3: Parent checkpoints

Read `references/parent-checkpoints.md`.

Run checkpoints after configured merge counts, every child batch, every high-risk child, and every high-risk surface. Checkpoints look for integration drift that individual child reviews can miss: duplicated abstractions, inconsistent contracts, loose types, global coherence breaks, and composition-level test gaps. When remediation across children has grown the parent diff rather than shrunk it, the intent auditor joins the checkpoint.

## Phase 4: Final closeout

Read `references/final-closeout.md`.

Run final parent reviewers only after children are merged or explicitly deferred. The panel is the canonical shared roster — `implementation-reviewer`, `security-reviewer`, `product-reviewer`, `operations-reviewer` — plus the `intent-auditor` as the proportionality seat.

Final reviewers inspect code, ledger (with dispositions), risk register, checkpoint reports, deterministic checks, predicate/test rollup, and strict-review disposition. Write `FINAL_PARENT_REVIEW_PACKET.md` when no material findings remain and every note is dispositioned.

## Phase 5: Stabilise and hand off

Confirm ledgers, risk register, PR body, child summaries, final packet, docs, and deferred work are explicit. Run the deferral-ticket scan — `node templates/run-ledger-predicates.mjs --scan FINAL_PARENT_REVIEW_PACKET.md PARENT_INTEGRATION_LEDGER.md CHILD_SUMMARIES` (paths as the train laid them out): every committal deferral phrase must carry a ticket reference or an explicit `no-ticket: <reason>` waiver (`references/run-ledger-predicates.md`). An unticketed deferral is an undispositioned note. Append a run retro to the repo's `RUNS.md` — ceremony that paid, ceremony that didn't, tripwires fired, reusable rule. Report that the parent is ready for human merge; do not merge unless requested.

## Recovery

Read `references/state-recovery.md` when any state file, PR comment, label, or branch convention suggests a train is already underway. Prefer durable state, then PR evidence, then branch diffs. If evidence conflicts, choose the safest incomplete phase and rerun verification rather than assuming completion.
