# Final Parent Closeout

Run final closeout after all child PRs are merged or explicitly deferred.

## Review Panel

The canonical shared roster (`reviewer-personas.md`):

- `implementation-reviewer` — code quality, structure, type boundaries, architecture coherence, regression/test integrity,
- `security-reviewer` — auth, user data, secrets, trust boundaries,
- `product-reviewer` — UI/UX, copy, product semantics, operator docs,
- `operations-reviewer` — deployment, config, runtime wiring, performance,
- `intent-auditor` — the proportionality seat: judges whether the train's remediations served the parent's intent or grew the diff around it, with binding descope authority over review-manufactured work.

Use multiple model aliases when configured.

## Required Evidence

- current parent integration ledger, including its finding-dispositions table,
- current risk register,
- child summaries,
- checkpoint reports,
- strict review bar disposition,
- deterministic check output,
- predicate/test rollup,
- residual risk disposition.

Final reviewers receive the dispositions table with the rest of the evidence; a `rebutted` finding returns only with new evidence.

## Done

The parent is ready for manual review when every required reviewer returns no material findings, every note carries an explicit disposition, and the final manual-review packet is written. The final panel has the same 3-cycle budget as any gate: at the budget, a material finding holds the train for the owner, and everything else closes as `closed_with_residuals`, recorded in the packet.

Final closeout still refuses a parent that merely works while a named-consequence structural regression stands unremediated and unrebutted. It equally refuses to manufacture work: a simplification with no named consequence is a `follow-up` in the packet, never a merge blocker. Use `STRICT_REVIEW_BAR.md` as the approval bar in both directions.
