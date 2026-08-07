# Intent Contract

At T1+, `INTENT.md` is the fixed point every drift check compares against. It is the highest-authority document in a durable run: the PRD elaborates it, issues trace to it, and gates judge work against it. Where any downstream artifact disagrees with the intent contract, the intent contract wins. T0 captures the same intent in conversation and creates no Longflow artifact.

Resolution order: **intent contract > PRD > issues > code**.

## What it contains

Written in plain business and product language. It describes what the owner wants to be true and why it matters — never how to build it. No architecture, no stack choices, no file names.

Required sections (template: `templates/INTENT.md`):

1. **Promises** — a short numbered list of product outcomes. Each promise states what a named kind of user can do, or what the business gains, once the promise is true. Promises are the unit that coverage audits, promise gates, and drift checks operate on. Most runs have 2–6; more than 8 usually means the scope should be split.
2. **Non-goals** — what this run deliberately does not deliver. Non-goals are as load-bearing as promises: they are the primary defence against scope creep and gold-plating.
3. **Product class** — what kind of thing this is (throwaway demo, internal tool, production SaaS feature, critical system) and who is harmed, and how badly, if it is wrong. This drives tier selection and predicate proportionality.
4. **What done looks like** — one short paragraph describing the moment the owner would say "yes, that's it", written as a scene, not a checklist.
5. **Owner sign-off** — recorded date and wording.

## How it is written

The orchestrator captures intent during stress-testing (`grilling` or equivalent), in the owner's own vocabulary, and iterates with the owner until they confirm it says what they mean. After calibration, persist that capture as `tasks/INTENT.md` at T1+; at T0 leave it in conversation. Quote the owner verbatim where their words are already precise — an intent contract that preserves the owner's phrasing survives reinterpretation far better than a paraphrase.

For a fully autonomous kickoff where the owner is not present, the orchestrator drafts the contract from the kickoff message, records it as `drafted-unconfirmed`, and proceeds — except at T3, which blocks for sign-off (see `process-calibration.md`).

## Authority and amendment

- **Only the owner amends the intent contract.** No agent, at any authority level, for any reason. Not the chair, not a reviewer, not an adjudicated auditor verdict.
- If evidence accumulates that the intent contract itself is wrong, the correct action is a course-correction proposal that *asks the owner*, presented in plain language framed as product outcomes. The run continues on unaffected work while the question is open, or hard-blocks if nothing can safely proceed.
- Amendments are appended to the contract's amendment log with date and the owner's wording. The original text is never rewritten — later readers must be able to see what changed and when.

## Why it exists

Long autonomous runs fail by drifting, not by crashing. A PRD accretes requirements; predicates accrete strictness; vocabulary silently changes referent; and each local decision looks reasonable against the artifact it was checked against. The intent contract is deliberately short, deliberately non-technical, and deliberately frozen so that there is always one document a fresh pair of eyes can read in two minutes and ask: *would the owner recognise this work as their request?*

## See also

- `process-calibration.md` — how the product class sets the ceremony tier.
- `intent-audit.md` — the checks that use this contract as their reference.
- `templates/INTENT.md` — the template.
