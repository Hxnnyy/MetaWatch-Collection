# MetaWatch Longflow

MetaWatch Longflow is the planned implementation workflow inside MetaWatch. It turns rough intent into audited delivery through grilling, council convergence, PRD authoring, issue slicing, deterministic evidence, implementation waves, wave gates, final closeout, and handover.

## Flow

1. Run global `grilling` to stress-test rough intent and produce a proposal.
2. Human alignment pass fixes intent mismatches before council review.
3. Run council Stage A across model aliases until unresolved Critical, High, and Medium disagreements are dispositioned.
4. Run council Stage B across persona routing until no unresolved Critical, High, or Medium disagreements remain.
5. Run `write-a-prd` on the converged plan.
6. Run `prd-to-issues` to produce child issues, wave plan, and predicates.
7. Run `issues-execution` in continuous mode.
8. Enforce wave-gate reviews after each wave.
9. Enforce final closeout across required models and personas.
10. Finish with explicit handover notes, residual risks, and follow-up ownership.

## Shared Dependencies

Longflow uses these shared primitives:

- `../../shared/orchestration/continuous-mode.md`
- `../../shared/orchestration/agent-lifecycle.md`
- `../../shared/orchestration/hard-block-conditions.md`
- `../../shared/orchestration/heartbeat-protocol.md`
- `../../shared/orchestration/state-files.md`
- `../../shared/orchestration/autonomy-envelope.md`
- `../../shared/orchestration/course-correction-protocol.md`
- `../../shared/review/reviewer-protocol.md`
- `../../shared/review/reviewer-personas.md`
- `../../shared/review/verdict-schema.md`
- `../../shared/verification/acceptance-predicates.md`
- `../../shared/verification/predicate-adequacy-review.md`
- `../../shared/verification/test-adequacy-review.md`

## Quality Philosophy

Deterministic predicates are evidence floors, not quality ceilings. A child issue cannot close without predicate/test evidence, but predicate pass alone is insufficient. Closure combines deterministic evidence with fresh reviewer judgment, predicate adequacy review, and test adequacy review.

## Autonomy Envelope

Longflow uses the shared green/amber/red autonomy envelope:

- Green decisions are local, reversible, and within scope; agents decide and continue.
- Amber decisions require independent verifier or chair concurrence.
- Red decisions are hard blocks requiring owner input.

Agents may raise `COURSE_CORRECTION_PROPOSAL` at any time. They may not silently change governance, weaken predicates, skip reviewers, or rewrite acceptance semantics.

## Continuity Rules

- State is updated after meaningful events.
- Every spawned agent is tracked; consumed threads are closed and two slots remain reserved for corrections and reviews.
- The continuous directive is re-read at batch boundaries.
- Non-hard-block check-ins are suppressed, logged, and execution continues.
- On resume, read directive, state, execplan tail, and heartbeat, then reconcile the tracked agent pool before acting.

## Config

Validate:

```powershell
npm run validate:config -- workflows\longflow\longflow.config.example.json
```

Generate kickoff prompt:

```powershell
npm run prompt:kickoff -- workflows\longflow\longflow.config.example.json
```

## Local Assets

- `docs/`: operator documentation and Longflow runbooks.
- `skills/`: Longflow skills. `longflow-orchestrator` is the broad entry point; phase skills remain directly invokable when needed.
- `examples/`: Longflow configs and prompt examples.
- `templates/`: optional workflow-local templates; shared canonical templates live in `../../shared/templates/`.
- `longflow.config.example.json`: workflow config example.
