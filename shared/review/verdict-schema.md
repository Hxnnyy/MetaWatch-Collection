# Verdict Schema

Use this shape for reviewer outputs. Invariants and handling: `reviewer-protocol.md`. The intent auditor extends this shape with intent fields: `intent-audit.md`.

```json
{
  "reviewer": "persona or model alias",
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
      "required_resolution": "what must change before closure",
      "disposition": "fix-now | follow-up | residual-risk | rebutted"
    }
  ],
  "predicate_adequacy": "adequate | inadequate | disproportionate | not_applicable",
  "test_adequacy": "adequate | inadequate | not_applicable",
  "governance_flags": [],
  "residual_risks": [],
  "recommended_next_action": "continue | remediate | rerun_tests | course_correction | hard_block"
}
```

Store this object as the reviewer's raw verdict and never rewrite it. The finding-level `disposition` is the reviewer's recommended handling; the orchestrator records the applied disposition separately in gate state. If the 3-cycle budget closes a gate with non-material findings still open, preserve this raw verdict and record the separate gate-level `review_outcome: closed_with_residuals`.
