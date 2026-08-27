# Parent Integration Checkpoints

Parent checkpoints are rolling integration reviews. They are not full final re-reviews of every child PR.

## Focus

Checkpoint reviewers inspect:

- global coherence,
- duplicated abstractions,
- inconsistent error handling,
- public contract drift,
- child PRs solving the same concept differently,
- schema/API/auth/security integration,
- test coverage gaps introduced by composition,
- files touched by multiple child PRs,
- residual risks accumulating across children.

Checkpoint reviewers receive the ledger's finding-dispositions table; a `rebutted` finding returns only with new evidence.

## Strict Review Bar

Apply `STRICT_REVIEW_BAR.md` at every checkpoint. Pay special attention to complexity that only appears after multiple children are integrated:

- child PRs adding similar branches in different places,
- shared files growing past healthy boundaries,
- repeated feature flags or nullable modes,
- duplicated helpers or parallel abstractions,
- type contracts becoming looser to accommodate local fixes,
- partial-update flows that become brittle when composed.

## Triggers

Run a checkpoint:

- after every configured N child merges,
- after every child batch,
- after any high-risk child,
- when shared abstractions are touched,
- when auth, security, database/schema, migrations, public APIs, background jobs, tests/config, or architecture boundaries are touched.

When remediation across children has grown the parent diff rather than shrunk it, dispatch the intent auditor with the checkpoint — the review process itself is under inspection.
