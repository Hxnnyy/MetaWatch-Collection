# Continuous Mode

The canonical contract for long-running, hands-off orchestration. Referenced by all longflow skills. Do not duplicate this contract elsewhere — link to it.

## Activation

An explicit interactive instruction in the user's latest message takes precedence over every activation source below. It makes the run interactive even when `STATE.json` still says `mode: continuous` or an earlier turn was continuous. At T1+, record `mode: interactive_override`, keep `status: in_progress`, and leave the previous continuous `directive` unchanged as durable history.

Continuous mode is **active** when any of:

1. The user's invoking message contains an unambiguous continuous directive: "until done", "until parent closed", "no pause", "AFK", "run to completion", "don't stop", or "fully autonomous". Bare `go` is not a continuous directive.
2. `tasks/STATE.json` exists with `"mode": "continuous"`.
3. The orchestrator was previously in continuous mode and no later explicit interactive override exists.

Otherwise the skill runs in **interactive mode**, and calibration (`process-calibration.md`) may set explicit human checkpoints — e.g. "surface each promise gate to the owner" at T1–T2 when the owner is around.

**T0 exception:** T0 is outside durable Longflow orchestration. A continuous directive at T0 means keep working in normal conversation until the small task is done; create no Longflow artifacts and no `STATE.json`. The rest of this contract applies at T1+.

At T1+, when continuous mode activates, the orchestrator MUST write `tasks/STATE.json` (template: `templates/STATE.json`) before the first execution action. STATE.json carries the continuous directive in its `directive` field — there is no separate directive file.

## What changes

| Behaviour | Interactive | Continuous |
|---|---|---|
| Promise gates | Surface gate summary to user | Append plain-English gate summary to execplan, proceed |
| Reviewer verdict surfacing | Orchestrator may surface ambiguous findings | Store raw verdicts unchanged; act without a routine user check-in |
| Subagent return | Surface a summary | Append to execplan, run check, dispatch next |
| `PASS_WITH_NOTES` at final closeout | Not a normal pass; dispose notes before the panel | Not a normal pass; only the budget-exhaustion residual path may close |
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
3. Adopt its `active_decisions`, `open_assumptions`, `binding_actions`, and `residual_risks`, then read the execplan tail for narrative context.
4. Check evidence freshness per `state-files.md`; transition any affected verified promise to `needs_recheck` before relying on it.
5. Reconcile and reap `agent_pool.threads` per `agent-lifecycle.md`.
6. Resume from `next_action`; use the ledger and git only to verify detail and freshness, not to reconstruct operative judgement (missing or malformed state fires hard-block 8).

## Exit

Continuous mode ends only when:

1. **Complete**: every promise in `STATE.json.promises` is `verified`, the tier-scaled final closeout passed, and the retro entry is written (`templates/RUNS.md`). At T1 that means the end-to-end walkthrough holds; at T2+ it also means the final intent audit is aligned and the final reviewer gate closed by its normal or documented residual path.
2. **Hard-block**: a condition from `hard-block-conditions.md` fired.
3. **Explicit override**: user said `interactive mode` or equivalent during the run.

On complete or hard-block exit, set both `STATE.json.mode` and `status` to `complete` or `hard_blocked`. On an explicit interactive override, set `mode: interactive_override` and keep `status: in_progress`. Do not delete state — it is part of the audit trail. Then report once to the user, plain-English first: which promises are verified, what it cost, what was flagged for follow-up.
