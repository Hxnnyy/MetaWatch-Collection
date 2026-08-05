# Start State Detection

Start by classifying the current delivery state. Do not assume the user is starting at the beginning.

## Evidence to Inspect

Use local and GitHub evidence:

- current branch and merge base,
- `git status`, `git branch`, `git log --oneline --decorate -20`,
- parent PR for current branch, if any,
- PR labels and comments containing `merge-train`,
- child PRs linked from parent body/comments,
- branches matching child conventions,
- `MERGE_TRAIN_STATE.json`,
- `PARENT_INTEGRATION_LEDGER.md`,
- `PARENT_RISK_REGISTER.md`,
- `CHILD_SUMMARIES/`,
- `CHECKPOINTS/`,
- current check runs and failing tests.

## Classification

- `NO_PARENT_PR`: feature branch has no parent PR. Prepare or open one against `main`/`master`.
- `PARENT_ONLY`: parent exists but no child PRs, no train state, and no ledger.
- `CHILDREN_EXIST`: parent and child PRs exist, but no durable state has been found.
- `PARTIAL_TRAIN`: durable state, ledgers, labels, or comments show work has started.
- `FINAL_READY_CANDIDATE`: children appear merged or deferred; run final closeout from scratch.

## Recovery Rule

When evidence conflicts, choose the earliest unsafe phase and rerun verification. Re-running audit is cheaper than merging stale assumptions.

## State Initialization

If no train files exist, copy templates into the delivery workspace:

- `MERGE_TRAIN_STATE.json`
- `PARENT_INTEGRATION_LEDGER.md`
- `PARENT_RISK_REGISTER.md`
- `CHILD_SUMMARIES/`
- `CHECKPOINTS/`
- `CONTINUOUS_DIRECTIVE.md`
- `EXECPLAN.md`

Update state before creating PRs, dispatching auditors, or integrating children.
