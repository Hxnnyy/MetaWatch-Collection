# Workflow Selection Examples

## Starting from Rough Intent

Use [MetaWatch Longflow](../workflows/longflow/README.md) when the first input is a goal, problem, or feature idea. Longflow creates the plan, PRD, child issues, predicates, implementation waves, and final closeout.

## Recovering a Large Parent PR

Use [MetaWatch Merge Train](../workflows/merge-train/README.md) when a branch or parent PR is already large enough that normal review is unreliable. Merge Train audits child PRs, remediates findings, merges signed-off children into the parent, and runs rolling parent integration checkpoints.

## Shared Runtime Files

Both workflows should create local copies of these shared templates in the target delivery workspace:

- `CONTINUOUS_DIRECTIVE.md`
- `STATE.json` or workflow-specific state file
- `EXECPLAN.md`
- `HEARTBEAT.md`
- `COURSE_CORRECTION_PROPOSAL.json` when a course correction is needed
