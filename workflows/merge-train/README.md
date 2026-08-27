# MetaWatch Merge Train

MetaWatch Merge Train is a workflow for taking a feature branch or parent PR through rigorous pre-merge audit, optional child slicing, adjudicated remediation, signed-off child integration, rolling parent checkpoints, and final parent manual-review readiness.

Use it when a parent branch is too large for ordinary review or when multiple child PRs must be integrated without losing global coherence.

## Flow

1. Detect the current state: no PR, parent-only PR, existing children, partial train, or final-ready candidate.
2. If no parent PR exists, prepare or open one from the current feature branch to `main`/`master`.
3. If child PRs do not exist and the parent is too large or mixed for reliable review, create semantic child PRs around coherent slices.
4. Prepare durable state and ledgers.
5. For each child PR or child slice: dispatch the audit, adjudicate every finding into a disposition, remediate `fix-now` findings, and re-verify with a fresh verifier carrying the dispositions table.
6. Post child completion comment.
7. Merge or close child into parent according to repo policy.
8. Update parent PR body, parent integration ledger (including dispositions), risk register, and state.
9. Run parent integration checkpoints after configured triggers.
10. When all children are merged or explicitly deferred, run final parent closeout.
11. Write the final manual-review packet and append a run retro to the repo's `RUNS.md`.

## Shared Dependencies

- `../../shared/orchestration/continuous-mode.md`
- `../../shared/orchestration/hard-block-conditions.md`
- `../../shared/orchestration/state-files.md`
- `../../shared/orchestration/autonomy-envelope.md`
- `../../shared/orchestration/course-correction-protocol.md`
- `../../shared/review/reviewer-protocol.md`
- `../../shared/review/reviewer-personas.md`
- `../../shared/review/verdict-schema.md`
- `../../shared/review/intent-audit.md`
- `../../shared/verification/acceptance-predicates.md`
- `../../shared/verification/predicate-adequacy-review.md`
- `../../shared/verification/test-adequacy-review.md`
- `docs/STRICT_REVIEW_BAR.md`

## Durable State Pack

Create these files in the target delivery workspace:

- `MERGE_TRAIN_STATE.json` (carries the continuous-mode `directive`; there is no separate directive file)
- `PARENT_INTEGRATION_LEDGER.md` (merge log plus the finding-dispositions table)
- `PARENT_RISK_REGISTER.md`
- `CHILD_SUMMARIES/`
- `CHECKPOINTS/`
- `EXECPLAN.md`

The public skill is `skills/merge-train`. Templates are in `templates/` and shared templates are in `../../shared/templates/`.

## Child PR Loop

For each child PR:

1. Audit against the child diff, branch state, and parent intent.
2. Apply the strict review bar: a finding blocks by naming its consequence — defect, security/data risk, contract break, failing check, or a named future change made materially harder.
3. Adjudicate every finding into a disposition (`fix-now | follow-up | residual-risk | rebutted`); only `fix-now` funds remediation.
4. Remediate and re-verify until a cycle yields no `fix-now` dispositions, or the 3-cycle cap settles the child: material findings hold it for owner disposition, everything else closes with recorded residuals.
5. Post the completion comment.
6. Merge into the parent branch according to repo policy.
7. Classify integration risk and update the ledger.

A child on its second cycle dispatches the intent auditor — the proportionality seat that keeps remediation fixing consequences rather than manufacturing work.

## Parent Checkpoints

Parent checkpoints run:

- after every N child merges, default 3,
- after every child batch,
- after any high-risk child,
- when shared abstractions are touched,
- when auth, security, database/schema, migrations, public APIs, background jobs, tests/config, or architecture boundaries are touched.

Checkpoint reviewers focus on global coherence, duplicated abstractions, error-handling drift, public contract drift, inconsistent solutions to the same concept, schema/API/auth/security integration, composition-driven test gaps, files touched by multiple children, and accumulated residual risk. They receive the dispositions table; a `rebutted` finding returns only with new evidence.

They also apply the strict review bar across the integrated parent branch, especially when child merges introduce large-file sprawl, scattered feature checks, abstraction drift, type-boundary churn, or repeated implementations of the same concept. When remediation across children has grown the parent diff rather than shrunk it, the intent auditor joins the checkpoint.

## Done Criteria

The parent is not done until:

- child PRs are closed/merged or explicitly deferred,
- parent integration ledger and its dispositions table are current,
- residual risks are remediated or explicitly accepted,
- final parent reviewers report no material findings and every note carries a disposition,
- deterministic checks, tests, and predicate rollup pass,
- final manual-review packet is written,
- a run retro is appended to the repo's `RUNS.md`.

## Config

```powershell
npm run validate:config -- workflows\merge-train\merge-train.config.example.json
npm run prompt:kickoff -- workflows\merge-train\merge-train.config.example.json
```
