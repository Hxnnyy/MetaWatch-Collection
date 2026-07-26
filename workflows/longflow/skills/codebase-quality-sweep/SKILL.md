---
name: codebase-quality-sweep
description: Systematic codebase quality audit, triage, issue-tree creation, and orchestrated hardening pass.
disable-model-invocation: true
---

# Codebase Quality Sweep (MetaWatch Longflow)

End-to-end: audit → triage → issues → fix (delegated to `issues-execution`) → re-audit.

## Hard rules

1. **Phases 1-3 are interactive by default.** They have explicit user gates: audit review, threshold pick, issue approval.
2. **Phases 4-5 are continuous by default.** Once the user kicks off Phase 4, run to completion per `../_shared/continuous-mode.md` and `issues-execution`.
3. **Every child issue created in Phase 3 ships with a predicate script** (`scripts/verify-issue-<n>.sh`). No predicate, no issue. Use `prd-to-issues`-style predicate authorship discipline.
4. **Phase 4 does not re-implement the orchestration loop.** It dispatches to `issues-execution` with the parent issue from Phase 3 and the child issues as the work tree.
5. **No commits or pushes** outside the orchestration loop, and no remote pushes without explicit user request.

## When to use

- "Audit this codebase" / "How production-ready is this?"
- "Find and fix all the quality issues."
- "Harden this for production."
- "Tech debt sweep."
- "Make this codebase pass a principal engineer review."

## When NOT to use

- Single focused fix → `progressive-tests` + direct implementation.
- Architecture redesign → `improve-codebase-architecture`.
- Initial repo onboarding → read local context first; use this skill only if the user wants a systematic quality audit or hardening pass.
- New feature work → `write-a-prd` → `prd-to-issues` → `issues-execution`.

## Operating notes

- **Search first** for all discovery. One targeted query per concern.
- **Evidence over opinion**: every score requires file/line citations.
- **Session state**: maintain `session/quality-sweep-state.md` through Phases 1-3. From Phase 4, state moves to `tasks/STATE.json` (per `../_shared/state-files.md`).
- **Respect existing decisions**: read `decisions.md` / ADRs before proposing changes that contradict them.

## Phase 1: AUDIT

**Goal**: score the codebase across 7 dimensions with evidence.

### The 7 dimensions

| # | Dimension | What to look for | Search patterns |
|---|---|---|---|
| 1 | **Type Safety** | Strict mode, `any` usage, runtime validation, discriminated unions, null handling | `as any`, `as unknown`, `: any`, `@ts-ignore`, `@ts-expect-error`, `safeParse`, `z.object` |
| 2 | **Error Handling** | Custom error types, boundary catches, sanitized responses, no swallowed errors | `catch`, `throw new Error`, `console.error`, `.error(`, error response shapes |
| 3 | **API Surface** | Input validation per endpoint, auth checks, rate limiting, CORS | `req.body`, `req.query`, `req.params`, `safeParse`, `authenticate`, `rateLimit` |
| 4 | **Testing** | Coverage breadth, assertion quality, fixture reuse, E2E flows, negative paths | `describe(`, `it(`, `test(`, `expect(`, `toThrow`, `rejects`, `beforeEach`, `.test.`, `.spec.` |
| 5 | **Observability** | Structured logging, request IDs, health endpoints, tracing, metrics | `logger`, `console.log`, `pino`, `winston`, `otel`, `trace`, `/health`, `/ready` |
| 6 | **Security** | RLS, auth boundaries, secret handling, CSP, dependency audit, CSRF | `service_role`, `anon`, `RLS`, `policy`, `helmet`, `csp`, `.env`, `secret` |
| 7 | **Modularity** | File size distribution, import depth, circular deps, separation of concerns | Files >500 lines, import chains >3 deep, barrel exports, `index.ts` sizes |

### Execution

1. Read project context: `AGENTS.md`, `CLAUDE.md`, `README*`, `docs/`.
2. Per dimension: run search patterns, read top findings, score 1–10 with evidence.
3. Produce the audit report in `session/quality-sweep-state.md`.
4. Present a summary table:

   | Dimension | Score | Top gap |
   |---|---|---|
   | Type Safety | 8/10 | 12 `as any` casts in adapters |
   | Error Handling | 6/10 | No custom error types |
   | ... | | |

### Phase gate

Ask: **"Here's the audit. Want to proceed to triage (Phase 2)?"**

User can stop here (audit-only deliverable).

## Phase 2: TRIAGE

**Goal**: user picks dimensions to address and a quality threshold.

1. Present scores sorted lowest first.
2. Ask: "What's your minimum acceptable score? (default: 8/10)"
3. Dimensions below threshold become targets.
4. For each target dimension, list specific gaps with effort estimates (S/M/L).
5. Ask: "Which to fix? All below threshold, or pick specific ones?"
6. Record decisions in `session/quality-sweep-state.md`.

### Phase gate

Ask: **"Ready to create GitHub issues for these N fixes?"**

User can stop here (audit + triage deliverable).

## Phase 3: ISSUES

