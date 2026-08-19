# Why branch

Recover the forces that shaped the code: the design rationale, the rejected alternatives, the incident or customer behind a guard, where a threshold came from. The code tells you what it does, rarely why it exists — the why lives in commits, PRs, tickets, docs, chat, and telemetry, all incomplete and sometimes contradictory. Work like a detective on a historical case: evidence before narrative, and when the record is thin, say so. The synthesis contract is [`../../_shared/epistemics.md`](../../_shared/epistemics.md); every rule there binds this branch.

## 1. Parse the target and the question

The target is a chunk of code, a pattern, or a named decision. The question is one of: design rationale, tradeoff against an alternative, motivating edge cases, external forcing function, dead-code suspicion, or a broad history sweep. A vague target gets your best-guess reading from context, stated in one line. A hypothesis embedded in the question ("this is for performance, right?") enters as one candidate among others — the epistemics contract's sycophancy trap. Done when target and question type are stated where the user can contest them.

## 2. Build the code anchor

Inline, before any fan-out — it is cheap and every investigator needs it:

```bash
git blame -L <start>,<end> <file>        # last-touch commit per line
git log --follow --oneline -- <file>     # full history through renames
git log --oneline -20 -- <file>          # recent commits, PR numbers visible as (#1234)
git log -1 --format=%B <commit>          # full message: PR and ticket references
gh pr view <n> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

Done when the seed context holds file paths with line ranges, key symbols, the commit list, PR numbers, and any ticket IDs found in commit messages or PR bodies.

## 3. Map available tools to evidence categories

Historical context spreads across eight evidence categories, and the question alone never tells you which one holds the answer, so the default is coverage — query every category that has a tool.

| Category | Uniquely surfaces |
|---|---|
| Source control (git; `gh` where installed — without it, skip PR archaeology and record the gap) | Implementation-time rationale captured in review: PR descriptions stating the problem, review threads debating alternatives, tests whose names encode the motivating edge case |
| Issue / ticket tracker | The product or business forcing function: customer asks, compliance deadlines, parent-initiative framing, motive-bearing labels |
| Long-form documents | Rationale written before the code: PRDs, RFCs, ADRs, "alternatives considered" sections, postmortems |
| Real-time chat | Deliberation that never reached a doc: incident fire-drills, author–reviewer Q&A, "we decided X because Y" threads |
| Meeting transcripts | Decisions made out loud: design reviews and planning calls whose written summary dropped the reasoning |
| Infrastructure observability | The runtime reality that motivated the code: monitor thresholds matching code constants, metric spikes bracketing the merge date |
| Error tracking | The exceptions behind defensive code: issues whose first-seen/last-seen window brackets the ship date, stack traces through the target |
| Product analytics | User and data reality: a usage ramp that dates a launch, a pre-ship distribution whose p99 reveals where a threshold constant came from |

At runtime, list the MCPs and tools actually available in this session and map each to exactly one category — the one matching its primary evidence, with ambiguous mappings recorded in the coverage map. Never assume a fixed roster; the map is rebuilt every run. Done when every available tool sits in exactly one category and every category is marked covered, uncovered, or skipped.

## 4. Fan out investigators

One investigator per covered category, all spawned in one message, each owning exactly one source. Pooling categories into one agent is forbidden: each source has its own query vocabulary, and pooled coverage cannot be audited. Use general-purpose subagents. Each brief carries the question, the code anchor, its single category and tool, and these standing orders:

- Gather evidence, don't answer — the synthesis weighs it.
- Quote verbatim with a precise citation (PR #, ticket ID, doc URL, permalink, commit hash, file:line). A boring exact quote beats a plausible summary.
- Record every query verbatim, including the ones that returned nothing — an absence is only a finding when the reader knows what was looked for.
- Contradictions are findings: two items in your source that disagree get returned with both citations, never just the tidier one.
- Read whole items — the full PR with comments and reviews, the full ticket history, the full thread — not titles.
- Follow links inside your own source; record a cross-source lead for its owning investigator, never chase it yourself.
- Return: what I searched (queries verbatim), direct evidence, circumstantial evidence with the inference chain named, contradictions, gaps, leads.

When the target looks defensive (null checks, retries, timeouts, rate limits, feature flags), add to every brief: hunt the incident angle inside your source — postmortems, incident channels, incident-labeled tickets, error first-seen windows, monitors created as action items.

Done when every covered category has an investigator running and every uncovered or skipped category has its written justification drafted for the Sources Consulted map.

## 5. Skipping a category

A skip ships with a written justification in Sources Consulted. Exactly two reasons qualify:

- **No tool exists** for the category in this session — flagged as a gap, not a choice: "Real-time chat: skipped, no matching tool; the conversational record was not searched."
- **Provably irrelevant** — a proof, not a hunch: "Error tracking: skipped, target is a build-time script with no runtime path." "Probably nothing there" never qualifies; an empty investigator costs one subagent, a missed design doc costs a wrong answer.

Done when every skip in the output cites one of these two reasons.

## 6. Synthesize

Weigh the evidence under [`../../_shared/epistemics.md`](../../_shared/epistemics.md) — tiers, tier-matched phrasing, contradictions, gaps, and its calibration check govern here. Three mechanics that contract leaves to this branch:

- Merge duplicate citations across investigators into one authoritative reference.
- Spot-check any citation you are not certain of before propagating it.
- Trace past the newest commit: the current shape is usually an accretion of earlier decisions, and the motivating one is often not the last one.

Done when the epistemics calibration check passes.

## 7. Deliver

Output structure. You may edit for clarity, but never rewrite the confidence language — the epistemic framing is the product, and dropping hedges to sound authoritative is the exact failure this branch exists to prevent.

- **The question** — restated in a sentence.
- **The code in question** — paths, line ranges, key symbols.
- **What we found** — tier-1/2 claims, each tagged `[Direct]` or `[Supported]` with citations.
- **What we can reasonably infer** — tier-3 claims with the inference chain visible. Skip when empty.
- **Competing hypotheses** — when the evidence fits several stories: each with its evidence for and against, no forced winner. Skip when one answer is clear.
- **What we don't know** — the gaps, each naming what was searched and for what.
- **Sources consulted** — one line per category from step 3, nulls and skips included: `- <Category> (<tool>): <what was searched>. <what was found | no relevant results | skipped: reason>.`
- **Preserve / Change / Avoid** — only when the question precedes a change: what the history says to preserve, what is safe to change, what past attempts say to avoid.

Done when every category from step 3 appears in Sources Consulted and every claim's phrasing matches its tier.
