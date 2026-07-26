# Flow Steps

This file is the practical execution order for MetaWatch Longflow.

## Step 1: Grill

Goal: convert raw intent into a proposal with explicit decisions and explicit unresolved risks.

Skill: grilling
Output: proposal draft + decision tree summary + open-risk register.

## Step 2: Human Alignment Check

Goal: ensure proposal matches user intent before council work.

Action:

- User reads proposal.
- Fix mismatches.
- Confirm readiness for council.

## Step 3: Council Stage A (Model-Level)

Goal: produce a converged plan via independent voting members and a lab-independent chair.

Skill: council
Convergence: every High/Medium has an explicit disposition (`accept` / `reject` / `defer` / `accepted-as-residual-risk`); zero open Criticals; new ≥Medium findings per cycle ≤ threshold.
Bounds: hard cap from `convergence.stageAMaxCycles` (default 5); chair force-dispositions remaining items at cap.
Output: stage-a log + ballot + disposition table + severity-downgrade log + residual-risk list.

## Step 4: Council Stage B (Persona-Level)

Goal: per-PRD persona audit, with persona set routed by PRD type rather than always-all-five.

Skill: council
Persona selection: `routing.personasByPrdType[prdType]` (default = all five). PRD-declared exclusions require chair sign-off.
Convergence: same exit rules and cycle cap as Stage A (`convergence.stageBMaxCycles`).
Output: stage-b matrix + convergence confirmation + severity-downgrade log.

## Step 5: Write Parent PRD

Goal: produce an implementation-ready parent PRD with measurable definition of done.

Skill: write-a-prd
Output: parent PRD issue body content.

## Step 6: Slice PRD into Child Issues

Goal: produce parallel-safe implementation slices with deterministic acceptance predicates.

Skill: prd-to-issues
Outputs:

- Child issue bodies
- Wave plan
- Delivery governance section
- Predicate scripts for each child issue

## Step 7: Execute in Continuous Mode

Goal: implement all child issues to closure with minimal interruption.

Skill: issues-execution
Rules:

- Delegate implementation by default.
- Track every agent ID, reserve two pool slots, and default descendant delegation to zero.
- Consume and close returned agents before replacement dispatches; reconcile after compaction and at wave gates.
- Verify each issue with predicate scripts and relevant tests.
- Treat predicates as evidence floors, not quality ceilings.
- Apply predicate adequacy, test adequacy, and reviewer loops on blocking findings.
- Continue until hard block or completion.

## Step 8: Wave-Gate Reviews

Goal: validate each completed wave before closing its child issues.

Required wave reviewers (alias-resolved from `routing.waveGateReviewers`):

- `frontier-openai-fast`
- `frontier-anthropic-fast`
- `frontier-google`

## Step 9: Final Closeout Panel

Goal: evidence-based parent closure.

Requirement:

- For each final reviewer model, run all five personas.
- Parent closes only when all required persona-model audits are no-blocking.
- `PASS_WITH_NOTES` is not accepted at final closeout unless explicitly configured and accepted as residual risk.

## Step 10: Handover

Goal: freeze documentation, log follow-ups, and prepare safe handover.

Skill: longflow-orchestrator handover phase
