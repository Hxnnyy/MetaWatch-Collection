## Delivery Governance

### Intent and tier

- **Intent contract**: `tasks/INTENT.md` (status: drafted-unconfirmed | owner-confirmed)
- **Tier**: T1 | T2 | T3 — rationale: <one line>
- **Riskiest assumption**: <what, and the spike that answered it — or why none was needed>

### Repo standards

- **Status**: ESTABLISHED | PARTIAL | MISSING
- **Source**: `docs/DeliveryStandards.md` (or repo equivalent)
- **Bootstrap commit**: <sha or n/a>

### Continuous-mode default

- **Continuous mode is the default** when this PRD is dispatched via `issues-execution` for full delivery.
- Interactive override: user must say `interactive mode` explicitly at dispatch.
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
- Intent audit against the full intent contract (`_shared/intent-audit.md`)
- Reviewers: risk-routed set from the promises above; `PASS_WITH_NOTES` not accepted at final (mapped to `BLOCKED`)
- Review-cycle budget: 3 per gate, hard, including final

### Hard-block escalation

- Conditions: `_shared/hard-block-conditions.md`.
- All other "should I check in" impulses are suppressed via `[CHECKIN-SUPPRESSED]` execplan entries.
- A hard-block is the only legitimate exit from continuous mode short of completion.
