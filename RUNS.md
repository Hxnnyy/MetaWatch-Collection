# Longflow run retrospectives

## 2026-08-07 — Longflow vNext phases 1–3

### Outcome

All three promises hold in the current working tree: Longflow has one coherent contract, durable evidence-relative recovery state, and four dependency-free read-only mechanics (`validate`, `coverage`, `stale-scan`, and `resume-context`). Programmatic tool calling remains deliberately parked until real-task dogfooding provides evidence that it is worth adding.

### What paid for itself

- Public-seam red/green tests found real behavioural gaps that prose review missed, especially malformed-state handling, fixed policy knobs, generated/installed parity, and direct-entrypoint drift.
- Cold walks across source, generated, portable, and installed surfaces exposed contradictions an agent would actually encounter.
- The Codex restart was a useful recovery test: durable state and the shared working tree were sufficient to resume without losing scope or judgement.

### What did not

- The review loop ran far past its useful point. Repeated fresh walkers kept discovering increasingly peripheral wording seams after the core promises already worked, creating 30+ agent records and substantial orchestration overhead.
- The final max-effort Fable audit produced no output after roughly eight minutes and was terminated. Waiting longer or restarting it would have repeated the same diminishing-return failure mode.
- The final merge candidate spans 96 files and +3,073/-576 lines. Roughly 40 files are generated skill mirrors and about 2,000 additions are the read-only core, CLI, and behavioural tests; the remaining canonical policy, prose, and tooling are still a meaningful maintenance cost. Further contract expansion now requires dogfood evidence, not speculative completeness.

### Decision and tripwires

- Close on the three successful current walks, 19/19 focused contract tests, 55/55 full tests, clean source/generated/installed parity, and clean live execution of all four mechanics.
- Treat real-task dogfooding risk R-001 as the honest remaining uncertainty. Reopen Promise 1 only for an observed behaviour-changing contradiction.
- Do not add PTC, provider adapters, mutation commands, new review roles, or more framework policy until repeated real tasks demonstrate a concrete friction that the existing agent judgement cannot handle.
- Future Fable checks use high reasoning, not max. One independent audit is enough unless it reports a concrete blocker.

## 2026-08-18 — Merge Train calibration rework

### Outcome

Merge Train adopted the pragmatic-Longflow mechanisms it had missed: an adjudication step between auditor and remediator (`fix-now | follow-up | residual-risk | rebutted`, only `fix-now` funds work), a consequence-gated strict review bar, a finding-dispositions table in the parent ledger that travels with every fresh reviewer, material/non-material settlement with `closed_with_residuals` at the 3-cycle cap, the intent auditor as a proportionality seat, the asymmetric breakglass on risk-class defaults, and a `RUNS.md` retro at handoff. Four families of stale pre-rework references fixed (directive file, five-seat panel, wave vocabulary, course-correction template). Full validation suite green; no new files, no new state artifacts.

### What paid for itself

Evidence before authorship: reading all five real run journals plus the campaign that motivated the work meant every mechanism adopted here traces to an observed failure ("flag aggressively" with no adjudication layer re-litigating declined findings), not a speculative one. The byte-identical mirror check made the sync strategy trivial to verify.

### What did not

Nothing material; the change stayed adoption-only. The one considered-and-dropped item — generalising the strict review bar's voice away from Merge Train — was cosmetic churn on a shared file.

### Decision and tripwires

Dogfood before extending: the next real merge-train run is the test of whether adjudication plus the dispositions table actually shortens loops. Reopen only on observed friction — a loop that still grows diffs after cycle 2, or a rebutted finding surviving into a later panel — not on speculative completeness.

## 2026-08-27 — PR #5 pstack adoption closeout

### Outcome

PR #5 was reconciled with the newer Merge Train calibration work and reached consequence-gated closeout. The merge preserves both adjudication/dispositions memory and the pstack evidence ladder. Material review findings were fixed: report-template parity, durable-but-backward-compatible Longflow closeout evidence, Codex-compatible skill instructions, bundle-contained installation, retained licence/provenance, authority-scoped untrusted evidence, and non-production verification boundaries. Full validation passed 62/62, and an isolated Windows export passed installed-tree validation.

### What paid for itself

- Fresh reviewers found contract breaks that the original 56-test suite missed; focused red/green tests now cover each shipped correction.
- The owner's consequence bar stopped the train expanding into formatting cleanup, exporter atomicity redesign, or speculative process work.
- Keeping legacy schema 4.0 readable while emitting 4.1 for new closeouts preserved historical truth instead of inventing retrospective audit claims.

### What did not

- The first review wave produced several low-value notes alongside material findings. Explicit adjudication was necessary; reviewer volume was not evidence of consequence.
- A first isolated-export command was rejected before execution because it combined setup with recursive cleanup. A unique scratch profile proved the same path without destructive cleanup.

### Decision and tripwires

Merge on the five-seat PASS, 62/62 tests, synchronized generated trees, clean diff checks, and `INSTALL VALID`. Retain the non-blocking exporter-interruption and generated-tree wording notes as follow-ups only if observed operational friction makes them consequential.
