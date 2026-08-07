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
- The 82-file diff looks larger than the conceptual change because canonical shared contracts are mirrored into generated skill bundles, but +901/-576 is still a meaningful maintenance cost. Further contract expansion now requires dogfood evidence, not speculative completeness.

### Decision and tripwires

- Close on the three successful current walks, 19/19 focused contract tests, 55/55 full tests, clean source/generated/installed parity, and clean live execution of all four mechanics.
- Treat real-task dogfooding risk R-001 as the honest remaining uncertainty. Reopen Promise 1 only for an observed behaviour-changing contradiction.
- Do not add PTC, provider adapters, mutation commands, new review roles, or more framework policy until repeated real tasks demonstrate a concrete friction that the existing agent judgement cannot handle.
- Future Fable checks use high reasoning, not max. One independent audit is enough unless it reports a concrete blocker.
