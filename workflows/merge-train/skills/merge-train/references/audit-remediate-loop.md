# Audit Remediate Loop

Each child must survive a strict audit, adjudication, remediation, and fresh verification loop before it integrates into the parent branch.

## Loop

1. Freeze child diff and parent intent for the audit.
2. Inspect local context, repo standards, child diff, tests, and surrounding code.
3. Apply `strict-review-bar.md`. The auditor returns verdict-schema findings with file/line evidence and, for each blocking finding, its named consequence.
4. **Adjudicate.** The orchestrator dispositions every finding — `fix-now`, `follow-up`, `residual-risk`, or `rebutted` (with file/line evidence, recorded in the ledger's dispositions table) — before dispatching any remediation. Findings are advisory until dispositioned; only `fix-now` reaches the remediator. The audit trail explains every non-fix.
5. Remediate `fix-now` findings within child scope. Each remediation is a narrow correction or a regression check; a remedy that would grow net complexity goes back to adjudication as a `follow-up` proposal instead.
6. Run configured tests and predicates.
7. Dispatch a fresh verifier that receives the remediated diff, the evidence, and the dispositions table — not the remediator's confidence. A `rebutted` finding returns only with new evidence; re-raising it without any is a proportionality finding.
8. Repeat. A cycle that produces no `fix-now` dispositions ends the loop: disposition the remainder, record, and proceed to integration. The hard cap is **3 audit-remediate cycles per child**.

## Cycle 2 tripwire

A child consuming its second cycle dispatches the intent auditor alongside the remediation — the proportionality seat judges whether the loop is still fixing consequences or has started manufacturing work. Verification dispatches exceeding the implementation dispatches they check, for one child or across the train, fires the same tripwire.

## At the cap

An open finding is **material** only if it is an exploitable security vulnerability, data loss or corruption, a tenant-isolation breach, or a failing predicate/test.

- A material finding open at the cap holds the child for owner disposition: list it in `CHILD_PR_REPORT.md` and the child completion comment.
- Every other open finding — including one whose raw record says `blocking: true` — is dispositioned `residual-risk` or `follow-up`, recorded, and the child integrates with outcome `closed_with_residuals`. Raw verdicts are never rewritten; the dispositions table is the separate decision record.

## Risk Handling

- Low: combined auditor/remediator is acceptable; fresh verifier still required.
- Medium: auditor/remediator may be combined; verifier must be separate.
- High: auditor, remediator, and verifier should be separate roles; parent checkpoint required after merge.
- Critical: hard block or explicit owner signoff unless config permits autonomous handling.

## Blocking Categories

- Acceptance or parent intent not met.
- Tests, predicates, or checks fail.
- Security/data/trust-boundary risk.
- Public contract drift.
- Structural regression with a named consequence under the strict review bar.
- Inadequate tests for changed behavior.
- Documentation or operator guidance now misleading.

## Completion

Write or update `CHILD_PR_REPORT.md`, post the child completion comment, update the ledger — including its dispositions table — and the risk register, and only then integrate according to repo policy.
