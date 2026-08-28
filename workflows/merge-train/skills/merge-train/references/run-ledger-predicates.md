# Run-Ledger Predicates

Mechanical bookkeeping checks over a run's durable record, executed at closeout. They are the third predicate layer, distinct from the other two:

| Layer | Question it answers | Contract |
|---|---|---|
| Promise-level acceptance | Does the running product show the promise is true? | `acceptance-predicates.md` |
| Item-level checks | Did this item meet its criteria? | `acceptance-predicates.md` |
| **Run-ledger predicates** | **Does the paper trail actually exist?** | this file |

## Why a third layer

The recurring closeout failures in real runs are not quality failures — they are bookkeeping failures that survive every quality gate: a review recorded as run whose verdict artifact is a stub, a declared check with no run record, a fix closed without evidence the fix reached the surface it fixed, and deferred work whose ticket was never filed. Each of these recurred **after** the lesson about it was written into a retro. Prose does not hold this class; existence checks do.

The boundary is strict: **run-ledger predicates assert existence, structure, and run-records — never quality.** Whether a verdict is *right* belongs to reviewers and auditors. Whether the verdict *exists as a complete record* belongs here. A predicate in this file that starts judging content quality is scope creep; remove it.

## The suite

Run `node templates/run-ledger-predicates.mjs --run-dir tasks` from the repository root (the directory containing the run's `tasks/` tree). Exit code 0 means every applicable predicate passed; non-zero blocks closeout like any hard gate. Predicates that do not apply to the run's tier or state report `SKIP`, never silently pass.

| ID | Predicate | Catches |
|---|---|---|
| RL1 | `STATE.json` exists and parses with a recognised schema version | corrupted or reconstructed state |
| RL2 | Every recorded raw reviewer verdict is a complete verdict object (reviewer, scope, verdict enum, findings array) | stub verdict artifacts — a review "launched" is not a review run |
| RL3 | Every applied disposition references an existing raw verdict id and finding index | dispositions detached from evidence |
| RL4 | Every `verified` promise carries `verified_at`, non-empty evidence references, and non-empty scope | verification claimed without a record |
| RL5 | Every `closed` ledger item has a non-empty `check` and non-empty `evidence`; every `cancelled` item has a reason in `notes` | declared checks with no run record |
| RL6 | A `complete` run has a full `final_closeout` block, a walkthrough that `holds`, and a retro file that exists and is non-trivial | closure without a durable closeout record |
| RL7 | Path-like evidence references resolve to existing, non-empty files | evidence pointers to nothing |
| RL8 | Committal deferral phrases ("deferred to a follow-up", "outside this ticket", "needs a follow-up") in the execplan, ledger notes, disposition rationales, and residual-risk dispositions name a ticket reference or an explicit `no-ticket: <reason>` waiver on the same line. Bare vocabulary ("nothing deferred", a "Follow-ups" heading) does not fire | deferred work whose ticket was never filed |
| RL9 | The execplan calibration section records `Retro reviewed: <ref>` (or `first-run`) | calibrating without reading the previous run's lessons |
| RL10 | An intent contract marked `Live-defect: yes` closes only with a `production-readback:` evidence reference | a live fix closed while production still serves the bug |

## Conventions the suite relies on

- **Ticket references** (RL8): a tracker id (`ABC-123`), an issue number (`#123`), a ledger item (`ledger: LF-014`), or a binding-action id (`B-003`). The waiver `no-ticket: <reason>` is always accepted — the predicate forces the *decision* to be explicit, not the ticket to exist.
- **Calibration marker** (RL9): the orchestrator already reads the latest `RUNS.md` retro before calibrating; this line makes that read assertable. `Retro reviewed: first-run` is valid when no retro exists.
- **Live-defect marker** (RL10): an intent contract whose promises fix a defect currently serving users adds one line, `Live-defect: yes`. Closure then requires an evidence reference prefixed `production-readback:` pointing at the post-deploy re-check. Runs without the marker skip RL10 entirely.
- **Scan mode**: `--scan <file-or-dir>...` runs only RL8 over arbitrary deliverable files. `merge-train` uses this over its final packet, integration ledger, and child summaries, where deferral language is a promise to the future and must carry its ticket.

## Failure handling

A run-ledger failure at closeout is a hard block on completion, not a review finding: fix the record (file the ticket, attach the evidence, complete the verdict) or, where the record cannot be honestly completed, record the gap explicitly through the breakglass log and the retro. Editing a predicate to make it pass is the same tripwire as editing an item check silently.
