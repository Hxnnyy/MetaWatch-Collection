# PRD: <name>

- **Intent contract**: `tasks/INTENT.md` — this PRD elaborates it and is subordinate to it. Where they disagree, the intent contract wins.
- **Tier**: <T2 | T3>

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## Promise trace

The spine of the PRD. Every requirement below cites a promise number from the intent contract; this table shows the reverse direction — that every promise is funded:

| Promise | Requirements serving it | Riskiest part |
|---|---|---|
| 1 — <restatement> | <requirement numbers> | <one line> |
| 2 — ... | | |

A promise with no requirements is a hollow core forming — fix before this PRD leaves review. A requirement citing no promise does not survive the subtraction pass.

## User Stories

A numbered list of user stories. Format:

> As a <actor>, I want <feature>, so that <benefit>. *(Promise N)*

Each user story includes a **verifiable hint** — a one-sentence description of how completion would be observed in the running system, feeding item-check authorship downstream.

> 1. As a mobile bank customer, I want to see balances on my accounts, so that I can make better-informed spending decisions. *(Promise 1)*
>    *Verifiable hint: GET /accounts returns a list with `balance` populated for every active account; an integration test asserts this for the demo user.*

## Subtraction pass (record of cuts)

Run before submission, adjudicated by a fresh-context intent auditor when contested:

- **Cut**: <requirements removed because no promise funds them, with one-line reasons>
- **Later, maybe**: <demoted items — real ideas the intent doesn't fund now; candidates for a future run>

An empty "Cut" list on a PRD of any size is a smell — first drafts always overreach somewhere.

## Implementation Decisions

Decisions the developer has made: modules built or modified, public interfaces, architectural decisions, schema changes, API contracts. Do not include file paths or code snippets — they go stale.

## Module Map

For each major module:

- **Name**:
- **Responsibility** (one sentence):
- **Public interface** (high level):
- **Test boundary** (what's tested in isolation):
- **Independently deliverable**: yes / no
- **File-set hint** (rough — `prd-to-issues` will refine):

Look actively for opportunities to extract **deep** modules — substantial functionality behind a simple, testable interface that rarely changes.

## Parallelism Analysis

For each pair of modules: **Independent** / **Sequential** / **Conflicting** (both touch the same file; merge or sequence). This drives scheduling in `prd-to-issues`. Be explicit — implicit dependencies become scheduling bugs.

## Promise-level acceptance

The frozen contract (owner-amendable only, like the intent itself). One entry per promise: how we will know, from the running product, that the promise is true. These become the walkthrough briefs at promise gates.

- **Promise 1 holds when**: <a user of type X can do Y end-to-end; observed via Z>
- **Promise 2 holds when**: ...

## Item-check hints

Non-frozen, proportionate guidance for `prd-to-issues`: for each area, what kind of check fits (failing-test-turns-green, grep-zero, endpoint-probe, or "walkthrough" for disposable scaffolding). Item checks are renegotiable through the descope channel; promise-level acceptance is not.
