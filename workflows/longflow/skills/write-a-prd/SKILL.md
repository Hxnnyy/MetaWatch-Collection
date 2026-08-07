---
name: write-a-prd
description: Use to write a PRD subordinate to an intent contract — interview, codebase exploration, module mapping, promise-level acceptance, and a subtraction pass that cuts everything no promise funds.
---

# Write a PRD (MetaWatch Longflow)

Author a parent PRD that elaborates `tasks/INTENT.md` without exceeding it, and that downstream skills (`prd-to-issues`, `issues-execution`) can convert into ledger items with proportionate checks.

The PRD is where scope creep is born: first drafts always overreach somewhere, and every uncut requirement becomes funded work downstream. This skill's distinctive obligation is **subtraction**.

## Hard rules

1. **The intent contract comes first.** If `tasks/INTENT.md` does not exist, return to orchestrator calibration (`../_shared/intent-contract.md`) before writing a line of PRD; this skill does not invent the contract. The PRD is subordinate to it; where they disagree, the intent contract wins.
2. **Every requirement cites the promise it serves.** The promise-trace table shows the reverse: every promise funded by requirements. A promise with no requirements is a hollow core forming — fix it here, where it costs nothing.
3. **The subtraction pass is mandatory.** After drafting, cut every requirement that cites no promise, and demote real-but-unfunded ideas to "later, maybe". Contested cuts are adjudicated by a fresh-context intent auditor, not by the author. An empty cut list on a PRD of any size is a smell.
4. **Promise-level acceptance is authored here and frozen.** One entry per promise: how the running product will show the promise is true. Owner-amendable only, verified by walkthrough at gates — this is the frozen tier of `../_shared/acceptance-predicates.md`.
5. **Name the riskiest assumption and spike it** if calibration hasn't already. A PRD built on an unanswered empirical question is a bet, not a plan — and spikes at PRD time exist as much to surface better questions as to answer the first one.
6. **Module Map and Parallelism Analysis are mandatory** (T2+). Scheduling depends on them.
7. **No file paths or code snippets in the PRD.** They go stale. (File-set *hints* in the Module Map are fine.)
8. **Verifiable hints in user stories.** Every story includes a one-sentence description of how completion is observed in the running system, tagged with its promise number.
9. **Owner absence is tiered.** With the owner absent at T2, use the existing `drafted-unconfirmed` intent and durable judgement, make the smallest defensible decisions, mark acceptance visibly provisional, and proceed without broadening scope. With the owner absent at T3, block; do not draft a PRD around unsigned intent.

## Process

### 1. Ingest intent

Read `tasks/INTENT.md`. The promises are your spine; the non-goals are your fence; the product class calibrates everything downstream.

### 2. Verify

Explore the repo to confirm the owner's assertions and understand current state. Inspect `AGENTS.md`, `CLAUDE.md`, `README*`, `docs/`, package scripts.

### 3. Interview

When the owner is available, walk down each branch of the design tree with them and resolve dependencies between decisions. The `grilling` skill is the right companion when assumptions need stress-testing. When the owner is absent at T2, adopt the durable decisions and assumptions already in `STATE.json`, choose the smallest option consistent with the provisional intent, and record any new assumption instead of expanding scope. In either case, do not proceed until you can write a defensible Module Map.

### 4. Draft

Use `../_shared/templates/prd.md`: problem, solution, promise trace, user stories with hints, implementation decisions, module map (hunt for deep modules), parallelism analysis, promise-level acceptance, item-check hints.

### 5. Subtract

Walk every requirement against the promise list. Cut the unfunded; demote the "real but not now" to later-maybe; record both lists in the PRD. If you and the owner disagree on a cut, dispatch a fresh-context intent auditor with the intent contract and both positions — its call stands at T1–T2.

### 6. Submit

Record the PRD (local file or ledger reference by default; a GitHub issue when the team needs visibility — `../_shared/ledger.md`). When the owner is available, confirm the promise-level acceptance wording with them: they are signing the frozen contract. When the owner is absent at T2, keep that acceptance operationally frozen for agents but visibly provisional under `drafted-unconfirmed`, then proceed; only the owner can confirm it later. Owner absence at T3 remains a block.

## Handoff to `prd-to-issues`

`prd-to-issues` slices the PRD into ledger items, assigns rigour classes and sizes, authors proportionate checks, and runs the coverage audit. If your promise-level acceptance is vague, walkthroughs can't verify it; if your promise trace is padded, the coverage audit will bounce it back. Sharpen here — it pays compound interest downstream.

## See also

- `../_shared/intent-contract.md` — what you are elaborating.
- `../_shared/acceptance-predicates.md` — the two acceptance tiers.
- `../_shared/templates/prd.md` — the template.
- `prd-to-issues` — the next skill in the pipeline.
