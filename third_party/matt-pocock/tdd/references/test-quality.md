# Test Quality

## Good tests

A good test:

- exercises behavior through a public interface;
- describes what a caller or user can do;
- survives internal refactoring;
- uses an independent expected result;
- fails when the behavior is removed or broken.

```ts
test("a valid cart can be checked out", async () => {
  const cart = createCart([{ sku: "book", price: 10 }]);
  const order = await checkout(cart, validPaymentMethod);

  expect(order.status).toBe("confirmed");
});
```

## Implementation-coupled tests

Avoid assertions about private methods, internal call order, or internal collaborator counts when the public result is observable.

```ts
// Coupled to how checkout happens.
expect(paymentService.process).toHaveBeenCalledTimes(1);

// Coupled to what checkout promises.
expect(order.status).toBe("confirmed");
```

## Tautological tests

The expected value must not recompute the result using the same algorithm:

```ts
// Weak: expected repeats the implementation.
const expected = items.reduce((sum, item) => sum + item.price, 0);
expect(calculateTotal(items)).toBe(expected);

// Strong: known worked example.
expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
```

## Sensitivity check

When practical, temporarily revert or perturb the production behavior and confirm the test fails. A test that remains green when the behavior disappears is not a regression guard.
