# Continuous Mode

The canonical contract for long-running, hands-off orchestration. Referenced by all longflow skills. Do not duplicate this contract elsewhere — link to it.

## Activation

Continuous mode is **active** when any of:

1. The user's invoking message contains an unambiguous continuous directive: "until done", "until parent closed", "no pause", "AFK", "run to completion", "don't stop", "fully autonomous", "go".
2. `tasks/STATE.json` exists with `"mode": "continuous"`.
3. The orchestrator was previously in continuous mode and has not seen an explicit `interactive mode` instruction since.

Otherwise the skill runs in **interactive mode**, and calibration (`process-calibration.md`) may set explicit human checkpoints — e.g. "surface each promise gate to the owner" at T1–T2 when the owner is around.

When continuous mode activates, the orchestrator MUST write `tasks/STATE.json` (template: `_shared/templates/STATE.json`) before any other action. STATE.json carries the continuous directive in its `directive` field — there is no separate directive file.

## What changes

| Behaviour | Interactive | Continuous |
|---|---|---|
| Promise gates | Surface gate summary to user | Append plain-English gate summary to execplan, proceed |
| Reviewer verdict surfacing | Orchestrator may surface ambiguous findings | Mapped to `PASS` / `BLOCKED` / `NOT_APPLICABLE` only |
| Subagent return | Surface a summary | Append to execplan, run check, dispatch next |
| `PASS_WITH_NOTES` at final closeout | Allowed with user check | Disallowed; mapped to `BLOCKED` |
| Off-scope work discovered | Surface for user input | Open a follow-up ledger item, continue |
| Acceptance ambiguity | Ask user | Tier-dependent: T0–T1 decide small and flag; T2+ hard-block 6 (see `hard-block-conditions.md`) |
| End-of-turn check-ins | Allowed | Suppressed via execplan |

## Re-read discipline

The orchestrator MUST re-read `STATE.json` (including its `directive` field) at the **start of every promise gate** and on every resume-without-context. This is a structural beat, not an event-triggered one: an event-triggered re-read assumes the agent remembers to re-read after compaction, which is the same context that just got dropped.

The orchestrator MUST update `STATE.json` on every item status change, reviewer verdict, promise transition, tripwire fire, hard-block fire, and agent-registry transition. Detailed dispatch results, check runs, and commits remain in the execplan.

## Suppress, don't surface

Whenever the orchestrator is about to surface a question, summary, or check-in to the user that is not a hard-block:

1. Append the would-be message to the execplan as a `[CHECKIN-SUPPRESSED]` entry — in the plain-English entry format (`state-files.md`), so the owner reading later can follow the decision without deciphering jargon.
2. Make the most defensible decision yourself inside the autonomy envelope, with its `serves promise #N` line.
3. Continue.

The only legitimate path to a user prompt in continuous mode is via a hard-block firing. See `hard-block-conditions.md`.

## Resume on new turn

If the orchestrator arrives in a conversation without context (post-compaction, post-restart, post-handoff):

1. Read `tasks/STATE.json` in full, including `directive`.
2. Read `tasks/INTENT.md` — the intent contract is part of resume context, not an optional extra.
3. Read the tail of the execplan for recent decisions.
4. Reconcile and reap `agent_pool.threads` per `agent-lifecycle.md`.
5. Resume from `next_action`; do not re-derive state from the ledger files or `git log` unless `STATE.json` is missing or malformed (hard-block 8).

## Exit

Continuous mode ends only when:

1. **Complete**: every promise in `STATE.json.promises` is true, the final closeout gate passed, and the retro entry is written (`../templates/RUNS.md`).
2. **Hard-block**: a condition from `hard-block-conditions.md` fired.
3. **Explicit override**: user said `interactive mode` or equivalent during the run.

On exit, set `STATE.json.mode` to `complete` / `hard_blocked` / `interactive_override` and `status` to match (do not delete state — it's part of the audit trail). Then report once to the user, plain-English first: which promises are true, what it cost, what was flagged for follow-up.
