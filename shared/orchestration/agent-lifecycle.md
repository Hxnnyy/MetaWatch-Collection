# Agent Lifecycle

Canonical concurrency and cleanup rules for delegated Longflow work. A returned agent is still an open thread until it is explicitly closed.

## Capacity budget

1. At run setup, read the harness's configured agent-thread limit when available; otherwise use `6`.
2. Reserve `2` slots for corrective work, reviewers, and harness bookkeeping.
3. The normal delegated-thread budget is `max(1, max_threads - 2)`. File ownership and dependency constraints may reduce it further.
4. Count every tracked thread whose status is not `closed` as occupying capacity. A `close_failed` thread still consumes a slot until the harness proves otherwise.
5. Never fill the advertised limit speculatively.

Record the resolved limit and every spawned thread in `STATE.json` under `agent_pool`.

## Delegation depth

Every implementation, corrective, and reviewer prompt defaults to:

> Delegation budget: 0. Do not spawn subagents.

Only the orchestrator may authorize a descendant, for a named subtask and with an explicit integer budget that fits inside the current pool. An authorized child must report descendant IDs, consume their results, and close them before returning.

## Dispatch gate

Before each dispatch batch, at the start of every wave, and after compaction, restart, or handoff:

1. Reconcile the current run's tracked agent IDs with harness status/listing tools when available.
2. Persist any newly returned result before doing anything that could lose it.
3. Close terminal agents whose results are consumed or no longer needed.
4. Mark interrupted or failed threads accurately.
5. Update `agent_pool.last_reconciled_at`.
6. Dispatch only when existing non-closed threads plus the planned batch fit inside the normal delegated-thread budget.

Do not close user-owned tasks or agents from another run.

## Return, reuse, and close

1. On return, update the registry entry to `returned` and persist a concise result in the execplan.
2. Verify the result immediately.
3. If verification reveals a tightly scoped correction and the same thread still has useful context, steer that agent once instead of spawning a replacement.
4. Otherwise mark `result_consumed: true` and close the thread before dispatching replacement or corrective work.
5. Reviewers close as soon as a valid verdict is stored. A malformed verdict may be corrected once in the same thread; then close it.
6. Corrective agents follow the same return-and-close path as implementers.

At a promise gate, no returned agent may remain open merely because its output has already been consumed.

## Capacity and close failures

- On an agent-limit error: reconcile and reap once, then retry the intended dispatch once.
- If the retry still fails: reduce concurrency and continue sequentially in the orchestrator or reuse an already-open relevant agent. Do not enter a spawn/fail loop.
- Bound close/stop calls by the harness tool timeout. After at most two close attempts, record `close_failed`, treat that slot as unavailable, and continue with the smaller effective pool.
- For an interrupted agent, attempt stop and close once each, then record the result. Do not repeatedly wait on or close the same broken thread.
- Agent-cap pressure does not create a new hard-block condition. After the bounded cleanup/retry, continue non-independent work in the orchestrator and reserve any recovered slot for required fresh review.

## Recovery and completion

After compaction or resume, reconcile the registry before trusting `next_action` or spawning anything.

Before closing a wave or the parent:

- every returned result is consumed;
- every terminal thread has had closure attempted;
- no tracked thread remains `running` unless it is intentionally needed for the next recorded action;
- any `close_failed` thread is documented and included when calculating remaining capacity.
