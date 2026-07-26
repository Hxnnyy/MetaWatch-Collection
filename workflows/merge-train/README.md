# MetaWatch Merge Train

MetaWatch Merge Train is a workflow for taking a feature branch or parent PR through rigorous pre-merge audit, optional child slicing, remediation, signed-off child integration, rolling parent checkpoints, and final parent manual-review readiness.

Use it when a parent branch is too large for ordinary review or when multiple child PRs must be integrated without losing global coherence.

## Flow

1. Detect the current state: no PR, parent-only PR, existing children, partial train, or final-ready candidate.
2. If no parent PR exists, prepare or open one from the current feature branch to `main`/`master`.
3. If child PRs do not exist and the parent is too large or mixed for reliable review, create semantic child PRs around coherent slices.
4. Prepare durable state and ledgers.
5. For each child PR or child slice, dispatch audit/remediation, fix findings, and re-audit with a fresh verifier.
6. Post child completion comment.
7. Merge or close child into parent according to repo policy.
8. Update parent PR body, parent integration ledger, risk register, and state.
9. Run parent integration checkpoints after configured triggers.
10. When all children are merged or explicitly deferred, run final parent closeout.
11. Write the final manual-review packet.

## Shared Dependencies

- `../../shared/orchestration/continuous-mode.md`
- `../../shared/orchestration/hard-block-conditions.md`
- `../../shared/orchestration/heartbeat-protocol.md`
- `../../shared/orchestration/state-files.md`
- `../../shared/orchestration/autonomy-envelope.md`
- `../../shared/orchestration/course-correction-protocol.md`
- `../../shared/review/reviewer-protocol.md`
- `../../shared/review/reviewer-personas.md`
- `../../shared/review/verdict-schema.md`
- `../../shared/verification/acceptance-predicates.md`
- `../../shared/verification/predicate-adequacy-review.md`
- `../../shared/verification/test-adequacy-review.md`
- `docs/STRICT_REVIEW_BAR.md`

## Durable State Pack

Create these files in the target delivery workspace:

- `MERGE_TRAIN_STATE.json`
- `PARENT_INTEGRATION_LEDGER.md`
- `PARENT_RISK_REGISTER.md`
- `CHILD_SUMMARIES/`
- `CHECKPOINTS/`
- `CONTINUOUS_DIRECTIVE.md`
- `EXECPLAN.md`
- `HEARTBEAT.md`

The public skill is `skills/merge-train`. Templates are in `templates/` and shared templates are in `../../shared/templates/`.

## Child PR Loop

For each child PR:

1. Audit against the child diff, branch state, and parent intent.
2. Apply the strict review bar for structural simplification, file-size growth, branching complexity, ownership boundaries, and maintainability regressions.
3. Remediate blocking findings.
4. Re-audit until a fresh verifier reports no blocking issues.
5. Post the completion comment.
6. Merge into the parent branch according to repo policy.
7. Classify integration risk and update the ledger.

## Parent Checkpoints

Parent checkpoints run:

- after every N child merges, default 3,
- after every wave,
- after any high-risk child,
- when shared abstractions are touched,
- when auth, security, database/schema, migrations, public APIs, background jobs, tests/config, or architecture boundaries are touched.

Checkpoint reviewers focus on global coherence, duplicated abstractions, error-handling drift, public contract drift, inconsistent solutions to the same concept, schema/API/auth/security integration, composition-driven test gaps, files touched by multiple children, and accumulated residual risk.

They also apply the strict review bar across the integrated parent branch, especially when child merges introduce large-file sprawl, scattered feature checks, abstraction drift, type-boundary churn, or repeated implementations of the same concept.

## Done Criteria

The parent is not done until:

- child PRs are closed/merged or explicitly deferred,
- parent integration ledger is current,
- residual risks are remediated or explicitly accepted,
- final parent reviewers report no blocking findings,
- deterministic checks, tests, and predicate rollup pass,
- final manual-review packet is written.

## Config

```powershell
npm run validate:config -- workflows\merge-train\merge-train.config.example.json
npm run prompt:kickoff -- workflows\merge-train\merge-train.config.example.json
```
