---
name: longflow-orchestrator
description: "End-to-end MetaWatch Longflow: rough intent through council convergence, PRD, issue slicing, orchestrated implementation, wave gates, closeout, and handover."
disable-model-invocation: true
---

# Longflow Orchestrator

Run the whole MetaWatch Longflow when the user wants a feature, plan, or rough intent converted into shipped, audited work.

## Hard rules

1. **Start with stress-tested intent.** If the user has not already run `grilling`, run an equivalent decision-tree stress test or explicitly ask to use `grilling` when assumptions are still soft.
2. **Centralize architecture decisions before implementation.** Resolve module boundaries, ownership, acceptance semantics, and risk posture before `issues-execution` begins. Do not leave implementers to invent architecture under stale delivery context.
3. **Council before PRD when risk is non-trivial.** Use `council` for broad, ambiguous, high-risk, or multi-system work. Small well-scoped work may go straight to `write-a-prd` if the decision tree is already settled.
4. **Predicates are authored before implementation.** `prd-to-issues` owns predicate scripts and file-ownership contracts. Implementers do not rewrite them.
5. **Continuous delivery is the default once execution starts.** After `issues-execution` begins, continue until parent closure or a finite hard block.
6. **Fresh reviewers verify from code.** Final approval requires fresh reviewers inspecting the codebase and evidence, not trusting implementation reports. Fresh eyes consume the gate's review-cycle budget (3 cycles per gate, hard — see `../_shared/reviewer-protocol.md`); they never reset it.
7. **Execution uses a bounded agent pool.** `issues-execution` owns thread tracking, reserves corrective capacity, defaults children to zero descendant delegation, and closes consumed agents per `../_shared/agent-lifecycle.md`.

## Flow

1. **Intent stress test**
   - Ingest the user's goal, constraints, and current plan.
   - Use `grilling` when invoked or when the plan needs adversarial questioning.
   - Produce resolved decisions, open risks, assumptions, and a proposal handoff.

2. **Council convergence**
   - Use `council` for plan-level disagreement, architecture risk, or broad scope.
   - Run Stage A model-level review and Stage B persona-level review until every Critical, High, and Medium finding is dispositioned or explicitly escalated.
   - Record chair decisions, residual risks, and accepted edits.

3. **Parent PRD**
   - Use `write-a-prd`.
   - Require module map, parallelism analysis, scope boundaries, and a mechanically verifiable Definition of Done.
   - Avoid file paths and implementation snippets in the PRD.

4. **Issue slicing**
   - Use `prd-to-issues`.
   - Create vertical child issues, deterministic predicates, file-ownership contracts, wave plan, and Delivery Governance.
   - Resolve or escalate any acceptance criterion that cannot be made deterministic.

5. **Execution**
   - Use `issues-execution`.
   - Run in continuous mode unless the user explicitly asks for interactive mode.
   - Treat agent reconciliation and closure as delivery gates, including after compaction or resume.
   - Verify each child with predicates, tests, diff inspection, commits, wave-gate reviewers, and final parent closeout.

6. **Handover**
   - Ensure parent and child issues, docs, final reviewer verdicts, predicate rollup, and follow-up issues are current.
   - Report once when the parent is closed or a hard block fires.

## Decision policy

- **Green**: local reversible choices, extra tests, small in-scope refactors, reviewer reruns, and risk-register updates.
- **Amber**: predicate changes, issue reslicing, public-interface changes, reviewer requirement changes, or accepted residual risk. Record a course-correction proposal and get independent verifier/chair concurrence.
- **Red**: product ambiguity, missing required credentials, destructive irreversible action, data-loss/security tradeoff, irreconcilable reviewer contradiction, or state corruption. Hard block.

## See also

- `grilling` — pre-flow stress testing.
- `council` — plan convergence.
- `write-a-prd` — parent PRD authoring.
- `prd-to-issues` — child slicing and predicates.
- `issues-execution` — implementation orchestration.
- `../_shared/agent-lifecycle.md` — execution concurrency and cleanup contract.
- `merge-train` — pre-merge PR audit loop for existing feature branches.
