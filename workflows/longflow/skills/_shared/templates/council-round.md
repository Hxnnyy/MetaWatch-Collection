# Council Round

- **Round**: 1 (single round is the default; a second round requires T3 and chair justification)
- **Proposal version**: <version>
- **Pragmatist seat**: <model — strongest available>

## Inputs

- Intent contract: `tasks/INTENT.md`
- Proposal: <path>
- Packet: <path> containing the frozen proposal version, promise list and non-goals, product class, relevant repository constraints, known risks/assumptions, decision questions, alternatives already considered, and evidence links (spike results or measurements where available). It excludes member reviews so the first pass remains blind.

## Independent reviews

| Member | Model | Stance assigned | Verdict summary |
|---|---|---|---|
| ... | ... | <domain lens or pragmatist> | ... |

The pragmatist seat argues for the smallest faithful implementation and gets the same standing as every other seat.

## Findings and dispositions

| ID | Severity | Topic | Kind | Disposition | Rationale |
|---|---|---|---|---|---|
| ... | ... | ... | objective / tradeoff / preference / **empirical** | accept / reject / defer / residual-risk / **spike** | ... |

**Empirical disagreements are settled by spikes, not argument.** If two members disagree about whether something works, scales, or fits, the disposition is `spike` — name the question, the cheap experiment, and who runs it. Debate cycles on empirical questions are a protocol violation.

## Chair resolution

- Chair (lab-independent of all members): <model>
- Tie-breaks and forced dispositions, with one-line rationales:
- Severity downgrades signed off (empty if none):

## Output

- Accepted edit set applied to proposal v<next>:
- Spikes queued (question → experiment):
- Residual risks:
- **Plain-English summary for the owner**: what the council changed about the plan and why it matters to the product, in three sentences.
