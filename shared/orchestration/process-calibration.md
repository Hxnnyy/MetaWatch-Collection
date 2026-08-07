# Process Calibration

Longflow is a toolkit, not a liturgy. The first real decision of any run is how much of the toolkit the task deserves. This document defines that decision: ceremony tiers, per-item rigour classes, the breakglass rule for deviating from defaults, and the run budget.

## Why calibration exists (read this honestly)

Models trained with reinforcement learning are optimised to interpret a task literally and execute it maximally thoroughly. Left unchecked, that produces a predictable failure signature in long autonomous runs:

- ceremony applied uniformly, so a throwaway fixture gets the same frozen predicates and adversarial review as production code;
- predicates satisfied by clever, expensive workarounds instead of being challenged as miscalibrated;
- impressive machinery accumulating around product promises that remain hollow;
- reports that praise the process ("all reviewers passed") while nobody asks whether the product does what the owner wanted;
- and a structural bias where adding scope, gates, and rigour is always cheaper than removing them.

None of this is fixed by telling the model to "be pragmatic" — under pressure, exhortation loses to training. It is fixed structurally: an explicit tier decision at kickoff, per-item rigour classes, an asymmetric rule that makes *adding* ceremony the move that needs permission, and independent fresh-context audits with authority to descope (see `../review/intent-audit.md`).

**The standing default: err toward under-engineering.** Scoping a follow-up issue later is trivial; clawing back tokens and days spent on unnecessary machinery is impossible. When two defensible readings of scope exist, build the smaller one and flag the difference in the handover.

## Ceremony tiers

The tier is a *default bundle* of mechanisms, not a straitjacket. At T1+ it is recorded in `STATE.json`; T0 remains conversational and creates no state file. The machine-readable conformance fixture is `tier-policy.json`; this table is its human explanation.

| | T0 — just build | T1 — lite | T2 — standard | T3 — fortress |
|---|---|---|---|---|
| Typical work | prospect demo, spike, one-file fix | content site, small internal tool, simple CRUD | multi-module feature on a production codebase | complex distributed system, migration-heavy or high-blast-radius work |
| Intent contract | optional one-liner in chat | required, may be `drafted-unconfirmed` | required, owner-converged | required, owner-signed (blocks until signed) |
| Council | none | none | one round only for genuine plan-level disagreement | one round by default; a second only after a shape-changing exception |
| PRD | none | none — a short plan in the execplan | required, with subtraction pass | required, with subtraction pass |
| Slicing | informal todo list | local ledger + coverage audit, no sizing | local ledger + coverage audit + sizing | local ledger + coverage audit + sizing |
| Item verification | it visibly works | one honest check per item | predicates by rigour class | predicates by rigour class, strict review bar |
| Gates | final walkthrough only | walkthrough per promise | promise gates: walkthrough + intent audit + risk-routed reviewers | promise gates: walkthrough + intent audit + risk-routed reviewers + cross-provider adjudication on contested verdicts |
| Reporting | normal conversation | plain-English execplan | plain-English execplan + promise status | plain-English execplan + promise status |
| Tier sign-off when owner absent | proceed | proceed under proposed tier | proceed under proposed tier | **hard-block for approval** |

At T0, the honest output of calibration is: *"this doesn't need Longflow — I'm going to build it."* Perform the final walkthrough as an ordinary product check, not a durable promise gate. That is a success of the process, not an evasion of it.

T1 and T2 may begin owner-absent with an intent marked `drafted-unconfirmed`. Their promise acceptance is operationally frozen for agents, but visibly provisional until the owner confirms it; agents must not silently broaden or reinterpret it. T3 cannot begin until the owner signs both the intent and tier.

### Choosing the tier

The orchestrator proposes a tier at kickoff with a plain-English rationale — product class, blast radius, reversibility — and asks the owner to confirm. Signals that pull upward: irreversible actions, data migration, security surface, many modules, unfamiliar territory. Signals that pull downward: disposable output, single surface, easy rollback, the owner watching the run live. When signals disagree, blast radius wins.

### Changing the tier mid-run

Either direction requires **intent-auditor concurrence** — one fresh-context review, not a loop. Escalation with evidence (a discovered migration landmine, a security surface nobody knew about) should normally be granted. De-escalation is judged against the intent contract's product class. If the auditor says no, it is no — or the orchestrator escalates to the owner with a plain-English justification framed as product outcomes. Renaming, re-asking, or splitting the question to shop for a yes is a governance violation.

## Per-item rigour classes

The tier sets defaults; at T2+ the item's rigour class sets the actual item gate. At T1, every item gets one honest check regardless of class: no frozen predicate scripts and no item reviewer apparatus. The class is still recorded on each ledger item as `rigor_class` so the work's intended durability is visible. At T2+, it is policed by the intent auditor **in both directions** — under-rigour on production code and over-rigour on disposable code are both findings.

| rigor_class | meaning | gate |
|---|---|---|
| `production-transferable` | code the product keeps | predicate per acceptance contract, tests, risk-routed review at the promise gate |
| `dogfood-disposable` | fixtures, local mocks, tuning scaffolds | **does it work?** One honest check if cheap. No perturbation proofs, no adversarial review, no re-verification. Ship it and move on. |
| `spike` | an experiment that answers a question | the *answer* is the deliverable. Code is deletable by default; no review at all. Record what was learned in the execplan. |

A disposable fixture that took three corrective dispatches to perfect is a process failure, not a quality win.

## Spike-first rule

Calibration names the run's **riskiest assumption** — the thing that, if false, invalidates the plan. If a cheap spike can answer it, the spike runs before slicing funds the full tree, and its answer feeds the short execplan at T1 or the PRD at T2+. Empirical disagreements discovered later (in council, in review) are also settled by spikes, not by argument cycles.

## Breakglass — deviating from tier defaults

The rule is deliberately asymmetric:

- **Below defaults** (skipping a mechanism the tier would apply): the orchestrator records a one-line breakglass entry in the execplan — what is skipped, for which items, and why — and continues. Green. At T3 only, skipping anything that guards auth, migration, data loss, or tenant isolation is amber and needs intent-auditor concurrence.
- **Above defaults** (adding ceremony the tier does not call for — extra gates, extra review rounds, stricter predicates, new governance artifacts): requires intent-auditor concurrence *before* the ceremony is added. Gold-plating is a scope change like any other.

This inverts the historical ratchet where grinding onward was free and descoping needed permission.

## Run budget

Calibration sets a rough token/effort budget for the run. At T2+, slicing also sizes each item `S`/`M`/`L`. Neither is a precision estimate — they exist to give drift detection a denominator:

- at T2+, an item at ~2× its size estimate is a tripwire (see `../review/intent-audit.md`);
- the intent auditor reads the spend-versus-promises curve: spend without promises moving is the classic lost-in-the-sauce signature;
- the handover reports what the run cost and where it went.

At T1+, budget state lives in `STATE.json` under `budget`; T0 keeps its rough bound in conversation.

At T1, ledger items use `size: null`; there is deliberately no item-size denominator. At T2+, size is one of `S`, `M`, or `L`.

### Size language (T2+)

`S` is one bounded vertical change with a known path; `M` is a small set of connected changes whose interfaces are understood; `L` is a bounded discovery-and-delivery slice with multiple modules or one material uncertainty. A size is a drift denominator, not a commitment to complexity: split an L when independent outcomes emerge.

## See also

- `intent-contract.md` — the reference point calibration serves.
- `../review/intent-audit.md` — the independent check on calibration decisions.
- `promise-gates.md` — what gates look like once calibrated.
- `ledger.md` — where items and rigour classes live.
