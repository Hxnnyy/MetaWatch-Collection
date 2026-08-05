---
name: prd-to-issues
description: Use to slice a PRD into local ledger items with promise citations, rigour classes, sizes, proportionate checks, and a blocking coverage audit before implementation is funded.
---

# PRD to Issues (MetaWatch Longflow)

Convert a parent PRD into a tree of vertical-slice **ledger items** (`../_shared/ledger.md`) — each citing the promise it serves, classed for rigour, sized, and carrying a check proportionate to what it is. GitHub issues are an optional projection, not the default.

Slicing is where the coverage audit lives: the cheapest possible moment to catch both failure modes — a promise nobody is building, and work nobody asked for.

## Hard rules

1. **Ledger first.** Items are files under `tasks/ledger/`, template `../_shared/templates/ledger-item.json`. Project to GitHub only when the owner asks, the team needs visibility, or governance requires it — and the ledger stays canonical.
2. **Every item cites a promise.** `promises` is mandatory and non-empty; enabling work cites the promise it unblocks. An item that serves no promise does not get created.
3. **The coverage audit is blocking, both directions** (T1+). Before implementation is funded, a fresh-context intent auditor verifies: every promise maps to items that would make it true, and every item cites a promise. A promise with no items is the hollow core forming on day one. See `../_shared/intent-audit.md`.
4. **Rigour class and size on every item.** `production-transferable` / `dogfood-disposable` / `spike`, and S/M/L. The class sets the gate (`../_shared/process-calibration.md`); the size gives drift detection its denominator. Classing a disposable fixture as production work is as much an error as the reverse.
5. **Checks are proportionate and authored here** (`../_shared/acceptance-predicates.md`). Production items get deterministic predicate scripts, committed at slicing time; disposable items get one honest check; spikes get a question. If you cannot make a production item's acceptance deterministic, the acceptance is underspecified — split, sharpen, or mark HITL. And run the proportionality check the other way: a check stronger than the item's class warrants seeds expensive workarounds downstream.
6. **Standards before slices.** Discover or bootstrap repo delivery standards (`ESTABLISHED` / `PARTIAL` / `MISSING` → compact `docs/DeliveryStandards.md`) before creating items. Parallel implementation without shared standards causes drift.
7. **Disjoint files within a parallel group.** If two items share a file, sequence them via `blockedBy`. Scheduling carries no gates — it is throughput only.
8. **Continuous mode is the downstream default.** Every closure decision must be mechanical or walkthrough-verifiable.

## Process

### 1. Ingest

Read `tasks/INTENT.md`, the PRD (promise trace, module map, parallelism analysis, promise-level acceptance, item-check hints), and repo context: `AGENTS.md`, `CLAUDE.md`, docs, ADRs, package/test/build scripts. Local files first; do not rely on memory for repo-specific rules.

### 2. Standards

Classify and bootstrap per hard rule 6. If the bootstrap is large or controversial, make it an item and block implementation slices on it.

### 3. Slice into tracer bullets

Each item is a vertical slice cutting through every required layer end-to-end. Prefer many thin slices over few thick ones. Slice for parallel dispatch on disjoint files. Flag `AFK` (implementable without human input) or `HITL` (requires a human decision) — prefer `AFK`, but do not hide genuine decision points.

### 4. Class, size, and check

For each item: promise citations, rigour class, S/M/L size, and its proportionate check. Production predicates use the types in `../_shared/acceptance-predicates.md` (failing-test-turns-green preferred) from `../_shared/templates/verify-issue.sh`, committed alongside the item.

### 5. Schedule

Derive parallel groups and `blockedBy` chains from the parallelism analysis and file sets. Map every item to the promise gates it feeds — the gate plan (walkthrough surface, risk-routed reviewers per `../_shared/reviewer-protocol.md`) is recorded per promise in Delivery Governance (`../_shared/templates/delivery-governance.md`).

### 6. Coverage audit

Dispatch the intent auditor with the intent contract and the full ledger roll-up. Blocking findings (unfunded promise, promiseless item, misclassed rigour) are fixed before anything else happens. This audit is one dispatch and pays for itself many times over.

### 7. Present

Show the owner (or record, in continuous mode): items with promise/class/size/check sketch, parallel structure, standards status, gate plan per promise, budget roll-up from sizes. Iterate until approved or recorded.

### 8. Commit

Write the ledger files, commit predicate scripts for production items, record Delivery Governance on the PRD. If projecting to GitHub, create issues from `../_shared/templates/child-issue.md` and record numbers back into the ledger.

## Anti-patterns

- Wave-gate ceremony of any kind — waves schedule, promises gate (`../_shared/promise-gates.md`).
- A predicate script on a `dogfood-disposable` item.
- Padding the tree with process items (audits, documentation sweeps) no promise funds — the coverage audit will bounce them.

## See also

- `../_shared/ledger.md`, `../_shared/intent-audit.md`, `../_shared/acceptance-predicates.md`
- `../_shared/process-calibration.md` — rigour classes and sizing.
- `issues-execution` — the next skill in the pipeline.
