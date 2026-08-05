# Course-Correction Protocol

Any agent may raise a `COURSE_CORRECTION_PROPOSAL` when evidence suggests the workflow is going down the wrong path — in **either direction**: cutting corners the intent requires, or building ceremony and scope the intent never asked for.

## Required Schema

```json
{
  "event": "COURSE_CORRECTION_PROPOSAL",
  "severity": "low | medium | high | critical",
  "trigger": "why current path appears wrong",
  "evidence": ["file:line", "test output", "reviewer finding", "diff pattern", "spend vs promises"],
  "affected_invariants": ["public API", "auth", "migration safety", "architecture coherence", "UX", "test integrity", "intent_drift", "over_engineering"],
  "recommended_action": "continue_with_note | local_adjustment | descope | de_escalate | parent_checkpoint | reroute | reslice | hard_block",
  "authority_level": "green | amber | red",
  "serves_promise": "which INTENT.md promise this correction serves, in one line",
  "safe_next_step": "smallest reversible action"
}
```

`serves_promise` is mandatory. A correction that cannot name the promise it serves is usually the drift, not the fix.

## Authority Handling

- Green: record the proposal, take the local adjustment, and continue.
- Amber: pause the specific decision until independent verifier, intent-auditor, or chair concurrence is recorded; continue unrelated safe work if possible.
- Red: hard block.

Tier parameterises authority levels — see `autonomy-envelope.md`. Descope and de-escalate corrections arising from an intent-audit verdict follow the binding rules in `intent-audit.md`.

## Forbidden Silent Changes — both directions

Implementers and orchestrators must not silently **weaken** the run:

- weaken predicates or acceptance semantics,
- skip required reviewers or gates,
- declare success without fresh evidence,
- hide residual risk in summary prose.

And must not silently **inflate** it:

- add scope no promise funds,
- strengthen predicates or checks beyond what the product class warrants,
- add gates, review rounds, or governance artifacts above tier defaults,
- add speculative abstractions or defences against threats the intent contract rules out,
- apply production rigour to `dogfood-disposable` or `spike` items.

Both lists route through the same proposal schema. Cutting corners and gold-plating are the same offence: substituting the agent's judgement for the recorded intent without leaving an audit trail.

## Major corrections

When a correction supersedes part of the plan (not just an item), record it as a durable review document with this structure, which later agents read as authority:

1. **The owner's words, verbatim** — the intent being restored.
2. **Decisions** — numbered, each stating what changes and why.
3. **Cancelled** — work stopped outright, with one-line reasons. Cancelling unstarted work is the cheapest correction available.
4. **Reframed** — work that survives with changed purpose.
5. **What survives untouched, and why** — protects the expensive core from an overcorrection into tabula rasa.

Record chair accountability plainly when the drift was chair error. Blame placed accurately once prevents the same error twice.
