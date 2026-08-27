---
name: grilling
description: Grill the user relentlessly about a plan, product, architecture, or design. Use when the user wants to stress-test an idea before building, asks to be grilled, or wants a decision interview; when they ask to grill with docs, sharpen the domain language and update the project’s decision documentation as answers settle.
---

# Grilling

Interview the user until the important branches of the decision tree are resolved and both sides share the same model.

## Run the interview

1. Establish the decision being made and the observable outcome.
2. Map the major branches: users, constraints, scope, behavior, data, interfaces, failure modes, operations, rollout, and verification as relevant.
3. Ask one question at a time. Wait for the answer before moving on.
4. Give a recommended answer with every question, including the tradeoff, the strongest rejected alternative, and why it lost.
5. Follow dependencies in order. Resolve an upstream choice before asking questions whose answers depend on it.
6. Challenge contradictions, vague terms, hidden assumptions, and attractive ideas that do not serve the stated outcome.
7. When answers keep contradicting or reopening settled branches, stop interviewing and re-establish the decision frame — divergence indicts the framing before the answers.
8. Periodically summarize settled decisions and remaining branches.
9. Stop only when the unresolved items are genuinely optional, explicitly deferred, or blocked on external evidence.

Investigate facts from the codebase, supplied documents, or authoritative sources instead of asking the user to retrieve them. When a fork is empirically observable, build and run the cheap probe instead of asking the user to predict the outcome. The user owns product and preference decisions; do not answer those on their behalf.

Do not implement the plan during the interview unless the user explicitly ends the grilling phase and authorizes implementation.

## Grill with docs

When the user asks to “grill with docs,” record decisions as they settle:

- Use the project’s existing domain model, `CONTEXT.md`, architecture docs, decision log, or ADR convention.
- Invoke `domain-modeling` when terminology, entities, invariants, or boundaries are part of the decision.
- Update documentation incrementally after a decision is stable, not after every speculative exchange.
- Keep one source of truth: link to an ADR or detailed decision rather than duplicating it across documents.
- End with the documents changed, the decisions captured, and any explicitly deferred questions.
