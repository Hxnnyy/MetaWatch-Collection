# Test Adequacy Review

Test adequacy review checks whether the test evidence supports the closure claim.

## Reviewer Questions

- Would at least one test have failed before the change?
- Are integration paths covered where behavior depends on wiring?
- Are negative/error paths covered for risky code?
- Did remediation add tests for discovered defects?
- Were tests skipped, narrowed, deleted, or made less meaningful?

## Inadequate Test Handling

If tests are inadequate, closure is blocked until the contract is strengthened or an amber-level residual-risk acceptance is recorded.
