# Autonomy Envelope

The autonomy envelope balances agent judgment against process governance. It is **tier-parameterised**: the run's ceremony tier (`process-calibration.md`) moves actions between bands. The table below is the T2 baseline; the tier shifts note how T1 and T3 differ.

**Standing default: err toward under-engineering.** Scoping a follow-up issue later is trivial; tokens and days spent on unnecessary machinery cannot be clawed back. When two defensible readings exist, take the smaller one and flag the difference in the handover.

## Green: Decide and Continue

Agents may decide and continue when the action is local, reversible, and within the current acceptance contract:

- run extra tests,
- add missing regression tests,
- make local refactors within scope,
- split internal subtasks,
- rerun impacted reviewers,
- update the ledger, risk registers, or budget tracking,
- continue after non-hard-block uncertainty,
- skip a tier-default mechanism below defaults with a recorded breakglass line (see `process-calibration.md`),
- act on a binding intent-audit descope verdict.

## Amber: Propose and Verify

Agents may propose the action, but need intent-auditor, independent verifier, or chair concurrence:

- change item-level acceptance checks on `production-transferable` items,
- alter public interfaces,
- change merge order,
- accept non-trivial residual risk,
- broaden remediation scope,
- reslice the ledger,
- merge despite structural `PASS_WITH_NOTES`,
- change reviewer requirements,
- **add ceremony above tier defaults** — extra gates, extra review rounds, stricter checks, new governance artifacts,
- change the run's tier (single intent-auditor review; a no is a no or escalates to the owner).

## Red: Hard Block

Agents must stop and request owner input when:

- product semantics are ambiguous **and material** (see tier shifts below),
- credentials or required environment access are unavailable,
- reviewer contradiction has no compatible fix,
- migration, data-loss, or security tradeoff requires owner approval,
- durable state is corrupt,
- irreversible destructive action is required.

## Tier shifts

- **T0–T1**: ambiguity and underspecified acceptance are *not* red — make the pragmatic, under-engineered choice, record it, flag it in the handover. Reslicing and check changes drop to green with a recorded line. Red remains red only for irreversible/destructive actions, credentials, and state corruption.
- **T3**: skipping any mechanism that guards auth, migration, data loss, or tenant isolation rises to amber even below tier defaults. Contested intent-audit verdicts go to cross-provider adjudication (`intent-audit.md`).

## Decision provenance

Every chair decision recorded in the execplan — defaults chosen, rulings made, corrections adopted — carries one line: **"serves promise #N because …"**, citing the intent contract. A decision that cannot name its promise is the earliest catchable form of drift: locally reasonable, globally backwards. Write the line before acting, not retrospectively.

## Governance Rule

Agents can choose tactics, challenge strategy, and propose course corrections. They cannot silently change governance in either direction — no skipped gates and weakened predicates, no added ceremony and inflated scope (see `course-correction-protocol.md`). Only the owner amends the intent contract. Success is declared on evidence, never on effort.
