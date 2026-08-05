---
name: council
description: Run one time-boxed adversarial council round over a proposal — independent multi-lab reviews, a pragmatist seat arguing the smallest faithful implementation, a lab-independent chair, and spikes instead of debate for empirical disagreements.
---

# Council (MetaWatch Longflow)

Use after the intent contract exists and before `write-a-prd`, when there is genuine plan-level disagreement, architecture risk, or broad multi-system scope. A settled plan does not need a council. T0–T1: never.

Shared contract: `../_shared/council-protocol.md`

## Hard Rules

1. **One round is the default.** A second round requires T3, a shape-changing edit set, and logged chair justification. Two is the ceiling at any tier.
2. **Empirical disagreements become spikes, not debate.** If members disagree about whether something works, scales, or fits, the disposition is `spike` — question, experiment, owner. Arguing an answerable question into another cycle is a protocol violation.
3. **The pragmatist seat always sits.** One member — the strongest available model — is briefed to argue for the smallest implementation that keeps every promise true, with the same standing as every other seat.
4. Findings do not need to vanish — they need an explicit disposition (`accept` / `reject` / `defer` / `residual-risk` / `spike`).
5. Findings must be evidence-backed and severity-scored; severity downgrades between draft and disposition require chair sign-off with logged rationale.
6. The chair resolves splits and dispositions; it does not vote.
7. The round produces a minimal accepted edit set and a plain-English owner summary.

## Roles

- **Members** — `models.council` (config). Independent reviews; no member sees another's review before writing its own. Each carries a lens covering one of the plan's risk areas; one carries the pragmatist brief.
- **Chair** — `models.councilChair` (default `frontier-oss`), drawn from a lab not represented among members. Owns dispositions, tie-breaks, and downgrade sign-off.

## The round

1. Freeze the proposal version. Distribute the intent contract, proposal, and packet to every member.
2. Collect independent reviews: findings classified `objective` / `tradeoff` / `preference` / `empirical`.
3. Chair merges duplicates and dispositions every finding in one pass; empirical → spike queue.
4. Apply the accepted edit set → proposal vNext. Record the round with `../_shared/templates/council-round.md`.
5. Write the owner summary: what changed about the plan and why it matters to the product, three sentences, no jargon.

## Output

Proposal vNext, spike queue, residual-risk list, "later, maybe" list from deferrals, owner summary. Spikes queue before or alongside the earliest implementation they inform — their answers may re-touch the PRD, which is cheaper than discovering them mid-execution.

## See also

- `../_shared/council-protocol.md` — the full protocol.
- `../_shared/process-calibration.md` — when council runs at all.
- `write-a-prd` — the next skill in the pipeline.
