# State Files

The durable artifacts that survive context compaction and let the orchestrator resume cleanly. State on disk is the single source of truth; in-context summaries are derivative.

The canonical set is deliberately small — four artifacts, no more:

| Artifact | Role |
|---|---|
| `tasks/INTENT.md` | The intent contract — promises, non-goals, product class. Owner-amendable only. See `intent-contract.md`. |
| `tasks/STATE.json` | Machine-readable orchestration snapshot, including the continuous directive. |
| `tasks/ledger/<ID>.json` | One file per work item. See `ledger.md`. Required at T1+; T0 creates no Longflow files. |
| `tasks/<YYYY-MM-DD>-<slug>-execplan.md` | Append-only human trace, plain-English first. |

Historical artifacts `CONTINUOUS_DIRECTIVE.md` and `HEARTBEAT.md` are retired: the directive lives in `STATE.json.directive`, and modern harnesses' native persistence made the heartbeat file and watcher redundant. If you find them in an old run, read them once for context and migrate.

## `tasks/STATE.json`

**Purpose**: post-compaction recovery with evidence-relative promise truth and the operative judgement that produced it. `next_action` is the resume point.

**Updated on**: item or promise transitions, evidence-freshness changes, reviewer verdicts and dispositions, operative judgement changes, tier or breakglass decisions, tripwire or hard-block fires, agent-registry transitions, checkpoints, and final closeout.

**Template**: `_shared/templates/STATE.json`.

### Schema

