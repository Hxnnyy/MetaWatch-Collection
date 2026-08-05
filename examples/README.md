# Workflow Selection Examples

## Starting from Rough Intent

Use [MetaWatch Longflow](../workflows/longflow/README.md) when the first input is a goal, problem, or feature idea. Longflow captures the intent as a frozen contract, calibrates how much process the task deserves (T0 "just build it" through T3 "fortress"), then runs the right subset of council, PRD, ledger slicing, and continuous execution with promise-shaped gates.

## Recovering a Large Parent PR

Use [MetaWatch Merge Train](../workflows/merge-train/README.md) when a branch or parent PR is already large enough that normal review is unreliable. Merge Train audits child PRs, remediates findings, merges signed-off children into the parent, and runs rolling parent integration checkpoints.

## Shared Runtime Files

Both workflows should create local copies of these shared templates in the target delivery workspace:

- `INTENT.md` (Longflow — the intent contract)
- `STATE.json` or workflow-specific state file (carries the continuous directive)
- `EXECPLAN.md`
- `tasks/ledger/` items (Longflow, T2+)
- `COURSE_CORRECTION_PROPOSAL.json` when a course correction is needed
