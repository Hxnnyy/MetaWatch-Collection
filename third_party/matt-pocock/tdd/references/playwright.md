# Playwright Checklist

## Selectors

1. `getByRole` with an accessible name
2. `getByLabel` for form controls
3. Stable visible text or placeholder when semantically appropriate
4. `getByTestId` only when no stable semantic selector exists

## Synchronization

- Wait through `expect(...)` assertions on visible state.
- Avoid `waitForTimeout`.
- Use deterministic fixtures and seeded data.
- Mock external providers, not the application path under test.

## Responsive behavior

For meaningful UI changes, verify desktop and the smallest supported mobile viewport:

- no horizontal overflow;
- tap targets remain usable;
- sticky actions and safe areas work;
- modals and sheets fit the viewport;
- the software keyboard does not obscure required inputs;
- hover behavior has a tap or keyboard equivalent.

## Motion

- Confirm the end state and any critical intermediate affordance.
- Test reduced-motion behavior for motion-heavy interfaces.
- Avoid timing-sensitive assertions when an observable settled state exists.
