# Council Protocol

Council is **one time-boxed adversarial round**: independent reviews from members at different labs, a pragmatist seat, chair disposition, done. Models arguing with models across convergence cycles burns tokens on exactly the class of question they are worst at settling verbally — so the protocol's central rule is:

**Empirical disagreements are settled by spikes, not argument.** If members disagree about whether an approach works, scales, or fits, the chair dispositions the finding as `spike` — a named question, a cheap experiment, an owner of the experiment. Debating an empirically answerable question into a second cycle is a protocol violation.

## When council runs

- T2: only when there is genuine plan-level disagreement, architecture risk, or broad multi-system scope. A settled plan goes straight to `write-a-prd`.
- T3: default before the PRD.
- T0–T1: never.

## Roles

- **Members**: the models in `models.council` (config). Each reviews the proposal independently — no member sees another's review before writing its own. Each is assigned a lens; lenses cover the plan's risk areas.
- **Pragmatist seat**: one member is always briefed to argue for the **smallest faithful implementation** — what can be cut, simplified, or deferred while keeping every intent-contract promise true. Route this seat to the strongest available model (`routing.intentAuditor` alias by default): arguing for less, credibly, is the hardest brief in the round. The pragmatist has the same standing as every other seat.
- **Chair**: `models.councilChair` — from a lab not represented among the members, to prevent intra-lab homogenisation on close calls. The chair does not vote. It dispositions findings, breaks ties, and writes the round output.

## The round

1. Freeze the proposal version. Every member receives the intent contract, the proposal, and the packet.
2. Members review independently and return findings: severity-scored, evidence-backed, classified as `objective` / `tradeoff` / `preference` / `empirical`.
3. The chair merges duplicates and dispositions every finding in one pass:
   - `accept` — folded into the proposal edit set.
   - `reject` — dismissed with one-line rationale.
   - `defer` — out of scope; recorded on the "later, maybe" list.
   - `accepted-as-residual-risk` — acknowledged and tracked.
   - `spike` — empirical; question + experiment + owner queued before or alongside early implementation.
4. The chair applies the accepted edit set, records the round (template: `../templates/council-round.md`), and writes a three-sentence plain-English summary for the owner: what changed about the plan and why it matters to the product.

There is no convergence loop. Findings do not need to vanish; they need an explicit disposition.

## Second round (T3 only, exception)

A second round may run only at T3, only when the accepted edit set changed the proposal's *shape* (module boundaries, ownership, public contracts — not wording), and only with chair justification recorded. Two rounds is the ceiling at any tier. What used to take five cycles of ballot tables is either settled by the chair's disposition authority or was empirical all along — in which case it is a spike.

## Guardrails kept from the convergence-loop era

- **Severity stability**: a downgrade between draft and disposition requires chair sign-off with logged rationale — findings must not be quietly demoted to escape attention.
- **Ballot integrity**: the chair watches for gaming patterns (members editing severity after seeing the room).
- **Chair independence**: lab-independence of the chair is non-negotiable; it is the same cross-provider mechanism used for intent-audit adjudication (`../review/intent-audit.md`), and a run may use the same configured provider for both.

## Output

- Proposal vNext with the accepted edit set applied.
- Spike queue (question → experiment → owner).
- Residual-risk list.
- "Later, maybe" list from deferrals.
- Plain-English owner summary.
