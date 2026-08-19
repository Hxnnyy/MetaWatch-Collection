# Audit Remediate Loop

Each child must survive a strict audit, remediation, and fresh verification loop before it integrates into the parent branch.

## Loop

1. Freeze child diff and parent intent for the audit.
2. Inspect local context, repo standards, child diff, tests, and surrounding code.
3. Apply `strict-review-bar.md`.
4. Return blocking findings with file/line evidence.
5. Remediate blockers within child scope.
6. Run configured tests and predicates.
7. Dispatch a fresh verifier that receives the remediated diff and evidence, not the remediator's confidence. For high and critical risk children, the verifier's signoff names the change's load-bearing safety fact at rung 4 of the strict-review-bar evidence ladder — ran it, output in the child report — or records it as unproven.
8. Repeat, capped at **3 audit-remediate cycles per child**. At the cap, stop looping: list the open blockers in `CHILD_PR_REPORT.md` and the child completion comment, and hold the child for owner disposition instead of dispatching further cycles.

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
- Structural regression under the strict review bar.
- Inadequate tests for changed behavior.
- Documentation or operator guidance now misleading.

## Completion

Write or update `CHILD_PR_REPORT.md`, post the child completion comment, update ledger/risk register, and only then integrate according to repo policy.
