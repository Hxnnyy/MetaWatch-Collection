# Reviewer Personas

Workflows route reviewers by model and persona. The roster is deliberately small — four review lenses plus the intent auditor. Eight narrow personas were consolidated in 2026-08 after diminishing returns: more seats produced more findings, not more caught defects, and every seat multiplies dispatch cost at every gate.

- `implementation-reviewer`: correctness, maintainability, code structure, type boundaries, error handling, architecture coherence, duplicated abstractions, test coverage and integrity, missing negative paths, AI shortcut patterns. One fresh pair of eyes on the code as a whole.
- `security-reviewer`: auth, authorization, user data, secrets, RLS, policy boundaries, migration safety, dependencies, trust boundaries, abuse cases.
- `product-reviewer`: everything a human touches — user-facing behavior, UX coherence, accessibility, copy, responsive behaviour, product semantics, plus operator docs, runbooks, and doc drift.
- `operations-reviewer`: does it run, deploy, and scale — deployment, startup, background jobs, config, runtime wiring, latency, resource usage, caching, avoidable inefficiency.
- `intent-auditor`: not a code reviewer — audits the run against the intent contract: hollow promises, unfunded work, proportionality, drift. Always fresh-context, strongest available model. Contract: `intent-audit.md`.

Former personas map as: implementation-quality + architecture-coherence + regression-test → `implementation-reviewer`; product-design + documentation → `product-reviewer`; performance + runtime-integration → `operations-reviewer`; security unchanged.
