# Flow Steps

This file is the practical execution order for MetaWatch Longflow. Steps marked with a tier only run at that tier and above — calibration decides, and skipping below-tier steps needs no justification.

## Step 1: Intent and Calibration (always)

Goal: a frozen intent contract and an explicit decision about how much process this run deserves.

Skill: longflow-orchestrator (Phase 0), with `grilling` for the stress test.
Outputs: `tasks/INTENT.md` (numbered promises, non-goals, product class, owner sign-off), a tier (T0–T3) with plain-English rationale, the riskiest assumption named, a rough budget.

**T0 exits here**: build the thing, no further Longflow.

## Step 2: Spike the Riskiest Assumption (when cheap)

Goal: answer the question that would invalidate the plan, before the plan is funded.

Output: the answer, recorded in the execplan; possibly better questions for the PRD interview.

## Step 3: Council (T2 on genuine disagreement; T3 default)

Goal: one time-boxed adversarial round over the proposal.

Skill: council
Rules: independent multi-lab reviews; one pragmatist seat on the strongest model arguing the smallest faithful implementation; lab-independent chair dispositions every finding in one pass; empirical disagreements become spikes. Second round only at T3 with chair justification.
Output: proposal vNext, spike queue, residual risks, plain-English owner summary.

## Step 4: Write Parent PRD (T2+)

Goal: a PRD subordinate to the intent contract.

Skill: write-a-prd
Outputs: promise trace, module map, parallelism analysis, frozen promise-level acceptance, subtraction-pass record (cuts + later-maybe list).

## Step 5: Slice into Ledger Items (T1+; informal at T1)

Goal: parallel-safe vertical slices, each citing its promise, classed and sized.

Skill: prd-to-issues
Outputs: `tasks/ledger/*.json` with rigour classes, S/M/L sizes, and proportionate checks; delivery governance; **blocking coverage audit** — every promise funded, every item cites a promise.

## Step 6: Execute in Continuous Mode

Goal: make promises true with minimal interruption.

Skill: issues-execution
Rules: delegate by default; bound and reap the agent pool; rigour follows the item; watch tripwires and dispatch intent audits when they fire; suppress non-hard-block check-ins.

## Step 7: Promise Gates (as they come due)

Goal: judge each promise when its items complete — not per wave.

Composition: walkthrough (all tiers) → intent audit (T2+) → risk-routed reviewer panel over production items (T2+), alias-resolved from `routing.promiseGateReviewers`. Hard budget: 3 review cycles per gate.

## Step 8: Final Closeout

Goal: evidence-based closure of the whole run.

Requirements: end-to-end walkthrough of the full journey; final intent audit `aligned`; each final persona once, round-robin across `routing.finalCloseoutModels`, no-blocking; `PASS_WITH_NOTES` not accepted.

## Step 9: Handover and Retro

Goal: plain-English handover and a smarter next run.

Outputs: which promises are true (walkthrough quotes), cost against budget, flagged follow-ups with product rationale; retro entry appended to `RUNS.md`.
