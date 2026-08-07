# Predicate Adequacy and Proportionality Review

Checks item-level predicates in **both directions**: strong enough to capture the spirit of the acceptance criteria, and no stronger than the item's rigour class and the product class warrant. An over-strict predicate is not a quality win — it is the seed of expensive workarounds.

## Adequacy questions (strong enough?)

- Does the predicate exercise the behavior that matters?
- Can the implementation satisfy the predicate while still failing the user outcome?
- Are negative paths, integration wiring, and public contracts represented?
- Did anyone weaken, delete, bypass, or overfit the predicate?
- Is the predicate running on the correct branch/environment?

## Proportionality questions (too strong?)

- Does the predicate's strictness match the item's `rigor_class`? A `dogfood-disposable` item with a predicate script at all is a finding.
- Does it demand properties the product class doesn't need (given the intent contract's product class — exhaustive edge-case coverage on a demo, perturbation proofs on a fixture)?
- Would satisfying it as written force work no promise funds?
- Is it measuring the product, or measuring compliance machinery built to satisfy it (tripwire 2, `../review/intent-audit.md`)?

## Handling

- **Inadequate at T1** (too weak): change the check or reslice the item, add one recorded line explaining why, and continue green. T1 checks are not frozen predicates and need no independent concurrence.
- **Inadequate T2+ production predicate** (too weak): blocking finding plus an amber `COURSE_CORRECTION_PROPOSAL`. Strengthening a `production-transferable` predicate at T2+ needs independent concurrence.
- **Disproportionate** (too strong): finding plus a `descope`-action proposal. At T1–T2 an intent-auditor verdict to weaken or drop the check is binding (`../review/intent-audit.md`).
- Either way, implementers never change checks unilaterally or silently — the channel is the proposal, not the edit.
