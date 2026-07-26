---
name: tdd
description: Use when adding features, fixing bugs, or refactoring behavior that needs durable automated coverage. Apply a red-green-refactor loop through public seams, choosing unit, integration, or Playwright tests according to the behavior being changed.
---

# Test-Driven Development

Drive behavior changes through a tight red → green → refactor loop. Tests are specifications at public seams, not recordings of internal structure.

## Establish the seam

Before writing a test:

1. Identify the observable behavior and its caller or user.
2. Identify the narrowest public seam that can prove it.
3. Choose the cheapest layer that exercises the real behavior.

Infer the seam from existing interfaces, tests, domain language, and architecture. Ask the user only when multiple seams would create materially different product or architectural commitments.

Use:

- **Unit tests** for pure logic, parsing, validation, calculation, and state transitions.
- **Integration tests** for route handlers, server actions, persistence, authorization, queues, and component boundaries.
- **Playwright** for critical user journeys, browser behavior, responsive interaction, and regressions visible only in the assembled UI.

## Run one vertical slice

1. **Red:** Write one test that fails for the intended reason. Run it and confirm the failure proves missing or broken behavior.
2. **Green:** Implement only enough production code to pass that test.
3. **Refactor:** Improve names, duplication, and structure while the test remains green.
4. Repeat with the next behavior learned from the previous cycle.

Keep each cycle vertical: one observable behavior, one failing test, one minimal implementation. Avoid writing a horizontal batch of imagined tests before touching production code.

For bug fixes, reproduce the bug at the nearest stable seam, see the regression test fail, then fix it and keep the test.

## Test quality

- Assert outcomes through public interfaces.
- Name tests in domain language and describe capability, not implementation.
- Use expected values from an independent source of truth: the spec, a worked example, or a known literal.
- Mock system boundaries, not internal collaborators. Read [references/mocking.md](references/mocking.md) when boundaries need substitution.
- Prefer deterministic fixtures and real test databases where practical.
- Keep snapshots for stable serialized contracts or intentional visual artifacts, not as a substitute for assertions.
- A meaningful behavior change ships with a test that would have failed before, or an explicit debt note explaining why the guardrail is deferred.

Read [references/test-quality.md](references/test-quality.md) when choosing assertions or reviewing test sensitivity.

## Browser tests

For Playwright:

- Prefer `getByRole` and `getByLabel`; use test IDs only when no stable semantic selector exists.
- Wait on observable state with assertions, not arbitrary sleeps.
- Give meaningful UI changes a smallest-supported mobile viewport check alongside desktop.
- Validate focus, keyboard interaction, modal/sheet behavior, overflow, and safe areas when relevant.
- Mock external services at their system boundary while keeping the browser-to-app path real.

Read [references/playwright.md](references/playwright.md) for the browser checklist.

## Completion criterion

The change is complete when:

- the new test failed for the intended reason before the fix;
- the relevant focused test passes after the change;
- nearby affected tests pass;
- the test remains sensitive to removing or reverting the behavior;
- refactoring has not widened the implementation beyond the proven slice.
