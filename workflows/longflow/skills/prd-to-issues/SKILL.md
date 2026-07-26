---
name: prd-to-issues
description: Use to turn a PRD into independently grabbable GitHub issues with vertical slices, wave planning, and verifiable acceptance predicates.
---

# PRD to Issues (MetaWatch Longflow)

Convert a parent PRD into a set of vertical-slice child issues, each shipping with a deterministic acceptance predicate (`scripts/verify-issue-<n>.sh`) committed alongside.

## Hard rules

1. **Standards before slices.** Do not create child issues until repo delivery standards are discovered or bootstrapped. Parallel implementation without shared standards causes drift.
2. **Predicates before issues.** Every child issue ships with `scripts/verify-issue-<n>.sh`, committed at issue-creation time, not implementer time. The predicate is the AC contract; the implementer cannot rewrite it to fit what they shipped.
3. **Predicate authorship gate.** If you cannot make an AC deterministic, the AC is underspecified. Split, sharpen, or mark HITL — do not ship the issue with a hand-wave. Inability to write a predicate is a signal, not a workaround opportunity.
4. **Disjoint files within a parallel group.** If two issues in the same wave share a file, merge them or move one to the next wave.
5. **Continuous-mode is the downstream default.** Issues you create will be dispatched in continuous mode unless the user opts to interactive. Plan accordingly: every closure decision must be mechanical.

## Process

### 1. Locate the PRD

Fetch with `gh issue view <n> --comments` if not in context. The PRD is the source of truth for user intent, scope, and Definition of Done.

### 2. Explore repo context

Inspect before slicing:

- `AGENTS.md`, `CLAUDE.md`, `README*`
- `docs/Architecture.md`, `docs/Decisions.md`, `docs/Security.md`, ADRs, runbooks
- `docs/DeliveryStandards.md`, contributing docs, testing docs
- Package/test/build scripts
- Existing implementation patterns relevant to the PRD

Use local files and `gh` first. Do not rely on memory for repo-specific rules.

### 3. Discover or bootstrap delivery standards

Classify: `ESTABLISHED` | `PARTIAL` | `MISSING`.

If `PARTIAL` or `MISSING`, bootstrap a compact `docs/DeliveryStandards.md` covering:

- Architecture boundaries and dependency direction
- Coding conventions that materially affect maintainability
- Testing expectations and commands
- Security defaults and trust-boundary expectations
- UI/design conventions if UI is in scope
- Documentation update rules
- Cite-precedent-before-new-pattern rule

Commit standards before child issue creation. If the bootstrap is large or controversial, create a standards-bootstrap child issue and block all implementation slices on it.

### 4. Slice into tracer bullets

Each child issue is a vertical slice cutting through every required layer end-to-end. Prefer many thin slices over few thick ones. Slice for parallel dispatch on disjoint files.

Slice flags:

- `AFK`: implementable without human input.
- `HITL`: requires human interaction (architectural decision, design review).

Prefer `AFK` where possible; do not hide genuine decision points.

### 5. Author predicates

For each child, draft `scripts/verify-issue-<n>.sh` from `../_shared/templates/verify-issue.sh`. Each AC maps to a check of one of these types:

- `failing-test-turns-green` (preferred)
- `grep-zero`
- `file-exists` / `file-content`
- `type-compiles`
- `predicate-script` (custom)
- `diff-invariant`
- `endpoint-probe`

Full spec: `../_shared/acceptance-predicates.md`.

The predicate script is committed alongside the issue body — it is part of the contract. If you cannot make an AC deterministic with one of these types, the AC is underspecified. Fix the AC; do not ship a soft predicate.

### 6. Design delivery waves

- Wave N depends only on waves `< N`.
- Issues in the same parallel group have disjoint expected file sets.
- Issues sharing files go into a sequential tail or a later wave.
- Every wave gets a wave-gate audit plan.

### 7. Assign reviewers and risks

Reviewer roster, dispatch rules, and verdict schema: `../_shared/reviewer-protocol.md`.

Risk tags: `quality`, `security`, `design`, `performance`, `docs`.

Reviewer defaults:

- `implementation-quality-reviewer`: every wave + final.
- `documentation-reviewer`: every wave + final, unless explicitly justified.
- `security-reviewer`: required when `security` risk present.
- `product-design-reviewer`: required when `design` risk present.
- `performance-reviewer`: required when `performance` risk present.

`prd-to-issues` proposes the audit plan because this step has the clearest view of slice boundaries and delivery risks. The downstream `issues-execution` orchestrator enforces the plan and may add reviewers if actual diffs introduce new risk.

### 8. Quiz the user

Present the proposed breakdown before creating issues:

- Child issues with title, AFK/HITL, blocked-by, files touched, predicate sketch.
- Wave grouping with parallel/sequential model.
- Standards status and any bootstrap.
- Audit plan per wave + final closeout.

Iterate until the user approves.

### 9. Record Delivery Governance

Record on the parent PRD using `../_shared/templates/delivery-governance.md`. Set `Continuous-mode default` to active for downstream dispatch. Prefer editing the parent body; otherwise add a parent issue comment.

### 10. Create issues + commit predicates

For each child, in dependency order:

1. `gh issue create` with body from `../_shared/templates/child-issue.md`.
2. Write `scripts/verify-issue-<n>.sh` from `../_shared/templates/verify-issue.sh` with the issue's specific checks.
3. Commit the predicate script. One commit per issue is fine; or batch into a "predicate scaffolding" commit per wave with all that wave's predicates.

The implementation will turn the predicates green; the predicate is the contract. Do not close the parent PRD.

## Anti-patterns

Everything the hard rules state positively is omitted here. One mistake the rules don't already cover:

- Creating wave gates as separate admin issues. Wave gates are parent comments + `STATE.json` entries.

## See also

- `../_shared/acceptance-predicates.md`
- `../_shared/reviewer-protocol.md`
- `../_shared/continuous-mode.md`
- `../_shared/templates/`
- `issues-execution` — the next skill in the pipeline.
