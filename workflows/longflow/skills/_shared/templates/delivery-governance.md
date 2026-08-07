## Delivery Governance

### Intent and tier

- **Intent contract**: `tasks/INTENT.md` (status: drafted-unconfirmed | owner-confirmed)
- **Tier**: T1 | T2 | T3 — rationale: <one line>
- **Riskiest assumption**: <what, and the spike that answered it — or why none was needed>

### Repo standards

- **Status**: ESTABLISHED | PARTIAL | MISSING
- **Source**: `docs/DeliveryStandards.md` (or repo equivalent)
- **Bootstrap commit**: <sha or n/a>

### Execution mode

- **Mode follows invocation and durable state.** An explicit continuous directive newly activates continuous mode. Otherwise persisted `mode: continuous` remains continuous on resume unless the latest message is an explicit interactive override.
- Bare `go` never newly activates continuous mode and is not an interactive override; persisted continuous mode survives it. Slicing does not silently choose a new execution mode.
- Contract: `_shared/continuous-mode.md`.

### Promise gates

Gates attach to promises, not waves (`_shared/promise-gates.md`). For each promise:

- **Promise 1** — <restatement>
  - Ledger items: <ids>
  - Walkthrough surface: <how the walker reaches the product — URL, command, preview>
  - Reviewers (risk-routed): <list, or "walkthrough only" at T1>
  - Escalation triggers: <diff conditions that add reviewers>
- **Promise 2** — ...

### Scheduling

- Parallel groups by disjoint file sets: <groups>
- Sequential constraints: <ledger blockedBy summary>
- Scheduling carries no gates and no ceremony — it is throughput only.

### Item rigour

- `production-transferable`: <ids> — full gate per rigor class table (`_shared/process-calibration.md`)
- `dogfood-disposable`: <ids> — one honest check, ship and move on
- `spike`: <ids> — the answer is the deliverable

### Final closeout

- End-to-end walkthrough of the whole journey (`_shared/walkthrough-verification.md`)
- T2+: intent audit against the full intent contract (`_shared/intent-audit.md`)
- T2+: risk-routed reviewers from the promises above; every gate note has a `fix-now` / `follow-up` / `residual-risk` / `rebutted` disposition. Normal final closure accepts only `PASS` / `NOT_APPLICABLE`; the separate budget-exhausted non-material path records `closed_with_residuals` while preserving raw blocking verdicts unchanged.
- T2+: review-cycle budget of 3 per gate, hard, including final. T1 closes with checks and the end-to-end walkthrough only.

### Hard-block escalation

- Conditions: `_shared/hard-block-conditions.md`.
- All other "should I check in" impulses are suppressed via `[CHECKIN-SUPPRESSED]` execplan entries.
- A hard-block is the only legitimate exit from continuous mode short of completion.
