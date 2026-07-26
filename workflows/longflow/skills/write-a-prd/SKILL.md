---
name: write-a-prd
description: Use to write a PRD or plan a feature through interview, codebase exploration, module mapping, and verifiable definition of done.
---

# Write a PRD (MetaWatch Longflow)

Author a parent PRD that downstream skills (`prd-to-issues`, `issues-execution`) can convert into independently-grabbable child issues with mechanically verifiable acceptance criteria.

## Hard rules

1. **Verifiable hints in user stories.** Every user story includes a one-sentence description of how completion is observed in the running system. This feeds predicate authorship in `prd-to-issues`.
2. **Module Map and Parallelism Analysis are mandatory.** Wave planning depends on them.
3. **Definition of Done is a flat list of mechanically verifiable predicates.** When all pass, the PRD is delivered. This list becomes the spine of the final-closeout audit. If you cannot write a predicate hint for a criterion, the criterion is underspecified — sharpen it before submitting.
4. **Out-of-scope items are mechanically distinguishable from in-scope.** An audit-time grep or test could classify any candidate behaviour as in-scope or out-of-scope.
5. **No file paths or code snippets in the PRD.** They go stale.

## Process

### 1. Elicit

Ask the user for a long, detailed description of the problem and any solution ideas they already have.

### 2. Verify

Explore the repo to confirm their assertions and understand current state. Inspect `AGENTS.md`, `CLAUDE.md`, `README*`, `docs/`, package scripts.

### 3. Interview

Walk down each branch of the design tree. Resolve dependencies between decisions before moving on. Do not proceed until you can write a defensible Module Map.

The `grilling` skill is a good companion if the user wants their assumptions stress-tested.

### 4. Module Map

Identify deep modules — modules that encapsulate substantial functionality behind a simple, testable interface that rarely changes. For each:

- Responsibility (one sentence)
- Public interface (high level)
- Test boundary (what's tested in isolation)
- Independently deliverable (yes/no)
- File-set hint

Confirm with the user that the modules match expectations.

### 5. Parallelism Analysis

For each pair of modules, classify as Independent / Sequential / Conflicting. This drives wave planning in `prd-to-issues`. If two modules must touch the same file, say so explicitly — that's a sequencing constraint downstream.

### 6. Definition of Done

Write a flat list of mechanically verifiable predicates. Each entry is a one-line statement that maps to an executable check (test, grep, file-exists, type-check, custom script, endpoint probe).

Examples:

- All new endpoints reject unauthenticated requests with 401 (verified by integration test).
- No `console.log` in production code paths (verified by grep-zero).
- Migration applies cleanly on a fresh database (verified by CI script).
- E2E login flow passes on mobile and desktop viewports.

If you cannot write a predicate hint for a criterion, the criterion is underspecified. Sharpen it before continuing.

### 7. Submit

Write the PRD as a GitHub issue using `../_shared/templates/prd.md`. Do not close the issue.

## Handoff to `prd-to-issues`

The PRD is consumed by `prd-to-issues`, which:

- Slices into vertical-bullet child issues.
- Authors `scripts/verify-issue-<n>.sh` for each child by decomposing your Definition of Done.
- Builds the wave plan from your Parallelism Analysis.
- Records Delivery Governance on the parent issue.

If your Definition of Done is weak, the child predicates will be weak, and child closure becomes orchestrator judgment under context pressure. Make the DoD strong here — it pays compound interest downstream.

## See also

- `../_shared/acceptance-predicates.md` — what counts as a mechanically verifiable predicate.
- `../_shared/templates/prd.md` — canonical template.
- `prd-to-issues` — the next skill in the pipeline.
