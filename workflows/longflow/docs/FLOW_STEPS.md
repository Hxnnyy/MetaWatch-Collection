# Flow Steps

This file is the practical execution order for MetaWatch Longflow. Steps marked with a tier only run at that tier and above — calibration decides, and skipping below-tier steps needs no justification.

## Step 1: Intent and Calibration (always)

Goal: a frozen intent contract and an explicit decision about how much process this run deserves.

Skill: longflow-orchestrator (Phase 0), with `grilling` for the stress test.
Outputs: intent captured in conversation, a tier (T0–T3) with plain-English rationale, the riskiest assumption named, and a rough budget. At T1+, persist `tasks/INTENT.md` with numbered promises, non-goals, and product class, and seek the owner's sign-off. Owner absent: T1–T2 may proceed as `drafted-unconfirmed`; T3 blocks until the owner signs the tier and intent.

**T0 exits here**: build the thing and run an honest final check in normal conversation; create no Longflow artifacts or durable state.

## Step 2: Spike the Riskiest Assumption (when cheap)

Goal: answer the question that would invalidate the plan, before the plan is funded.

Output: the answer, recorded in the execplan; possibly better questions for the PRD interview.

## Step 3: Council (T2 on genuine disagreement; T3 default)

Goal: one time-boxed adversarial round over the proposal.

Skill: council
Rules: at T2, architecture risk or broad scope may surface genuine plan-level disagreement but does not independently trigger council. Independent multi-lab reviews; one pragmatist seat on the strongest model arguing the smallest faithful implementation; lab-independent chair dispositions every finding in one pass; empirical disagreements become spikes. Second round only at T3 with chair justification.
Output: proposal vNext, spike queue, residual risks, plain-English owner summary.

## Step 4: Write Parent PRD (T2+)

Goal: a PRD subordinate to the intent contract.

Skill: write-a-prd
Outputs: promise trace, module map, parallelism analysis, frozen promise-level acceptance, subtraction-pass record (cuts + later-maybe list).

## Step 5: Slice into Ledger Items (T1+)

Goal: parallel-safe vertical slices, each citing its promise and classed for intended durability.

Skill: prd-to-issues
Inputs: `INTENT.md` plus the short execplan at T1; the PRD at T2+.
Outputs: `tasks/ledger/*.json` with rigour classes and proportionate checks; T1 uses `size: null` and one honest check per item, while T2+ uses S/M/L sizes and classed predicates. Delivery governance and a **blocking coverage audit** remain required — every promise funded, every item cites a promise.

## Step 6: Execute in Continuous Mode (T1+ when explicitly activated)

Goal: verify promises with minimal interruption.

Skill: issues-execution
Rules: continuous mode activates from an explicit directive or persisted `mode: continuous`; a latest explicit interactive override wins, and bare `go` never newly activates it. Delegate by default; bound and reap the agent pool; rigour follows the tier and item; watch tripwires and dispatch intent audits when they fire; suppress non-hard-block check-ins.

## Step 7: Promise Gates (T1+, as they come due)

Goal: a gate is eligible as soon as a credible runnable path may satisfy its promise and forced no later than completion of the last mapped item serving it — never per wave.

Composition: walkthrough (every durable tier) → intent audit (T2+) → risk-routed reviewer panel over production items (T2+), alias-resolved from `routing.promiseGateReviewers`. Hard budget: 3 review cycles per gate.

## Step 8: Final Closeout

Goal: evidence-based closure of the whole run.

Requirements: end-to-end walkthrough of the full journey at T1+. At T2+, add an `aligned` final intent audit and each final persona once in the initial cycle, round-robin across `routing.finalCloseoutModels`. Normal closure with no blocking findings accepts only `PASS` / `NOT_APPLICABLE`. The budget-exhausted exception is separate: after cycle 3, only non-material findings may close as `closed_with_residuals`; preserve raw blocking verdicts unchanged and record dispositions separately.

## Step 9: Handover and Retro

Goal: plain-English handover and a smarter next run.

Outputs: which promises are verified (walkthrough quotes), cost against budget, flagged follow-ups with product rationale; retro entry appended to `RUNS.md`.
