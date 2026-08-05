# State Files

The durable artifacts that survive context compaction and let the orchestrator resume cleanly. State on disk is the single source of truth; in-context summaries are derivative.

The canonical set is deliberately small — four artifacts, no more:

| Artifact | Role |
|---|---|
| `tasks/INTENT.md` | The intent contract — promises, non-goals, product class. Owner-amendable only. See `intent-contract.md`. |
| `tasks/STATE.json` | Machine-readable orchestration snapshot, including the continuous directive. |
| `tasks/ledger/<ID>.json` | One file per work item. See `ledger.md`. (T2+; T0–T1 may keep items as a list in the execplan.) |
| `tasks/<YYYY-MM-DD>-<slug>-execplan.md` | Append-only human trace, plain-English first. |

Historical artifacts `CONTINUOUS_DIRECTIVE.md` and `HEARTBEAT.md` are retired: the directive lives in `STATE.json.directive`, and modern harnesses' native persistence made the heartbeat file and watcher redundant. If you find them in an old run, read them once for context and migrate.

## `tasks/STATE.json`

**Purpose**: post-compaction recovery without re-deriving from the ledger or `git log`. `next_action` is the resume point.

**Updated on**: item status changes, reviewer verdicts, promise transitions, tier or breakglass decisions, tripwire fires, agent dispatch/return/close/reconciliation, and hard-block fire.

**Template**: `_shared/templates/STATE.json`.

### Schema

```jsonc
{
  "schema_version": "metawatch-longflow-3.0",
  "mode": "continuous | interactive | complete | hard_blocked | interactive_override",
  "status": "in_progress | complete | hard_blocked",
  "directive": "the continuous-mode contract in two or three sentences — re-read at every promise gate and on every resume",
  "tier": "T0 | T1 | T2 | T3",
  "intent_authority": "tasks/INTENT.md",
  "prd": "<path, ledger id, or issue number | null>",
  "promises": [
    {
      "number": 1,
      "summary": "short restatement of the promise",
      "status": "open | in_progress | gated | true",
      "gate": {
        "walkthrough": "pending | holds | does_not_hold | cannot_walk",
        "intent_audit": "pending | aligned | drifting | misaligned | n/a",
        "review_cycles": 0,          // hard budget 3, shared by all panels against this gate however named
        "reviewers": { "<reviewer-name>": { "verdict": "...", "blocking_count": 0, "rebuttals": [] } }
      }
    }
  ],
  "budget": {
    "estimate": "rough overall size in the unit the run uses (tokens, agent-dispatches, or days)",
    "spent_note": "coarse running note, updated at promise gates",
    "items_over_2x": []              // ledger ids past ~2x their size estimate — each is a tripwire
  },
  "breakglass_log": [ "one-line entries: what was skipped or added vs tier defaults, and why" ],
  "next_action": "<the single next step, specific enough to act on cold>",
  "agent_pool": {
    "max_threads": <integer>,
    "reserved_slots": 2,
    "last_reconciled_at": <ISO-8601 | null>,
    "threads": [
      {
        "agent_id": <string>,
        "role": "implementer | corrective | reviewer | intent-auditor | walker | spike",
        "scope": <string>,
        "status": "running | returned | interrupted | close_failed | closed",
        "result_consumed": <boolean>,
        "close_attempts": <integer>,
        "spawned_at": <ISO-8601>,
        "closed_at": <ISO-8601 | null>
      }
    ]
  },
  "commits": [
    { "sha": <string>, "item": "<ledger id | null>", "kind": "implementation | review-fix | cleanup | spike", "message": <string> }
  ],
  "block_reason": <string | null>,
  "started_at": <ISO-8601>,
  "updated_at": <ISO-8601>
}
```

Item detail (files owned, checks, evidence, blockedBy) lives in the ledger, not here. Waves, if used for scheduling, are derivable from ledger `blockedBy` + file sets and need no state entry — they carry no gate.

The template file is valid JSON with empty/null defaults; this schema doc describes the populated shape.

## The execplan

A narrative log of orchestration events. Append-only, and written for **two readers with different needs**:

- **The owner** reads it to steer. Every entry therefore opens human-facing, in plain English.
- **Agents** read it to resume. Technical detail goes below the plain-English opening, clearly separated.

### Entry format

Every substantive entry (gate result, course correction, suppressed check-in, tripwire, hard-block, notable decision) opens with three lines, then optional detail:

```
**What happened**: <≤ 2 sentences, ≤ 20 words each, active voice, no unexplained jargon>
**What we decided**: <same constraints; name the decision, not the deliberation>
**What it means for the product**: <same constraints; the consequence a non-technical owner cares about>
**Intent-match confidence**: high | medium | low — because <one plain clause>

<details — technical evidence, commands, verdicts, file paths — for agents and the curious>
```

The plain-English opening is not a courtesy summary; it is a drift detector. If the orchestrator cannot state what the product gains from the current work in those three lines, that is tripwire 4 (`../review/intent-audit.md`) and an intent audit fires.

Routine mechanical entries (dispatch/return/commit lines) stay as one-liners; the format applies to entries where something was decided or judged.

### Sections

- **Header**: run name, tier, intent contract path, mode, started timestamp.
- **Calibration**: proposed tier, rationale, owner response, riskiest assumption and its spike (or why none).
- **Promise log**: one section per promise — items dispatched, checks, walkthrough narrative quote, gate result.
- **Suppressed check-ins**: `[CHECKIN-SUPPRESSED]` entries in the format above.
- **Course corrections and breakglass**: what changed against defaults and why.
- **Hard-blocks**: `[HARD_BLOCK]` entries, only if any.
- **Closeout**: promise roll-up, cost against budget, follow-ups flagged, retro pointer.

**Template**: `_shared/templates/EXECPLAN.md`.

## Retro (`RUNS.md`)

At closeout, append a retro entry to the repo's `RUNS.md` (create it on first run; template: `_shared/templates/RUNS.md`): what ceremony paid for itself, what didn't, which tripwires fired, what the auditor caught or missed, and lessons that generalise. This is how the next run starts smarter than this one.

## Recovery protocol

On any new turn after a compaction or session restart, the orchestrator:

1. Reads `tasks/STATE.json` (including `directive`). If `mode` is `complete` or `hard_blocked`, the run is over — surface the final summary or the block.
2. Reads `tasks/INTENT.md`.
3. Reads the tail of the execplan (last ~100 lines).
4. Reconciles `agent_pool.threads` per `agent-lifecycle.md`.
5. Resumes from `next_action` only after reconciliation.
6. Does **not** re-derive state from ledger scans or `git log` unless `STATE.json` is missing or malformed (hard-block 8).

## Atomic updates

`STATE.json` writes should be atomic to survive interruption mid-update: write `tasks/STATE.json.tmp`, then rename over `tasks/STATE.json`. The orchestrator does not need to implement this manually if it writes the full JSON in a single tool call (which is the default).
