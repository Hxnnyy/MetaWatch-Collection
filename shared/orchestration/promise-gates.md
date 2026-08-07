# Promise Gates

Gates attach to **promises**, not waves. A wave is a scheduling concept — which items can run in parallel on disjoint files. A gate is a judgement concept — is a product promise now true? Conflating them produces diff-shaped reviews that can pass forever while the product stays hollow.

## The rule

- **Waves schedule. Promises gate.** Waves have no reviewers, no verdicts, and no closure ceremony; a wave "ends" when its items are done, silently.
- A gate is eligible as soon as a credible runnable path may already satisfy the promise; it is forced no later than completion of the last mapped item serving that promise.
- The final closeout is the last promise gate plus a whole-of-intent audit: all promises are `verified`, nothing outside the promises snuck in.

Progress reporting inherits the shape for free: "promise 2 of 5 is now true — a salesperson can create a company without leaving Studio" is meaningful to the owner in a way "wave S3 closed" never was.

## Gate composition

Promise gates are durable-run mechanics at T1+. T0 performs one honest final check in normal conversation and records no gate artifact. At T1+, components are scaled by tier (`process-calibration.md`) and run in order:

1. **Walkthrough** (T1+) — a fresh agent uses the product the way the promise's user would, and reports in plain English. See `../verification/walkthrough-verification.md`. At T1 this is normally the entire gate.
2. **Intent audit** (T2+) — a fresh-context intent auditor answers: is this promise actually true for its user, was the effort proportionate, and is remaining work still serving the intent contract? See `../review/intent-audit.md`.
3. **Reviewer panel** (T2+) — reviewers routed by the risk tags of the items in scope, per `../review/reviewer-protocol.md`. Only reviewers whose domain the promise touches; `NOT_APPLICABLE` exists for a reason.

## Closure

A promise gate closes when:

- the walkthrough narrative supports the promise (the user can do the thing);
- required reviewers are in `{PASS, PASS_WITH_NOTES, NOT_APPLICABLE}` per the reviewer protocol, with every `PASS_WITH_NOTES` finding explicitly disposed before closure, within the gate's review-cycle budget (3 cycles, hard);
- the intent auditor (T2+) is `aligned` when required (a `drifting` or `misaligned` verdict routes through the authority rules in `../review/intent-audit.md` — it is not one more finding to remediate around).

That is normal closure: record the gate-level `review_outcome: passed`. There is one budget-exhaustion branch: after cycle 3, if the walkthrough still holds, the intent audit is aligned, and every remaining finding is non-material, dispose each finding as `residual-risk` or `follow-up` and record the gate-level `review_outcome: closed_with_residuals`. Any material finding still open fires hard-block 4.

Gate evidence and gate judgement are separate. Append every raw reviewer verdict exactly as returned to `raw_reviewer_verdicts`; that history is immutable and append-only. Record the orchestrator's applied dispositions separately in `applied_dispositions`, referencing the raw verdict and finding. Neither normal closure nor the budget-exhaustion branch rewrites a reviewer's verdict.

Mark the promise `verified`, record `verified_at`, `verified_at_sha`, evidence `references`, and exact file-or-directory-prefix `scope`, then append a plain-English gate summary to the execplan. If later in-scope work changes that evidence, set `needs_recheck` and `dirty_since_sha`; this names current evidence, not permanent truth.

## When a gate fails honestly

If the walkthrough shows the promise is not true, that is not a review finding to argue with — it is unfinished work. Return to implementation. If the gap reveals the promise was mis-sliced (items missing from the tree), that is a coverage correction: add items, don't stretch existing ones.

If the promise *cannot* be made true as written (external dependency, wrong assumption), raise a course-correction proposal to the owner in plain language. Only the owner rewrites a promise (`intent-contract.md`).

After an early gate verifies a promise, challenge every remaining mapped item: cancel or reslice anything that no longer contributes to that promise. Keep the cancellation reason in the ledger; do not continue work merely because it was previously planned.

## See also

- `../verification/walkthrough-verification.md`
- `../review/intent-audit.md`
- `../review/reviewer-protocol.md` — verdicts, budgets, iterate-on-blocked.
- `ledger.md` — how items map to promises.
