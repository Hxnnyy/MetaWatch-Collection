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

- `MERGE_TRAIN_STATE.json` (carries the continuous-mode `directive`; there is no separate directive file)
- `PARENT_INTEGRATION_LEDGER.md`
- `PARENT_RISK_REGISTER.md`
- `CHILD_SUMMARIES/`
- `CHECKPOINTS/`
- `EXECPLAN.md`

## Child Processing

Each child PR must pass:

- child audit,
- strict review bar checks — a finding blocks by naming its consequence,
- adjudication: every finding dispositioned (`fix-now | follow-up | residual-risk | rebutted`) before remediation is dispatched,
- remediation of `fix-now` findings,
- fresh verifier re-audit carrying the dispositions table,
- deterministic checks,
- completion comment,
- merge into parent or explicit deferral.

## Parent Integration

After child merge, classify risk and decide whether a checkpoint is required. High-risk children always trigger a checkpoint.

Use `STRICT_REVIEW_BAR.md` during child audits, parent checkpoints, and final closeout. A structural regression with a named consequence blocks even when behavior appears correct; a simplification preference without one is a `follow-up` in the packet, never in-train remediation.

## Final Parent Closeout

Run the final parent panel — the canonical shared roster plus the proportionality seat:

- implementation-reviewer,
- security-reviewer,
- product-reviewer,
- operations-reviewer,
- intent-auditor.

Final closeout accepts `PASS` or `NOT_APPLICABLE`. At the 3-cycle budget, a material finding holds the train for the owner; everything else closes as `closed_with_residuals`, recorded in the packet.
