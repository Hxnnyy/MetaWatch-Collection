# Reviewer Protocol

Canonical rules for dispatching reviewers and interpreting verdicts. Reviewers are advisory-only — they inspect and report. They do not edit files.

Gates attach to promises, not waves (`../orchestration/promise-gates.md`). Everywhere this protocol says "gate" it means a promise gate or the final closeout.

## Reviewer roster

Canonical reviewers, by domain (full descriptions: `reviewer-personas.md`):

- `implementation-reviewer` — code quality, structure, type boundaries, architecture coherence, test coverage and integrity, AI shortcut patterns.
- `security-reviewer` — auth, authorization, user data, secrets, RLS, dependencies, trust boundaries.
- `product-reviewer` — UI, UX, accessibility, copy, product semantics, operator docs, doc drift.
- `operations-reviewer` — deployment, startup, config, runtime wiring, performance, scalability.
- `intent-auditor` — the run against the intent contract; dispatched per `intent-audit.md`, not per this protocol's risk routing.

If the harness supports named-agent dispatch, use it. If not, load the canonical reviewer prompt from the harness's agent-prompt directory and pass it to a generic subagent task. Both paths are acceptable; the contract is the verdict, not the dispatch mechanism.

## Risk routing

Only reviewers whose domain the gate's items touch are dispatched:

- `implementation-reviewer`: any gate with `production-transferable` code.
- `security-reviewer`: `security` risk tag, or diffs touching auth/data/secrets/trust boundaries.
- `product-reviewer`: `design`/`docs` risk tags, or user-facing surface changes.
- `operations-reviewer`: `performance` risk tag, or deployment/config/runtime changes.

A gate whose items are all `dogfood-disposable` or `spike` gets **no reviewer panel** — its gate is the walkthrough (plus intent audit at T2+). Reviewing disposable code is a proportionality finding, not diligence.

## Verdict schema

Every reviewer must return exactly this JSON shape (also in `verdict-schema.md`):

```json
{
  "reviewer": "persona-or-model-alias",
  "scope": "item | promise gate | final closeout",
  "verdict": "PASS | PASS_WITH_NOTES | BLOCKED | NOT_APPLICABLE",
  "blocking_count": 0,
  "findings": [
    {
      "severity": "critical | high | medium | low | note",
      "blocking": true,
      "title": "short finding title",
      "evidence": ["file:line", "command output", "diff hunk"],
      "explanation": "why this matters",
      "required_resolution": "what must change before closure"
    }
  ],
  "predicate_adequacy": "adequate | inadequate | disproportionate | not_applicable",
  "test_adequacy": "adequate | inadequate | not_applicable",
  "governance_flags": [],
  "residual_risks": [],
  "recommended_next_action": "continue | remediate | rerun_tests | course_correction | hard_block"
}
```

The intent auditor extends this schema with intent fields — see `intent-audit.md`.

### Invariants

- `blocking_count` MUST equal the number of `findings` entries with `blocking: true`.
- `verdict == "BLOCKED"` IFF `blocking_count > 0`.
- `verdict == "PASS"` IFF `blocking_count == 0` AND `findings` is empty.
- `verdict == "PASS_WITH_NOTES"` IFF `blocking_count == 0` AND `findings` is non-empty with `blocking: false`.
- `verdict == "NOT_APPLICABLE"` IFF the reviewer's domain is genuinely not touched.
- `predicate_adequacy == "inadequate"` is blocking on `production-transferable` items. `disproportionate` routes to a descope proposal per `../verification/predicate-adequacy-review.md` — it is acted on, not filed.

If a reviewer returns malformed JSON, re-dispatch once with an explicit "return only the schema" instruction. A second malformed return is treated as `BLOCKED` with a synthetic finding "reviewer output unparseable". Use the same reviewer thread for that one correction when possible. Once a valid or final malformed verdict is stored, mark the result consumed and close the reviewer per `../orchestration/agent-lifecycle.md`.

## Gate closure

A promise gate closes when (see `../orchestration/promise-gates.md` for the full composition):

- the walkthrough holds;
- every required reviewer is in `{PASS, PASS_WITH_NOTES, NOT_APPLICABLE}`;
- the intent audit (T2+) is not `misaligned`.

