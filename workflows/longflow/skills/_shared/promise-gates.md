# Promise Gates

Gates attach to **promises**, not waves. A wave is a scheduling concept — which items can run in parallel on disjoint files. A gate is a judgement concept — is a product promise now true? Conflating them produces diff-shaped reviews that can pass forever while the product stays hollow.

## The rule

- **Waves schedule. Promises gate.** Waves have no reviewers, no verdicts, and no closure ceremony; a wave "ends" when its items are done, silently.
- When the ledger says every item serving promise *N* is complete, the **promise gate for N** fires.
- The final closeout is the last promise gate plus a whole-of-intent audit: all promises true, nothing outside the promises snuck in.

Progress reporting inherits the shape for free: "promise 2 of 5 is now true — a salesperson can create a company without leaving Studio" is meaningful to the owner in a way "wave S3 closed" never was.

## Gate composition

Scaled by tier (`process-calibration.md`); components in order:

1. **Walkthrough** (all tiers) — a fresh agent uses the product the way the promise's user would, and reports in plain English. See `walkthrough-verification.md`. At T0–T1 this may be the entire gate.
2. **Intent audit** (T2+) — a fresh-context intent auditor answers: is this promise actually true for its user, was the effort proportionate, and is remaining work still serving the intent contract? See `intent-audit.md`.
3. **Reviewer panel** (T2+) — reviewers routed by the risk tags of the items in scope, per `reviewer-protocol.md`. Only reviewers whose domain the promise touches; `NOT_APPLICABLE` exists for a reason.

## Closure

A promise gate closes when:

- the walkthrough narrative supports the promise (the user can do the thing);
- required reviewers are in `{PASS, PASS_WITH_NOTES, NOT_APPLICABLE}` per the reviewer protocol, within the gate's review-cycle budget (3 cycles, hard);
- the intent auditor has not returned `misaligned` (a `misaligned` verdict routes through the authority rules in `intent-audit.md` — it is not one more finding to remediate around).

Mark the promise `true` in `STATE.json.promises` and append a plain-English gate summary to the execplan.

## When a gate fails honestly

If the walkthrough shows the promise is not true, that is not a review finding to argue with — it is unfinished work. Return to implementation. If the gap reveals the promise was mis-sliced (items missing from the tree), that is a coverage correction: add items, don't stretch existing ones.

If the promise *cannot* be made true as written (external dependency, wrong assumption), raise a course-correction proposal to the owner in plain language. Only the owner rewrites a promise (`intent-contract.md`).

## See also

- `walkthrough-verification.md`
- `intent-audit.md`
- `reviewer-protocol.md` — verdicts, budgets, iterate-on-blocked.
- `ledger.md` — how items map to promises.
