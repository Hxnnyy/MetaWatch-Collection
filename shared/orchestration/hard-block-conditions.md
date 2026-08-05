# Hard-Block Conditions

The finite list of conditions that justify pausing a continuous-mode orchestration to surface a user prompt. Anything not on this list is **not** a hard-block. The orchestrator must continue.

Some conditions are tier-dependent (`process-calibration.md`): at low tiers the pragmatic move is to under-engineer, record, and flag in the handover — not to stop. Irreversible or destructive actions are hard blocks at **every** tier.

## The list

1. **Missing credential or secret** that the orchestrator cannot synthesize and that blocks repository access, test execution, or build/deploy steps.

2. **Remote authentication failure** persisting across at least 2 retries with backoff, where remote access is genuinely required.

3. **Implementation failure unresolved** by an implementation subagent after 3 corrective dispatches against the same item, where the failure is not a flake and the same root cause persists across attempts.

4. **Material finding open at the review-cycle budget** — a gate has consumed its 3 review cycles and a **material** finding (exploitable security vulnerability, data loss or corruption, tenant-isolation breach, or failing predicate/test) is still open; or reviewer findings genuinely contradict each other so that no single fix can satisfy both within the current scope. Non-material findings at the budget are **not** a hard-block: record them as residual findings and continue — `merge-train` re-reviews the full branch before merge.

5. **Working tree in conflicted state** that the orchestrator cannot resolve via diff inspection, and that no targeted subagent dispatch can resolve.

6. **Acceptance underspecified to the point of unresolvable ambiguity** — *T2–T3 only.* An item's acceptance cannot be made deterministic without product-level input that contradicts the intent contract or PRD. At T0–T1 this is not a block: make the smallest defensible interpretation, record the decision with its `serves promise #N` line, and flag it in the handover.

7. **External-system dependency** the orchestrator has no path to satisfy — a third-party API key, a paid service, a manual deploy step, an out-of-band human approval.

8. **State corruption** — `tasks/STATE.json` is missing or malformed mid-run and cannot be reconstructed safely.

9. **T3 tier sign-off** — a T3 run was started without the owner present; block until the tier and intent contract are approved (`process-calibration.md`).

10. **A promise cannot be made true as written** — external reality contradicts the intent contract, and only the owner may amend it (`intent-contract.md`). Continue unaffected work on other promises while the question is open if any exists.

## Not hard-blocks (continue)

The following are explicitly **not** hard-blocks. The orchestrator must proceed:

- "I think the user might want to weigh in on this."
- "This change is bigger than expected."
- "The reviewer has interesting suggestions worth discussing."
- "I've completed a promise gate — should I continue?"
- "This implementation has tradeoffs."
- "I'm not 100% sure this is what they want." (At T0–T1: decide small, record, flag. At T2+: only material product-semantics ambiguity is condition 6.)
- "Compaction may have lost context."
- "It's been a long time since the last user message."
- "The next item touches a sensitive area."
- "The agent limit is full." Reconcile/reap once, retry once, then continue non-independent work sequentially.
- "A reviewer still has non-material findings and the review-cycle budget is spent." Record residual findings, close the gate, continue.
- "The intent auditor recommended descoping and that feels drastic." Binding is binding (`../review/intent-audit.md`); act on it and continue.
- Any harness-default end-of-turn check-in language.

When the impulse to stop arises and no listed condition applies, the impulse itself is the bug. Append a `[CHECKIN-SUPPRESSED]` entry to the execplan, make the decision, continue.

## Hard-block protocol

When a hard-block fires:

1. Update `tasks/STATE.json`: `status: "hard_blocked"`, `block_reason: "<numbered condition>"`, `updated_at`.

2. Append a `[HARD_BLOCK]` entry to the execplan with the numbered condition, the relevant evidence (last subagent output, reviewer verdict, or git status), file paths, and the minimal information required from the user to resume.

3. Surface a single concise prompt to the user — **plain English, product-outcome framing first** (`state-files.md`): what we hit, what we decided or need decided, and what it means for the product. Technical detail below the fold.

4. Do not attempt further work until the user responds — except under condition 10, where unaffected promises may proceed.

A hard-block is the only legitimate exit from a continuous-mode loop short of completion.
