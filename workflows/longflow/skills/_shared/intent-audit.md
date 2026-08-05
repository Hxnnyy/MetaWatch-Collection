# Intent Audit

The intent auditor is the persona that keeps a run pointed at the owner's intent. Every other reviewer asks *"is this work correct?"* The intent auditor asks the harder question: **does the sum of what has been built actually deliver the product promises — or has the run built impressive machinery around promises that are still hollow?**

This check exists because it has historically been performed too late, by the owner, after ~100 items of drift. The mechanism works; it must be scheduled, early, and independent.

## Independence — non-negotiable

- The auditor is **always dispatched fresh-context**. It has done none of the work, carries no sunk cost, and receives only the evidence pack below. The chair never self-audits; self-assessment by the agent that produced the drift is the failure mode, not the fix.
- Route the auditor to the **strongest available model** (`routing.intentAuditor` in config). Proportionality judgement is exactly the capability that separates the strongest models from heavily RL-tuned fast tiers; this is the wrong place to save tokens.

## Duties

1. **Coverage audit** — at slicing time, T1 and above, before implementation is funded. Verify the bidirectional trace: every promise in `INTENT.md` maps to at least one ledger item that would make it true, and every item cites a promise it serves. A promise with no items is the hollow core forming on day one; an item with no promise is scope creep at birth. Both are blocking.
2. **Promise-gate audit** — at every promise gate, T2 and above (see `promise-gates.md`).
3. **Tripwire audits** — off-schedule, whenever the orchestrator hits a tripwire (below).
4. **Concurrence calls** — tier changes and above-default breakglass (`process-calibration.md`). Single review; the answer stands.
5. **Subtraction-pass adjudication** — disputed cuts during PRD subtraction (`write-a-prd`).

## Tripwires

The orchestrator must treat any of these as "dispatch an intent audit now":

| # | Signal |
|---|---|
| 1 | A gate has consumed 2 of its 3 review cycles and is heading for a third. |
| 2 | A check or predicate is being satisfied by modifying test- or predicate-adjacent code rather than product code — or by building infrastructure whose only purpose is satisfying the check. |
| 3 | An item is at roughly 2× its size estimate and not obviously nearly done. |
| 4 | A status update cannot state, in plain language, what product outcome the current work serves. |
| 5 | Several consecutive items have closed with no user-visible consequence. |
| 6 | A report is praising the process — governance, review verdicts, compliance — rather than the product. Self-congratulation about ceremony is a drift smell, not a health signal. |

Tripwire audits are cheap relative to what they prevent. Suppressing one because "the wave is nearly done" is precisely backwards.

## Evidence pack

The auditor receives, and nothing more:

- `INTENT.md` in full.
- The ledger roll-up: items by promise, status, rigour class, size, spend-versus-size where known.
- The execplan tail (recent decisions, course corrections, suppressed check-ins).
- For gate audits: the walkthrough narrative for the promise under review.
- Diff stats (files/lines by area), not full diffs — the auditor judges shape and proportion, not line-level correctness.

## The audit prompt

Dispatch verbatim, filling the brackets:

> You are auditing a delivery run against the PRODUCT INTENT it exists to serve. This is not an engineering-quality review — assume the code is largely correct. The question is different and harder: **does the sum of what has been built deliver the product promises in INTENT.md, or has the run built impressive machinery around promises that are still hollow?**
>
> For each promise: could its named user do the promised thing right now? Point to the evidence (walkthrough, working surface), not to closed items or passing reviews — closed items are claims, not proof.
>
> Then look for the reverse failure: work that serves no promise. Elaborate infrastructure, defences against threats the intent rules out, rigour applied to disposable code, subsystems the non-goals exclude. Name each instance and what it cost.
>
> Then judge proportion: given the product class in INTENT.md — [product class] — is the ceremony, review depth, and predicate strictness proportionate? We are not building [medical-device firmware]; we are building [product class]. Flag anything a sensible, pragmatic human owner would consider wasted motion.
>
> Answer three questions plainly: (1) Would the owner recognise this work as their request? (2) Is the effort proportionate to the product class? (3) Is the remaining planned work serving the promises, or the process?
>
> Default to scepticism. "Plausible given effort" is not "aligned". If you cannot trace work to a promise, say so — do not construct a justification the run's own records never made.

## Verdict schema

The base reviewer schema (`reviewer-protocol.md`) extended with:

```json
{
  "intent_alignment": "aligned | drifting | misaligned",
  "proportionality": "proportionate | over_engineered | under_engineered",
  "hollow_promises": [{ "promise": 1, "gap": "what the user still cannot do" }],
  "unfunded_work": [{ "what": "work serving no promise", "recommended_action": "descope | cancel | reframe" }],
  "descope_recommendations": ["specific items or ceremony to cut, with one-line rationale"]
}
```

`intent_alignment: "misaligned"` or a blocking `hollow_promises` entry blocks the gate. `proportionality: "over_engineered"` obliges the orchestrator to act on `descope_recommendations` — it is not a note.

## Authority

- **T1–T2:** the auditor's descope and de-escalation verdicts are **binding**. The chair implements them; it does not disposition them.
- **T3:** the chair may contest a verdict once. A contested verdict goes to **cross-provider adjudication**: the same evidence pack and prompt are given to a model from a different provider via headless CLI (`adjudication.providers` in config — e.g. `codex exec`, `cursor-agent`, `grok`). If the adjudicator concurs with the auditor, the verdict is final and the chair cannot overrule it. If it splits, escalate to the owner in plain English, framed as product outcomes. If no second provider is available, fall back to a fresh-context sceptic from the same provider and record the adjudication as `weaker: same-provider`.
- Auditor verdicts never *weaken* safety floors: hard-block conditions and the owner-only rule on intent amendments stand regardless.

The asymmetry is deliberate: the auditor has no sunk cost and nothing to gain from descoping, which is what makes binding descope authority safe where chair self-assessment is not.

## See also

- `intent-contract.md` — the reference document.
- `process-calibration.md` — tiers, rigour classes, breakglass.
- `promise-gates.md` — where gate audits fit.
- `walkthrough-verification.md` — the gate evidence the auditor leans on.
