## Parent plan

<T1: short execplan reference. T2+: PRD path, ledger id, or #issue when projected to GitHub.>

## Promise

Serves promise <N> of the intent contract: <one-line restatement>. (`promises` field on the ledger item.)

## Rigour and size

- **rigor_class**: production-transferable | dogfood-disposable | spike
- **size**: T1: `null`; T2+: S | M | L

## What to build

End-to-end behaviour of this vertical slice. Reference the T1 intent/execplan or T2+ PRD; do not duplicate content.

## Acceptance

- [ ] Criterion 1
- [ ] Criterion 2

## Check

At T1, use one honest command, test, or walkthrough note for every item. Do not create predicate scripts.

At T2+, make the check proportionate to rigor_class (`_shared/process-calibration.md`):

- `production-transferable` → `scripts/verify-issue-<id>.sh`, authored at slicing time. Each criterion maps to a deterministic check (`_shared/acceptance-predicates.md`). Implementers receive the script as input and **must not modify it**; a needed change goes through the descope/course-correction channel, not a quiet edit.
- `dogfood-disposable` → one honest command or walkthrough note: <command>
- `spike` → the recorded answer to: <question>

## Files likely touched

The file-ownership contract for parallel dispatch. A subagent assigned this item may modify only these files unless the orchestrator explicitly expands scope.

- `path/to/file-a.ts`
- `path/to/file-b.ts`

## Delivery standards

- Source: `docs/DeliveryStandards.md` (or repo equivalent)
- Follow existing code style, test conventions, security defaults, doc rules.
- Do not introduce new patterns without citing precedent or recording the decision.

## Risk tags

quality | security | design | performance | docs

## Reviewers (at the promise gate)

Risk-routed per `_shared/reviewer-protocol.md`. Escalation triggers — add reviewers if actual diffs touch:

- Auth, authorization, user data, RLS, secrets, dependencies, trust boundaries → `security-reviewer`
- UI, UX, copy, accessibility, docs, runbooks → `product-reviewer`
- Hot paths, queries, deployment, config, runtime wiring → `operations-reviewer`

## Blocked by

- <ledger ids>, or "None — can start immediately"
