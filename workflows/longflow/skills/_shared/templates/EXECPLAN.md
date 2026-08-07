# Execplan: <run name>

- **Tier**: <T1–T3>
- **Intent contract**: `tasks/INTENT.md`
- **Mode**: continuous | interactive | interactive_override
- **Started**: <ISO-8601 UTC>
- **State**: `tasks/STATE.json`, ledger in `tasks/ledger/`

## Contract (re-read at every promise gate)

1. Respect the selected mode: continuous runs proceed until every promise is verified or a hard block fires; interactive runs surface configured checkpoints.
2. Gates attach to promises, not waves (`_shared/promise-gates.md`). Every gate includes a walkthrough.
3. Items close per their `rigor_class` gate — disposable items get one honest check, not ceremony.
4. In continuous mode, "ask user" → `[CHECKIN-SUPPRESSED]` entry → decide inside the envelope → continue. In interactive mode, surface the question when the mode contract permits it.
5. Every recorded decision carries `serves promise #N because <...>`.
6. Substantive entries open plain-English: what happened / what we decided / what it means for the product / intent-match confidence.
7. Treat `STATE.json` decisions, assumptions, binding actions, and residual risks as operative judgement; the ledger and git verify detail, not reconstruct it.
8. Recheck a verified promise when later changes touch its recorded evidence scope; record `needs_recheck` before relying on stale evidence.
9. Track every spawned agent in `STATE.json`; returned is not closed.

## Calibration

**What happened**: <intent contract drafted/confirmed; tier proposed with rationale.>
**What we decided**: <tier, and the run's riskiest assumption — spiked, or why not.>
**What it means for the product**: <what the owner should expect from this run.>
**Intent-match confidence**: high — because <the owner confirmed the contract wording / drafted-unconfirmed from kickoff message>.

<budget estimate; item sizing summary; coverage-audit result: every promise funded, every item cites a promise>

## Promise log

### Promise 1 — <short restatement>

- <ts> dispatch <agent> for <ledger-id> (files: [...], rigor: <class>, size: <S/M/L>)
- <ts> return <agent>: <one-line summary>
- <ts> check for <ledger-id>: <command> → pass
- <ts> commit <sha> "<message>"

#### Gate

**What happened**: <walkthrough result in one sentence; quote its key line.>
**What we decided**: <gate closed / returned to implementation / descoped per audit.>
**What it means for the product**: <what the promise's user can now do.>
**Intent-match confidence**: <high|medium|low> — because <...>

<details: verification timestamp/SHA/scope, walkthrough pointer, intent-audit result, immutable raw reviewer verdicts, applied dispositions, cycles used n/3, review_outcome>

### Promise 2 — ...

## Suppressed check-ins

- [CHECKIN-SUPPRESSED] <ts> **What happened**: <the question that almost got asked.> **What we decided**: <the decision.> **What it means for the product**: <consequence.> **Intent-match confidence**: <...> — serves promise #<n> because <...>

## Course corrections and breakglass

- <ts> <one-line breakglass entries; full course-correction proposals per `_shared/course-correction-protocol.md`>

## Hard-blocks

(none, or `[HARD_BLOCK]` entries citing the numbered condition, plain-English opening first)

## Closeout

**What happened**: <N of M promises verified; final walkthrough of the whole journey.>
**What we decided**: <follow-ups flagged, residual findings recorded.>
**What it means for the product**: <what the owner has now, in one sentence.>
**Intent-match confidence**: <...>

- Cost against budget: <rough>
- Follow-ups: <ledger ids or list>
- Retro appended to `RUNS.md`: <ts>
- `STATE.json.final_closeout`: <evidence references and outcome recorded after the retro>
