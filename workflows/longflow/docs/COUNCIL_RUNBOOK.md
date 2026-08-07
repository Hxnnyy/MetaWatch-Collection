# Council Runbook

Use this runbook with the council skill. Full protocol: `../../../shared/orchestration/council-protocol.md`.

## Purpose

One repeatable, adversarial, evidence-based plan review before implementation — a single time-boxed round with a lab-independent chair, a pragmatist seat, and spikes instead of debate for empirical questions.

## When

- T2: only when genuine plan-level disagreement exists. Architecture risk and broad multi-system scope may surface disagreement, but they are not independent triggers.
- T3: default before the PRD.
- T0–T1: never.

## Roles

- **Members** — `models.council`. Independent reviews, written blind to each other, each with an assigned lens. One member (strongest model, `routing.intentAuditor` alias by default) carries the pragmatist brief: the smallest implementation that can verify every promise.
- **Chair** — `models.councilChair` (default `frontier-google`), excluded from membership. Dispositions every finding in one pass; does not vote.

## The Round

1. Freeze the proposal version; distribute intent contract + proposal + packet. The packet holds promises/non-goals, product class, repository constraints, assumptions, decision questions, alternatives, and available evidence, but no member review.
2. Collect independent reviews; findings classified `objective` / `tradeoff` / `preference` / `empirical`.
3. Chair merges duplicates and dispositions everything: `accept` / `reject` / `defer` / `residual-risk` / `spike`.
4. Apply the accepted edit set; record the round (`_shared/templates/council-round.md`); write the three-sentence plain-English owner summary.

## Rules That Survive From the Convergence-Loop Era

- Severity downgrades require chair sign-off with logged rationale.
- The chair watches for ballot gaming (severity edits after seeing the room).
- Findings need dispositions, not disappearance.

## The Spike Rule

If two members disagree about whether something *works* — performance, feasibility, fit — that is not a cycle-2 debate; it is an experiment. Disposition `spike`, name the question and the owner, and let reality adjudicate. Spike answers may re-touch the PRD; that is cheaper than discovering them mid-execution.

## Second Round

T3 only, only when the edit set changed the proposal's shape, chair justification logged. Two rounds is the ceiling at any tier (`council.t3MaxRounds`).