```jsonc
{
  "schema_version": "metawatch-longflow-4.0",
  "state_version": 1,
  "checkpoint_id": "run-local checkpoint id | null",
  "last_managed_commit": "full git SHA observed at the latest managed update | null",
  "mode": "continuous | interactive | complete | hard_blocked | interactive_override",
  "status": "in_progress | complete | hard_blocked",
  "directive": "the continuous-mode contract in two or three sentences — re-read at every promise gate and on every resume",
  "tier": "T1 | T2 | T3",
  "intent_authority": "tasks/INTENT.md",
  "prd": "<T2+ path, ledger id, or issue number | null at T1>",
  "promises": [
    {
      "number": 1,
      "summary": "short restatement of the promise",
      "status": "open | in_progress | verifying | verified | needs_recheck",
      "evidence": {
        "verified_at": "<ISO-8601 | null>",
        "verified_at_sha": "<full git SHA | null>",
        "references": ["commands, walkthroughs, audit records, or durable artifact pointers"],
        "scope": ["exact/file.ext", "directory-prefix/"]
      },
      "dirty_since_sha": "<full git SHA | null>",
      "gate": {
        "walkthrough": "pending | holds | does_not_hold | cannot_walk",
        "intent_audit": "pending | aligned | drifting | misaligned | n/a",
        "review_cycles": 0,
        "review_outcome": "pending | passed | closed_with_residuals",
        "raw_reviewer_verdicts": [
          {
            "id": "RV-001",
            "cycle": 1,
            "recorded_at": "<ISO-8601>",
            "verdict": { "complete verdict-schema.md object, unchanged": true }
          }
        ],
        "applied_dispositions": [
          {
            "verdict_id": "RV-001",
            "finding_index": 0,
            "action": "fix-now | follow-up | residual-risk | rebutted",
            "rationale": "what the orchestrator actually did and why",
            "applied_at": "<ISO-8601>"
          }
        ]
      }
    }
  ],
  "active_decisions": [
    {
      "id": "D-001",
      "decision": "the operative choice",
      "serves_promise": 1,
      "because": "why it serves that promise",
      "recorded_at": "<ISO-8601>"
    }
  ],
  "open_assumptions": [
    {
      "id": "A-001",
      "assumption": "the unproven belief still shaping work",
      "serves_promise": 1,
      "validation": "how it will be tested",
      "recorded_at": "<ISO-8601>"
    }
  ],
  "binding_actions": [
    {
      "id": "B-001",
      "source": "owner | intent-auditor | gate",
      "action": "the action that must survive handoff",
      "serves_promise": 1,
      "status": "open | completed | superseded",
      "recorded_at": "<ISO-8601>"
    }
  ],
  "residual_risks": [
    {
      "id": "R-001",
      "risk": "what remains uncertain after a decision or gate",
      "serves_promise": 1,
      "disposition": "accepted boundary, follow-up, or reopening condition",
      "recorded_at": "<ISO-8601>"
    }
  ],
  "final_closeout": {
    "completed_at": "<ISO-8601>",
    "walkthrough": "holds",
    "intent_audit": "aligned | n/a",
    "review_outcome": "passed | closed_with_residuals | n/a",
    "evidence_references": [],
    "retro_reference": "RUNS.md entry"
  },
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

The template file is valid JSON with empty/null defaults; this schema doc describes the populated shape. T0 creates no durable state, so its tier is intentionally absent from the durable enum.

### Snapshot identity

- `schema_version` identifies the contract. Version 4 adds evidence-relative promise truth and operative judgement.
- `state_version` starts at `1` and increments on every successful managed write. It detects stale handoffs; it is not an event log.
- `checkpoint_id` names the latest meaningful item, gate, override, or closeout boundary. Change it when that boundary changes, not for prose-only execplan entries.
- `last_managed_commit` is the repository `HEAD` observed during the latest managed write, or `null` when no commit exists. It is a recovery sanity check, not promise evidence.

### Promise lifecycle and evidence

The lifecycle is exact:

- `open`: no funded implementation has begun.
- `in_progress`: implementation is changing the promise's product path.
- `verifying`: the runnable path may hold and its gate is underway.
- `verified`: the gate closed against the recorded evidence. This is current evidence, never permanent truth.
- `needs_recheck`: later or unresolvable in-scope change may have invalidated that evidence.

Normal progress is `open` → `in_progress` → `verifying` → `verified`. A verified promise moves to `needs_recheck` when later in-scope work changes or obscures its evidence, then to `verifying` when re-verification begins. Re-verification replaces the verification metadata and clears `dirty_since_sha`.

`verified_at` records when the gate closed. `verified_at_sha` anchors the evidence to a commit; `null` means the evidence is working-tree-relative and freshness cannot be proven across an unknown workspace change. `references` names the actual commands, walkthroughs, audits, or artifacts supporting the claim. `dirty_since_sha` is the earliest known commit boundary after which an in-scope difference exists; for an uncommitted difference, record the current `HEAD` and name the working-tree evidence in `references`.

Every `scope` entry is either an exact repo-relative file path such as `package.json` or a repo-relative directory prefix with a trailing `/` such as `shared/orchestration/`. Use `/` separators. Absolute paths, `.`/`..` segments, and globs are invalid. A changed path is in scope when it exactly equals a file entry or starts with a directory-prefix entry. An in-scope change moves the promise to `needs_recheck`; a change outside its scope lets it remain `verified`.

### Durable judgement and gate records

`active_decisions`, `open_assumptions`, `binding_actions`, and `residual_risks` are the current operative judgement of the run, not an event log. Give each entry a stable id. When a decision or assumption stops being operative, record why in the append-only execplan before removing it from the active/open array. Every decision and assumption names the promise it serves. A binding action stays open until completed or explicitly superseded by an authority allowed to do so.

Gate records separate evidence from orchestration judgement. Append every complete reviewer output to `raw_reviewer_verdicts` exactly as returned; those records are immutable. Record what the orchestrator actually did in `applied_dispositions`, referring to the raw verdict id and finding index. Normal closure records `review_outcome: passed`; only the documented budget-exhaustion branch records `review_outcome: closed_with_residuals`.

Raw verdict ids are unique within a gate. Every applied disposition must reference an existing raw verdict id and an existing finding index in that verdict; a duplicate id or dangling reference makes the snapshot invalid.

`final_closeout` remains `null` until the tier-scaled end-to-end closeout has passed and the retro is durable. Its evidence references are non-empty and point to the whole-journey walkthrough, final audit and panel where required, full checks, and retro rather than copying those artifacts into state. T2–T3 require `intent_audit: aligned` and `review_outcome: passed | closed_with_residuals`; T1 may use `n/a`. `retro_reference` is an exact safe repo-relative file path, and that file must exist before the run is complete.

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

The plain-English opening is not a courtesy summary; it is a drift detector. If the orchestrator cannot state what the product gains from the current work in those three lines, that is tripwire 4 (`intent-audit.md`) and an intent audit fires.

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

Creating a missing state file is permitted only during a new run's initial calibrated preparation. Once execution has begun, a missing or malformed snapshot is state corruption, not an invitation to reconstruct it.

On any new turn after a compaction or session restart, the orchestrator:

1. Reads `tasks/STATE.json` in full, including snapshot identity, `directive`, promises, and durable judgement. If `mode` is `complete` or `hard_blocked`, the run is over — surface `final_closeout` or the block.
2. Reads `tasks/INTENT.md` and the tail of the execplan (last ~100 lines).
3. Adopts `active_decisions`, `open_assumptions`, `binding_actions`, and `residual_risks` as the operative judgement for the resumed run. It does not re-derive those judgements from the ledger or `git log`.
4. Checks evidence freshness against each verified promise's `verified_at_sha` and `scope`. Later in-scope changes move it to `needs_recheck`; changes outside the scope let it remain `verified`. A null or unavailable evidence revision makes freshness indeterminate and must be surfaced in the resume context rather than guessed.
5. Reconciles `agent_pool.threads` per `agent-lifecycle.md`.
6. Resumes from `next_action` only after reconciliation and any required recheck transition.

The ledger can confirm item detail and git can compare evidence revisions, but neither is a substitute for the decisions and assumptions already recorded in state. Missing or malformed `STATE.json` on resume or mid-run fires hard-block 8 rather than inviting reconstruction.

## Atomic updates

`STATE.json` writes should be atomic to survive interruption mid-update: increment `state_version`, update `checkpoint_id`, write `tasks/STATE.json.tmp`, then rename over `tasks/STATE.json`. The orchestrator does not need to implement the temporary file manually if it writes the full JSON in a single atomic tool call.
