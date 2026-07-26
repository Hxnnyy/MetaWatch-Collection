# State Files

Three on-disk artifacts that survive context compaction and let the orchestrator resume cleanly. State on disk is the single source of truth; in-context summaries are derivative.

## `tasks/CONTINUOUS_DIRECTIVE.md`

A short rules brief that the orchestrator re-reads at the start of every batch loop iteration.

**Purpose**: a structural beat that re-injects the continuous-mode contract into context regardless of compaction state.

**Lifecycle**:
- Written when continuous mode activates (Phase 0 in `issues-execution`).
- `mode` field is updated on exit (`complete`, `hard_blocked`, `interactive_override`).
- Not deleted on completion — kept as part of the audit trail.

**Template**: `_shared/templates/CONTINUOUS_DIRECTIVE.md`.

## `tasks/STATE.json`

A machine-readable snapshot of orchestration state, updated after every meaningful event.

**Purpose**: post-compaction recovery without re-deriving from `gh issue list` or `git log`. The orchestrator's `next_action` field is the resume point.

**Updated on**: wave start/end, child status changes, reviewer verdicts, agent dispatch/return/close/reconciliation, and hard-block fire.

**Template**: `_shared/templates/STATE.json`.

### Schema

```jsonc
{
  "schema_version": "metawatch-longflow-2.1",
  "mode": "continuous | interactive | complete | hard_blocked | interactive_override",
  "status": "in_progress | complete | hard_blocked",
  "parent_prd": <issue-number>,
  "child_issues": [
    {
      "number": <issue-number>,
      "wave": <integer>,
      "status": "pending | in_progress | implemented | predicate_passed | reviewed | closed",
      "predicate_script": "scripts/verify-issue-<n>.sh",
      "predicate_last_exit": <integer | null>,
      "commit_sha": <string | null>,
      "files_owned": [<string>]
    }
  ],
  "current_wave": <integer>,
  "next_action": "phase_0_prepare_state | dispatch_wave_<N> | run_predicate_<n> | dispatch_reviewer_<wave>_<reviewer> | close_child_<n> | final_audit | close_parent | hard_block_<reason>",
  "agent_pool": {
    "max_threads": <integer>,
    "reserved_slots": 2,
    "last_reconciled_at": <ISO-8601 | null>,
    "threads": [
      {
        "agent_id": <string>,
        "role": "implementer | predicate-author | corrective | reviewer",
        "scope": <string>,
        "status": "running | returned | interrupted | close_failed | closed",
        "result_consumed": <boolean>,
        "close_attempts": <integer>,
        "spawned_at": <ISO-8601>,
        "closed_at": <ISO-8601 | null>
      }
    ]
  },
  "waves": [
    {
      "number": <integer>,
      "issues": [<issue-number>],
      "parallel_group": [<issue-number>],
      "sequential_tail": [<issue-number>],
      "required_reviewers": [<reviewer-name>],
      "status": "pending | dispatched | implemented | reviewed | closed",
      "started_at": <ISO-8601 | null>,
      "closed_at": <ISO-8601 | null>
    }
  ],
  "reviewer_verdicts": {
    "wave_<N>": {
      "review_cycles": <integer>,   // reviewer dispatches consumed against this gate; hard budget 3, shared by all panels however named
      "<reviewer-name>": {
        "verdict": "PASS | PASS_WITH_NOTES | BLOCKED | NOT_APPLICABLE",
        "blocking_count": <integer>,
        "iterations": <integer>,
        "rebuttals": [<string>],
        "last_run_at": <ISO-8601>
      }
    },
    "final": { /* same shape, keyed by reviewer-name */ }
  },
  "commits": [
    {
      "sha": <string>,
      "issue": <issue-number | null>,
      "wave": <integer | null>,
      "kind": "predicate-scaffold | implementation | review-fix | cleanup",
      "message": <string>
    }
  ],
  "block_reason": <string | null>,
  "started_at": <ISO-8601>,
  "updated_at": <ISO-8601>
}
```

The template file is valid JSON with empty/null defaults; this schema doc describes the populated shape.

## `tasks/<YYYY-MM-DD>-<slug>-execplan.md`

A narrative log of orchestration events. Append-only, human-readable.

**Purpose**: human-readable audit trail; primary durable evidence for what the orchestrator decided and why.

**Sections**:

- **Header**: parent PRD, child range, mode, started timestamp, state-file paths.
- **Continuous-mode contract summary**: mandatory at top. Re-read at the start of every batch iteration.
- **Wave log**: one entry per wave with subagent dispatches, returns, predicate results, commits, reviewer verdicts.
- **Suppressed check-ins**: entries starting `[CHECKIN-SUPPRESSED]`. Each captures a question the orchestrator was about to ask, the decision made instead, and the reasoning.
- **Hard-blocks**: entries starting `[HARD_BLOCK]`, only if any. Each cites the numbered condition.
- **Final closeout**: reviewer verdicts, predicate roll-up, parent PRD close confirmation.

**Template**: `_shared/templates/execplan.md`.

## Recovery protocol

On any new turn after a compaction or session restart, the orchestrator:

1. Reads `tasks/CONTINUOUS_DIRECTIVE.md` if present. If `mode: complete` or `hard_blocked`, the run is over — surface the final summary or the block.
2. Reads `tasks/STATE.json`.
3. Reads the tail of the execplan (last ~100 lines) to reconstruct recent decisions.
4. Reconciles `agent_pool.threads` per `agent-lifecycle.md`, persisting returned results and reaping consumed threads.
5. Resumes from `STATE.json`'s `next_action` field only after reconciliation.
6. Does **not** re-derive state from `gh issue list` or `git log` unless `STATE.json` is missing.

If `CONTINUOUS_DIRECTIVE.md` is present but `STATE.json` is missing or malformed, this is hard-block condition 8 (state corruption). Surface to the user; do not attempt recovery.

## Atomic updates

`STATE.json` writes should be atomic to survive interruption mid-update:

1. Write to `tasks/STATE.json.tmp`.
2. Rename `tasks/STATE.json.tmp` → `tasks/STATE.json`.

Most filesystems guarantee rename atomicity. The orchestrator does not need to implement this manually if it writes the full JSON in a single tool call (which is the default).