**Goal**: GitHub issue tree with parent + batched children, each with a committed predicate.

### Prerequisites

- `gh` authenticated, OR user provides repo URL.
- Confirm repo and label conventions with the user.

### Execution

1. **Create the parent issue**:
   - Title: `Quality sweep: N issues across M dimensions`.
   - Body: audit summary table, dimension scores before/after targets, link list of child issues, Delivery Governance from `../_shared/templates/delivery-governance.md`.

2. **Order findings into batches** by dependency:
   - Batch 1: foundational (types, error taxonomy, shared utilities).
   - Batch 2: infrastructure (logging, observability, security middleware).
   - Batch 3: boundary fixes (API validation, auth, rate limiting).
   - Batch 4: coverage (tests, E2E, negative paths).
   - Batch 5+: dimension-specific tail.
   - Rule: no batch depends on a higher-numbered batch.

   **Parallel-safety constraint**: within each batch, slice issues so they touch non-overlapping file sets. Two issues sharing a file → merge into one or move one to the next batch.

3. **Author predicates** for every child issue. Apply the predicate-authorship discipline from `prd-to-issues`:
   - Each AC maps to one of the predicate types in `../_shared/acceptance-predicates.md`.
   - If you cannot make an AC deterministic, sharpen it before issue creation.
   - Each predicate goes in `scripts/verify-issue-<n>.sh` (template: `../_shared/templates/verify-issue.sh`).
   - Commit the predicate scripts before Phase 4 begins (one commit per script, or one batch-scaffold commit per wave).

4. **Create child issues** using `../_shared/templates/child-issue.md`:
   - Title: `[Sweep B<batch>] <concise description>`.
   - Body includes acceptance predicate section pointing to its `scripts/verify-issue-<n>.sh`.
   - Labels: `quality-sweep`, dimension name (`type-safety`, `observability`, etc.).
   - "Files touched" section is mandatory — it's the parallel-dispatch contract.

5. **Update parent issue** with full child list and batch DAG.

6. **Record issue map** in `session/quality-sweep-state.md`.

### Phase gate

Ask: **"Issues created. Ready to start fixing? Phase 4 runs continuously by default — say `interactive mode` if you want gating."**

User can stop here (audit + issues deliverable).

## Phase 4: FIX (delegates to issues-execution)

This phase **does not implement its own orchestration loop**. It hands off to `issues-execution`:

1. Confirm continuous mode (default) or honor `interactive mode` if user said it.
2. Dispatch `issues-execution` with: parent = quality-sweep parent issue, children = batched fix issues.
3. `issues-execution` writes `tasks/CONTINUOUS_DIRECTIVE.md`, `tasks/STATE.json`, the execplan, and runs to completion.
4. The Stop hook (`../_shared/hooks/continuous-stop-guard/`), if wired, prevents premature stops.

Phase 4 is complete when `issues-execution` closes the quality-sweep parent issue per its closure rules.

If any sweep child has been mis-scoped or its predicate is too weak, surface the issue back through `prd-to-issues`-style sharpening before continuing — do not muscle through with a soft predicate.

## Phase 5: VERIFY

After `issues-execution` closes the parent issue:

1. **Differential re-audit**: dispatch one subagent per targeted dimension to re-run Phase 1 search patterns. Each returns a score + evidence summary. Aggregate into a before/after table:

   | Dimension | Before | After | Delta |
   |---|---|---|---|
   | Type Safety | 6/10 | 9/10 | +3 |
   | Observability | 5/10 | 8/10 | +3 |

2. **Full test suite**: run the complete suite. Fix any failures introduced by the sweep.

3. **Full predicate roll-up**: every `scripts/verify-issue-*.sh` from this sweep should still exit 0. A regression that breaks a previously-green predicate is a `BLOCKED` finding to fix.

4. **Commit organization** (if user asks): group changes by functional area (not by batch number). Each commit independently reviewable and green.

5. **Close parent issue** if all child issues are addressed and scores meet the threshold.

### Deliverable

Final summary:

- Dimensions improved and by how much
- Total issues addressed
- Test count before/after
- Remaining known gaps with explicit "not addressed" justification

## Anti-patterns

- **Boiling the ocean**: respect the triage threshold.
- **Refactoring under the guise of quality**: this skill fixes quality gaps, not architecture. Use `improve-codebase-architecture`.
- **Orphaned test fixes**: fix tests in the same batch — don't accumulate a backlog.
- **Implicit dependencies**: explicit DAG only.
- **Score inflation**: evidence-bound scores only.
- **Re-implementing the orchestration loop in Phase 4**: hand off to `issues-execution`. Do not duplicate the loop.
- **Soft predicates**: a predicate that "kind of" checks the AC is worse than no predicate — it provides false confidence.

## See also

- `../_shared/acceptance-predicates.md`
- `../_shared/continuous-mode.md`
- `../_shared/hard-block-conditions.md`
- `../_shared/reviewer-protocol.md`
- `prd-to-issues` — for predicate-authorship discipline.
- `issues-execution` — for Phase 4 orchestration.
