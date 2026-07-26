---
name: council
description: Run a two-stage LLM council convergence loop with model-level and persona-level audits, using a lab-independent chair, per-PRD persona routing, and bounded convergence rules.
---

# Council (MetaWatch Longflow)

Use this skill after grilling and before write-a-prd.

Shared contract: ../_shared/council-protocol.md

## Hard Rules

1. Do not start Stage B until Stage A converges (or the cap fires with chair resolution).
2. Findings do not need to vanish — they need an explicit disposition.
3. Severity downgrades between cycles require chair sign-off with logged rationale.
4. Split decisions are resolved by the chair (not a voting member) with logged rationale.
5. Findings must be evidence-backed and severity-scored.
6. Each cycle must produce a minimal accepted edit set.
7. Each stage has a hard cycle cap; reaching the cap triggers chair force-disposition.

## Roles

- **Voting members** — `models.councilStageA` / `models.councilStageB`. Independent reviews.
- **Chair** — `models.councilChair` (default `frontier-oss`). Drawn from a lab not represented in the voting set. Owns tie-breaks, downgrade sign-off, and cap resolution. Does not vote.

## Stage A (Model-Level)

1. Freeze proposal and packet versions for the cycle.
2. Dispatch one general review per configured Stage A voting member.
3. Build conflict matrix and ballot table.
4. Apply per-finding disposition (`accept` / `reject` / `defer` / `accepted-as-residual-risk`).
5. Apply accepted edits to produce proposal vNext.
6. Repeat until convergence criteria pass or `convergence.stageAMaxCycles` hits.

## Stage B (Persona-Level)

1. Resolve persona set from `routing.personasByPrdType[prdType]`, defaulting to `default`.
2. Honor PRD-declared persona inclusions/exclusions; chair must sign off on exclusions.
3. For each configured Stage B voting member, dispatch only the selected personas.
4. Synthesize persona-model matrix.
5. Apply per-finding disposition.
6. Repeat until convergence criteria pass or `convergence.stageBMaxCycles` hits.

## Convergence Exit Criteria

A cycle exits as **converged** when all hold:

- Open Criticals = `convergence.openCriticalsAllowed` (default 0).
- Every High and Medium has an explicit disposition.
- New ≥Medium findings introduced this cycle ≤ `convergence.maxNewMediumOrAboveFindingsPerCycleToExit` (default 2).

## Severity Stability

Track each finding's severity across cycles. Any downgrade requires chair sign-off and logged rationale. The orchestrator must surface a downgrade log each cycle (empty if none).

## Cycle Cap Behavior

If a stage hits its cap without natural convergence, the chair executes `convergence.atCapAction` (default `chair-force-disposition-and-escalate`):

1. Chair force-dispositions remaining open findings.
2. Items the chair cannot confidently resolve are flagged `escalate` and surfaced to the user.
3. Convergence status for the stage is recorded as `cap-reached-chair-resolved`.

If caps fire routinely, the proposal is too unstable for council — return to grilling.

## Tie-Break Protocol

When voting members split without hard contradiction:

1. Chair chooses a tie-break.
2. Log rationale in ballot table with `chair-tiebreak: true`.
3. Mark choice as `accept` and version it.

## Dispatch Quality Directive

Include this in each reviewer dispatch:

Reasoning mode request: high deliberation. Stress-test your own conclusions. Attempt to falsify your preferred fix before finalizing. Prefer fewer stronger findings over many weak ones.

## Required Artifacts Per Cycle

- findings table (with severity-history column)
- conflict matrix
- ballot table with dispositions
- severity-downgrade log
- vNext delta list
- residual-risk list (every `accepted-as-residual-risk`)
- convergence status: `converged` | `not-converged` | `cap-reached-chair-resolved`

## Exit Condition

Council exits when both Stage A and Stage B have a convergence status of `converged` or `cap-reached-chair-resolved` with no `escalate` items still open against the user.

## Handoff

Next skill: write-a-prd
