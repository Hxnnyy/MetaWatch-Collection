# Mocking Boundaries

Mock system boundaries:

- external APIs;
- email, payment, and messaging providers;
- time and randomness;
- filesystem or network access where a real dependency would make the test slow or nondeterministic;
- databases only when a real isolated test database is impractical.

Keep internal modules real. Mocking internal collaborators couples tests to structure and makes refactoring expensive.

Pass boundary dependencies through explicit interfaces:

```ts
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}
```

Prefer operation-specific boundary interfaces over one generic conditional fetcher:

```ts
const crm = {
  getPerson: (id) => request(`/people/${id}`),
  addNote: (personId, note) => request(`/people/${personId}/notes`, {
    method: "POST",
    body: note,
  }),
};
```

Each operation then has one input and output contract, and its test double needs no routing logic.
