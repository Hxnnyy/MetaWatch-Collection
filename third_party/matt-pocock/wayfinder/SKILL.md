---
name: wayfinder
description: Map a very large, ambiguous effort into a durable decision tree and ordered frontier of work. Use when the user explicitly invokes Wayfinder to navigate a destination whose architecture, product shape, or execution path is still substantially unknown.
disable-model-invocation: true
---

# Wayfinder

Turn an overwhelming destination into a navigable map. This is a planning and decision-discovery skill, not an implementation orchestrator.

## Core model

- **Destination:** the observable end state.
- **Map:** the current decomposition of decisions, dependencies, evidence, and work.
- **Decision ticket:** one bounded uncertainty whose resolution changes downstream choices.
- **Frontier:** decisions that can be resolved now because their prerequisites are settled.
- **Fog:** important uncertainty that is visible but not yet answerable.
- **Trail:** the durable record of decisions, evidence, and resulting map changes.

## Start the map

1. State the destination in observable terms.
2. Inspect existing code, documents, issues, decisions, and constraints before interviewing.
3. List the major unknowns that could materially alter the route.
4. Draw dependencies between those unknowns.
5. Identify the frontier: the smallest high-leverage decisions that can be resolved now.
6. Mark speculative branches as fog instead of prematurely expanding them.

Use `grilling` when a frontier decision needs a product or architecture interview. Use `domain-modeling` when terminology, entities, invariants, or boundaries are unclear.

## Resolve one decision ticket at a time

Each decision ticket must contain:

- the question and why it matters;
- known constraints and evidence;
- viable options;
- a recommendation with tradeoffs;
- the decision or explicit deferral;
- downstream tickets created, changed, unblocked, or removed.

Research and codebase inspection may run in parallel when independent. Synthesis remains a single decision: reconcile conflicting evidence before updating the map.

Do not implement the destination while Wayfinder is active. Small experiments are allowed only when they answer a named decision ticket and their result is recorded as evidence.

## Persist the trail

Prefer an existing issue tracker when the project already uses one and the user has authorized tracker writes. Otherwise write local Markdown under:

`tasks/wayfinder/<destination-slug>/`

Maintain:

- `MAP.md` — destination, dependency map, frontier, fog, and out-of-scope branches;
- `decisions/<ticket>.md` — one file per resolved or deferred decision;
- links to existing ADRs, domain docs, issues, prototypes, or research instead of duplicating them.

The map is a living index, not a second specification.

## Stop condition

Wayfinder is complete when:

- the destination is concrete enough to verify;
- all route-changing unknowns are resolved, explicitly deferred, or assigned an evidence-gathering action;
- the remaining frontier consists of independently executable work;
- ownership and verification are clear;
- the user can choose an implementation workflow without reopening foundational decisions.

End with the recommended route, the first executable frontier, and the consequential fog that remains.
