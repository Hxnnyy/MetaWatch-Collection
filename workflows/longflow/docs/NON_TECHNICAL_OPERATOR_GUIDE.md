# Non-Technical Operator Guide

This guide is for people who can describe business goals clearly but do not write code.

## Your Job in Longflow

You do not need to code. You do need to:

1. Describe what success looks like in plain language — this becomes the intent contract (`INTENT.md`), and only you can change it once frozen.
2. Confirm the ceremony tier the orchestrator proposes (how much process the task deserves).
3. Answer decision questions during grill and council rounds.
4. Respond only when a real hard block appears.

Every progress update you see is required to open in plain English: what happened, what was decided, and what it means for the product — plus a confidence line that the work still matches your intent. If an update doesn't make sense to you, that is a defect in the process, not in you: say so.

## What the Agents Handle

- Technical decomposition
- Risk discovery
- Architecture alternatives
- Issue slicing and dependency planning
- Implementation and testing loops
- Audit evidence and closure checks

## What to Do at Each Stage

### Grill

Give context:

- Who the user is
- What problem is painful
- What outcome should exist at the end
- What constraints are fixed

### Proposal Review

Look for intent drift:

- Missing outcomes
- Wrong assumptions
- Unacceptable tradeoffs

### Council

One adversarial round, then dispositions. You only need to step in when:

- There is a tie-break choice that is mostly product taste.
- You prefer one tradeoff direction.

### PRD and Issues

Confirm that slices look understandable and complete. Ask for changes if something important is not represented.

### Execution

Let continuous mode run unless the orchestrator reports a hard block.

### Closeout

Read the final closure summary:

- Which of your promises are now true (with walkthrough evidence)
- What it cost against the estimate
- Which follow-ups were intentionally deferred, and why they're safe to defer

## Common Mistakes to Avoid

- Rushing from grill to coding before proposal alignment.
- Ignoring split decisions in council logs.
- Accepting vague acceptance criteria.
- Closing work on "looks good" without walkthrough or predicate evidence.
- Letting ceremony grow unchallenged: if the process feels heavier than the product deserves, say so — descoping is cheap, wasted effort is not.
