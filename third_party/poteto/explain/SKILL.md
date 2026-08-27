---
name: explain
description: Explain how something works, why it is shaped that way, or where you left off — investigated from the record, delivered with calibrated confidence.
disable-model-invocation: true
---

# Explain

Answer "how", "why", and "where was I" questions about code and work. The reply is the explanation itself, never a report about producing it. Critique is out of scope on every branch — reviewers and council own it in this collection; when asked for problems rather than understanding, deliver the explanation and route there.

## The spine

Every run walks these five steps; the branch decides how each is done.

1. **Pick the branch** from what was asked (table below). A vague target gets your best-guess reading stated in one line so the user can redirect — state it and proceed, don't ask. Done when the branch, the reading, and whether presentation mode applies are named before any digging.
2. **Anchor in the record.** Cheap inline work first — the code, git history, or session listing the branch names — so every fan-out carries concrete paths, symbols, and identifiers instead of rediscovering them. Done when the branch's anchor checklist is filled.
3. **Fan out.** Spawn the branch's investigators or explorers in a single message, each owning one disjoint slice or source. Done when every roster entry is either launched or carries a written skip justification.
4. **Synthesize under [`../_shared/epistemics.md`](../_shared/epistemics.md).** Every load-bearing claim tiered and phrased to its tier; contradictions surfaced with both citations; gaps named with what was searched. Done when that contract's calibration check passes.
5. **Deliver** to the branch's output contract, in the register of [`../_shared/prose-tells.md`](../_shared/prose-tells.md). Done when the reply matches the contract's sections and contains no narration of the process.

## Branches

| Asked | Branch |
|---|---|
| "How does X work", a walkthrough before changing something, placement or layering ("where should this live", "is this the right layer") | [`references/how.md`](references/how.md) |
| "Why is X this way", design rationale, a regression's origin, where a threshold or constant came from | [`references/why.md`](references/why.md) |
| "Catch me up", "where did I leave off", resuming work with no state file | [`references/recall.md`](references/recall.md) |

One question can take two branches: "teach me this subsystem" is how plus why, blended into one account. Mid-run Longflow recovery is never recall — a run with state files resumes through the Longflow hard-block rules.

## Presentation mode

Layer onto any branch when the user wants to understand, not just get the answer ("teach me", "help me really understand", "explain it like I'm new to this"):

- Choose 2–4 takeaways from why they're asking — about to change it, reviewing it, debugging it, onboarding — and put the depth there.
- Plain definition before term: name the thing, say what it is the way a senior engineer would out loud, then tie it to the case at hand.
- Smallest complete answer first, a sentence or two, then layers when they ask. Never a wall.
- Diagrams as an incremental series: to show three or more moving parts, redraw the previous diagram adding one part per step, so the reader watches the system assemble. One all-at-once diagram is reference, not teaching.
- Hedges arriving from the why branch are findings — keep them.
- State each point instead of announcing it; the announcement phrasings ("the key insight", "it's important to note") are the filler and chatbot tells in [`../_shared/prose-tells.md`](../_shared/prose-tells.md).

Done when each takeaway landed as its own smallest-complete unit and no diagram step introduced more than one new part.
