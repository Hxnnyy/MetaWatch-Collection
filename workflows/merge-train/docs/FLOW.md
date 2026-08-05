# Merge Train Flow

## Ingest

Collect:

- parent PR URL and branch,
- parent intent or PRD,
- child PR list,
- repo merge policy,
- protected branches and required checks,
- test and predicate commands.

If child PRs do not exist, create semantic child PRs. Prefer slices that can be audited independently and merged without repeatedly touching the same files.

## Prepare State

Copy templates into the delivery workspace and initialize:

- `MERGE_TRAIN_STATE.json`
- `PARENT_INTEGRATION_LEDGER.md`
- `PARENT_RISK_REGISTER.md`
- `CHILD_SUMMARIES/`
- `CHECKPOINTS/`
- `CONTINUOUS_DIRECTIVE.md`
- `EXECPLAN.md`

## Child Processing

Each child PR must pass:

- child audit,
- strict review bar checks for structural simplification and maintainability regressions,
- remediation for blocking findings,
- fresh verifier re-audit,
- deterministic checks,
- completion comment,
- merge into parent or explicit deferral.

## Parent Integration

After child merge, classify risk and decide whether a checkpoint is required. High-risk children always trigger a checkpoint.

Use `STRICT_REVIEW_BAR.md` during child audits, parent checkpoints, and final closeout. Treat structural regressions as blockers even when behavior appears correct.

## Final Parent Closeout

Run the final parent panel:

- architecture/coherence reviewer,
- runtime/integration reviewer,
- data/security reviewer,
- regression/test reviewer,
- product/UX reviewer.

Final closeout does not accept `PASS_WITH_NOTES` unless explicitly configured and accepted as residual risk.
