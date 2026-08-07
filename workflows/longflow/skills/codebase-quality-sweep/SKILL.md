---
name: codebase-quality-sweep
description: Systematic codebase quality audit and triage that hands its fix tree to the standard Longflow pipeline.
disable-model-invocation: true
---

# Codebase Quality Sweep (MetaWatch Longflow)

Audit → triage → then the **standard pipeline** (`prd-to-issues`-style slicing, `issues-execution` delivery). This skill owns only what is distinctive about sweeping: the audit dimensions and the threshold triage. Everything downstream — ledger items, rigour classes, checks, gates, closeout — is the normal machinery, not a parallel implementation of it.

## Hard rules

1. **Phases 1–2 are interactive by default** — audit review and threshold pick are the owner's calls.
2. **A sweep gets an intent contract like any other run.** The promises are the target dimensions and thresholds the owner picks at triage ("type safety reaches 8/10"); the product class calibrates how hard to push. Write `tasks/INTENT.md` at the end of triage; tier is almost always T2.
3. **Delivery is the standard pipeline.** Slice per `prd-to-issues` (ledger items, promise citations, rigour classes, sizes, proportionate checks, coverage audit), execute per `issues-execution` in the mode selected by its canonical activation contract, with promise gates keyed to the dimension thresholds. Do not re-implement either loop here.
4. **Evidence over opinion**: every score requires file/line citations.
5. **Respect existing decisions**: read `decisions.md` / ADRs before proposing changes that contradict them.

## When to use

- "Audit this codebase" / "How production-ready is this?"
- "Find and fix all the quality issues." / "Harden this for production." / "Tech debt sweep."

## When NOT to use

- Single focused fix → direct implementation with `tdd`.
- Architecture redesign → `improve-codebase-architecture`.
- New feature work → the normal Longflow flow.

## Phase 1: AUDIT

**Goal**: score the codebase across 7 dimensions with evidence. Search first — one targeted query per concern; read top findings; score 1–10 with citations.

| # | Dimension | What to look for | Search patterns |
|---|---|---|---|
| 1 | **Type Safety** | Strict mode, `any` usage, runtime validation, discriminated unions, null handling | `as any`, `as unknown`, `: any`, `@ts-ignore`, `@ts-expect-error`, `safeParse`, `z.object` |
| 2 | **Error Handling** | Custom error types, boundary catches, sanitized responses, no swallowed errors | `catch`, `throw new Error`, `console.error`, `.error(`, error response shapes |
| 3 | **API Surface** | Input validation per endpoint, auth checks, rate limiting, CORS | `req.body`, `req.query`, `req.params`, `safeParse`, `authenticate`, `rateLimit` |
| 4 | **Testing** | Coverage breadth, assertion quality, fixture reuse, E2E flows, negative paths | `describe(`, `it(`, `test(`, `expect(`, `toThrow`, `rejects`, `beforeEach`, `.test.`, `.spec.` |
| 5 | **Observability** | Structured logging, request IDs, health endpoints, tracing, metrics | `logger`, `console.log`, `pino`, `winston`, `otel`, `trace`, `/health`, `/ready` |
| 6 | **Security** | RLS, auth boundaries, secret handling, CSP, dependency audit, CSRF | `service_role`, `anon`, `RLS`, `policy`, `helmet`, `csp`, `.env`, `secret` |
| 7 | **Modularity** | File size distribution, import depth, circular deps, separation of concerns | Files >500 lines, import chains >3 deep, barrel exports, `index.ts` sizes |

Keep working audit state in `session/quality-sweep-state.md`; present a summary table (dimension, score, top gap).

**Phase gate**: "Here's the audit. Want to proceed to triage?" — audit-only is a legitimate deliverable.

## Phase 2: TRIAGE

1. Present scores sorted lowest first.
2. Ask: "What's your minimum acceptable score? (default: 8/10)" — dimensions below threshold become targets.
3. For each target, list specific gaps with S/M/L effort estimates; ask which to fix.
4. Write `tasks/INTENT.md`: one promise per chosen dimension-threshold, non-goals from the dimensions deliberately left alone, product class from the owner.

**Phase gate**: Apply the canonical activation contract from `issues-execution`: an explicit continuous directive or persisted `mode: continuous` activates hands-off delivery; the latest explicit interactive override wins, and bare `go` never newly activates it. Ask: "Ready to slice and fix? Say `run continuously` for hands-off delivery." Audit + triage is a legitimate deliverable.

## Phase 3: DELIVER (the standard pipeline)

1. Slice the chosen gaps per `prd-to-issues` discipline: ledger items citing their dimension-promise, rigour classes (sweep fixes are almost always `production-transferable`; scaffolding for measurements is `dogfood-disposable`), sizes, proportionate checks, dependency-ordered batches with disjoint file sets, coverage audit.
2. Dispatch `issues-execution` on the tree. Its promise gates are the dimension thresholds: the gate's "walkthrough" for a sweep is the **differential re-audit** — re-run the dimension's Phase-1 search patterns fresh and score before/after with evidence.
3. Closeout comes from `issues-execution` at the calibrated tier: full test suite, predicate roll-up, end-to-end differential walkthrough, T2+ final intent audit and reviewers, plain-English report (dimensions improved and by how much, gaps left with explicit justification), retro to `RUNS.md`.

## Anti-patterns

- **Boiling the ocean**: respect the triage threshold; the intent auditor will bounce unfunded work.
- **Refactoring under the guise of quality**: this skill fixes quality gaps, not architecture — `improve-codebase-architecture` owns that.
- **Score inflation**: evidence-bound scores only, before and after.
- **Re-implementing the pipeline**: slicing discipline belongs to `prd-to-issues`, orchestration to `issues-execution`.

## See also

- `prd-to-issues`, `issues-execution` — the pipeline this skill feeds.
- `../_shared/intent-contract.md`, `../_shared/process-calibration.md`, `../_shared/acceptance-predicates.md`
