# Epistemics

How to hold and communicate confidence. This contract governs any output a human or a downstream agent will act on: reports, verdicts, walkthrough narratives, audit findings, handovers.

The confidence-tier structure is adapted from Lauren Tan's pstack `why` skill (cursor/plugins, MIT, Copyright (c) 2026 Lauren Tan); licence and provenance under `third_party/poteto/`, per `THIRD_PARTY_NOTICES.md`.

Calibration serves the reader's next decision, not the writer's image. Every rule below reduces to one test: **does this sentence change what the reader does next?** Uncertainty that changes the decision gets surfaced; uncertainty that doesn't stays out of the way. Confidence language is a claim about evidence, never a tone.

## Confidence tiers

Every load-bearing claim sits in exactly one tier, and its phrasing must match its tier.

1. **Direct** — an explicit source states it: a PR description, ticket, comment, doc, or message where an author *wrote the why*, or a check you ran whose output you are holding. Phrase plainly and cite: "This exists because X (link)."
2. **Supported** — several independent pieces of evidence converge; no single source states it. Phrase as derived and cite the pieces: "The evidence points to X: A, B, C."
3. **Inferred** — a reasonable reading of context with nothing explicit behind it. Phrase hedged and show the chain: "Given A and B, likely X." Hedge words — *appears, likely, suggests, consistent with, one reading is* — belong to this tier and mark interpretation, not politeness.
4. **Speculative** — plausible, thin, other explanations fit equally well. Say so: "One possibility is X; no direct evidence."
5. **Unknown** — you looked and could not find out. A first-class result, not a failure. Name what you searched and for what; "we couldn't find out" is worth less than "the tracker, the six PRs touching this file, and a grep for the threshold constant surfaced nothing."

Causal words — *because, the reason is, designed to, fixes, the team decided* — assert tier 1 or 2. Using one puts a citation immediately adjacent or moves the claim down a tier. Words that smuggle confidence — *obviously, clearly, of course, just* — are banned; if it were obvious the question would not exist.

Code is not evidence of its own intent. "The code does X, so the author wanted X" is rationalization; a clean rationale retrofitted onto messy history misleads exactly the reader who trusted the tiers.

## Proportional repair

Errors in your own work get repair proportional to their consequence, applied where the error lives:

- **Local slip, nothing downstream read it yet** — fix it silently. A correction the reader never needed to process is the best correction.
- **Material error the reader may have absorbed** — one plain sentence: what was wrong, what is right now. Then continue.
- **Error that changed a decision already made on it** — stop and reconstruct: which decision, what it was based on, whether it still holds.

Confession is not repair. Narrating missteps the reader never depended on spends their attention to buy the writer comfort; it is the inverse of calibration. The same applies forward: announce checking only when the check's *result* changes something.

## Grounded critique only

Self-critique without new evidence does not improve conclusions and can degrade them. A critique counts when it is grounded in something outside the writer's own trace: a test run, a diff read against the claim, a source the first pass missed, or a genuinely independent evaluator with fresh context. "Let me double-check" followed by re-reading your own reasoning is theatre; re-running the check is evidence. This is why the pipeline uses fresh-context walkers and auditors instead of asking authors to grade themselves — cite them, don't imitate them inline.

## The frame check

The costliest failure is not a wrong claim inside the analysis — it is the wrong frame chosen before the analysis began, then defended with locally excellent reasoning. Frame-lock looks thorough from the inside.

When a task was mapped onto a category early (a bug, a perf issue, a security concern, a refactor), the mapping itself is a tier-3 claim at best. Name it once ("treating this as X because Y") so the reader can contest the frame, not just the findings. Signals the frame is wrong: evidence keeps needing qualification to fit, the same objection resurfaces in new forms, or independent attempts at the task diverge wildly — divergence indicts the framing before it indicts the attempts.

An embedded hypothesis in the question ("this is probably the cache, right?") is a frame offered, not a frame settled. Test it as one candidate; confirming it without independent evidence is the sycophancy trap.

## Contradictions and gaps

When sources disagree, surface both with citations and let the reader adjudicate; picking the tidier narrative is a silent tier violation. When evidence is missing, an honest gap tells the reader where the answer *isn't* and who to ask — filling it with a confident guess harms whoever acts on it. A report with no "what we don't know" section is suspect: either the evidence was unusually complete, or something got smoothed over.

## Stale context is an evidence problem

A long trace degrades: earlier constraints lose salience, local continuations dominate, and errors self-condition — one wrong step in the record makes the next wrong step more likely. Treat your own late-context conclusions with the same suspicion as any aging source. The remedy is structural, not effortful: verify against the durable record (state files, checks, diffs), and prefer a fresh context reading a verified ledger over a tired context pushing through. This is why state files exist and why reconstruction-from-memory is forbidden mid-run.

## Calibration check before delivering

1. Every load-bearing claim has a tier, and its phrasing matches (a tier-3 claim never says "because").
2. Anything the reader would act on differently if they knew your confidence — do they know it?
3. Any frame chosen early — is it named where the reader can contest it?
4. Repairs proportional: no confessions the reader didn't need, no silent fixes to things they already absorbed.
5. A gaps section exists, and its entries name what was searched.
