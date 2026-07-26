---
name: tdd
description: Add features, fix bugs, or refactor behaviour through durable red-green-refactor coverage at public seams.
---

# Test-driven development

Tests specify observable behaviour through stable public seams.

1. Identify the behaviour, caller, and narrowest seam that proves it.
2. Write one test and confirm it fails for the intended reason.
3. Implement only enough production code to pass.
4. Refactor while the test remains green.
5. Repeat for the next learned behaviour.

Use unit tests for pure logic, integration tests for system boundaries, and browser tests only for assembled user journeys. Mock external systems, not internal collaborators. Prefer deterministic fixtures, semantic browser selectors, observable waits, and assertions sourced independently from the implementation.

A change is complete when the new test failed before the fix, focused and nearby tests pass afterward, and reverting the behaviour makes the test fail again. If durable coverage is infeasible, record explicit test debt instead of silently omitting it.