`PASS_WITH_NOTES` is allowed at promise gates only for non-structural, low-risk cleanup. Record each note in the execplan and resolve before final closeout (or convert to a follow-up ledger item if genuinely out-of-scope). A structural `PASS_WITH_NOTES` finding (architecture, type system, security boundary, public-API surface) escalates to `BLOCKED` and is fixed within the gate.

A gate may also close with its review-cycle budget exhausted and only residual (non-material) findings open, per the budget rules below. Material findings never close a gate this way — they hard-block.

## Final-closeout closure

The run closes when, for every required final reviewer:

```
verdict ∈ {PASS, NOT_APPLICABLE} AND blocking_count == 0
```

plus the end-to-end walkthrough and a final `aligned` intent audit. `PASS_WITH_NOTES` is **not accepted at final closeout** — treated as `BLOCKED` and fixed, or the notes convert to follow-up items *before* the final panel runs.

The final panel has the same 3-cycle budget as any gate. At the budget with only non-material findings open: record them as residual findings, convert genuinely out-of-scope ones to follow-up items, and close — `merge-train` re-reviews the full branch pre-merge and is the designated backstop.

## Iterate-on-blocked

When any reviewer returns `BLOCKED`:

1. Dispatch a corrective implementation subagent with the structured `findings` as input.
2. The implementer addresses each blocking finding with a concrete change.
3. Re-run the affected checks.
4. Commit the fix referencing the gate.
5. Re-dispatch the affected reviewer(s); re-run the full panel only if the fix is cross-cutting.
6. Loop until closure conditions are met or the review-cycle budget is exhausted.

### Review-cycle budget (hard limit)

A **review cycle** is one reviewer dispatch against a gate — full panel or any subset, including re-runs and re-verifications — plus the remediation that follows it. Every gate (each promise gate, and the final panel) has a hard budget of **3 review cycles**. The initial review is cycle 1; at most two remediate-and-re-review rounds follow.

Counting rules:

- The budget counts per gate, not per reviewer.
- Renaming a panel does not reset the budget. A "fresh", "final", "release", "zero-blocker", or otherwise relabelled re-verification of the same gate counts against the same budget of 3. Fresh eyes consume cycles; they never mint them.
- Track the count in `STATE.json` at `promises[].gate.review_cycles` and log each cycle in the execplan.
- A gate consuming its second cycle is tripwire 1 (`intent-audit.md`) — the audit runs before the third cycle is spent.

When the budget is exhausted, the gate settles on the evidence in hand:

- An open finding is **material** only if it is an exploitable security vulnerability, data loss or corruption, a tenant-isolation breach, or a failing predicate/test. A material finding open at the budget fires hard-block 4.
- Every other open finding — including `blocking: true` findings — is downgraded to a **residual finding**: record it in the execplan, then close the gate and continue. `merge-train` is the pre-merge backstop.
- Dispatching a fourth cycle against a gate is a protocol violation regardless of what the panel is called.

## No rationalising findings

The orchestrator must not rationalise away reviewer findings. If a finding is genuinely incorrect:

1. Document the rebuttal with file/line code evidence in the execplan.
2. Note the rebuttal in `STATE.json` under the gate's reviewer entry.
3. Mark the finding resolved with rebuttal-acceptance.

Do not silently drop findings. The audit trail must explain every non-fix. (Binding intent-audit descope verdicts are not "findings to rationalise" — they are decisions to implement; see `intent-audit.md`.)

## Reviewer dispatch payload

Each reviewer dispatch includes:

- The canonical reviewer prompt (or named-agent dispatch).
- The intent contract (`INTENT.md`) and the promise under review.
- The ledger items in scope, with rigour classes.
- Delivery Governance section.
- Standards source (`docs/DeliveryStandards.md` or equivalent).
- Commit range or file list under review.
- Test commands and results; check run summaries.
- The walkthrough narrative for the promise.
- Explicit instruction: advisory-only, do not edit files.
- Explicit instruction: `Delegation budget: 0. Do not spawn subagents.`
- Explicit instruction: return only the verdict schema, nothing else.
- For final closeout: verify from the codebase, not from implementation reports; `PASS_WITH_NOTES` is not accepted (mapped to `BLOCKED`).
