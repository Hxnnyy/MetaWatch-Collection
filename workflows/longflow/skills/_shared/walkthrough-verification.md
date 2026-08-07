# Walkthrough Verification

A walkthrough is a fresh agent **using the product the way the promise's user would**, then reporting what a human would experience. It is the most outcome-aligned check available: predicates prove properties, reviewers judge code, but only use proves the promise.

Runs have historically discovered their real gaps in a late "dogfood" phase — after every predicate passed and every reviewer signed off. The walkthrough moves that discovery into every promise gate.

## When

- **Every promise gate at T1+.** At T1 the walkthrough may be the entire gate.
- **T0 final check.** Use the same product-first standard once at the end, in normal conversation, without creating a promise-gate artifact or durable state.
- Final closeout walks the whole journey end-to-end, not promise-by-promise.

## How

1. At T1+, dispatch a fresh agent (no implementation context) with: the promise text from `INTENT.md`, who its user is, and how to reach the product surface (dev server URL, preview, CLI entry point, simulator). Not the code, not the diffs, not the item list. At T0, the implementing agent may run the single final check directly from the conversational intent.
2. The agent does what the user would do — clicks, types, runs, reads — using whatever drive mechanism the surface supports (browser automation, CLI invocation, HTTP). Screenshots or transcripts where the harness allows.
3. It narrates plainly: what it tried, what happened, where it stumbled, what a real user would feel at each step. Jank counts — "the page works but takes eleven seconds and the button reads `undefined`" is a walkthrough finding even when every test is green.

## Output

Plain-English narrative plus a one-line judgement:

- **`promise holds`** — the user can do the thing; note any rough edges as non-blocking observations.
- **`promise does not hold`** — the user cannot do the thing. This is *unfinished work*, not a review finding: it goes back to implementation, consuming no review cycles. If it reveals missing items, that is a coverage correction on the ledger.
- **`cannot walk`** — the surface is unreachable (no runnable environment, missing credential). Escalate per hard-block rules rather than substituting a code-read for a walkthrough and calling it verified. A walkthrough that never touched the product is not evidence.

Store the narrative in the ledger evidence for the promise's items and quote its key lines in the gate summary — walkthrough narratives are the most owner-legible artifact a run produces.

## Honesty rules

- The walker never sees implementation reports first; expectations contaminate observation.
- The walker does not fix anything, including "just one obvious thing".
- If the walkthrough requires seed data or fixtures, use what a real user's environment would plausibly contain — a walkthrough against a hand-crafted perfect fixture proves the fixture.

## See also

- `promise-gates.md` — where walkthroughs sit in the gate.
- `intent-audit.md` — the auditor consumes walkthrough narratives as primary evidence.
