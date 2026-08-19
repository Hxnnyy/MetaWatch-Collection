# Strict Review Bar

Merge Train reviews must be stricter than ordinary PR review. A child can pass local behavior checks and still block the train if it makes the parent branch harder to maintain, reason about, or safely extend.

## Structural Standard

Reviewers must actively look for behavior-preserving simplifications that delete complexity instead of merely polishing it. Treat these as first-class review questions:

- Is there a simpler structure that would make the change feel inevitable in hindsight?
- Can whole branches, modes, helpers, layers, or flags disappear without changing behavior?
- Did the diff add special-case conditionals to an already busy flow?
- Is the logic in the canonical package, service, module, or ownership boundary?
- Did the change duplicate an existing helper, model, pattern, or contract?
- Are type boundaries explicit, or did casts, optionality, and loose object shapes hide the real invariant?
- Is orchestration unnecessarily sequential, or can independent work be composed more directly?
- Can related updates be made more atomic so the parent branch cannot settle into half-applied state?

## Presumptive Blockers

Flag these aggressively. They should block child signoff, parent checkpoint approval, or final closeout unless the author records a clear justification and the reviewer accepts the residual risk:

- A file moves from below 1000 lines to above 1000 lines because of the PR.
- New ad-hoc conditionals, feature flags, nullable modes, or one-off branches tangle unrelated flows.
- Feature-specific behavior leaks into shared/general-purpose code without an ownership reason.
- A new wrapper, abstraction, generic mechanism, or helper adds indirection without removing complexity.
- The diff preserves incidental complexity when a clear restructure could delete it.
- The implementation relies on casts, `any`, `unknown`, silent fallbacks, or unnecessary optionality where a sharper boundary is available.
- The PR duplicates canonical utilities or puts logic in the wrong layer.
- Repeated conditionals signal a missing model, policy object, dispatcher, or state machine.
- Related state updates can leave the system partially applied when an atomic structure is feasible.

## Preferred Remedies

Push for remedies that reduce concepts a future reader must hold in their head:

- delete unnecessary layers or wrappers,
- split oversized files into focused modules,
- move feature logic behind the abstraction that owns it,
- replace special-case chains with typed models or explicit dispatch,
- collapse duplicate branches into one direct flow,
- make type and API boundaries explicit,
- separate orchestration from business logic,
- reuse canonical helpers instead of adding near-duplicates,
- parallelize independent work when it also simplifies the flow,
- restructure related updates so partial state is harder to create.

## Evidence Bar

Safety- and correctness-critical claims — in findings, in rebuttals, and in verifier signoff — state how far down this ladder they were pushed and where they stopped:

1. **Asserted** — the reviewer said so. Worthless alone.
2. **Cited** — a real `file:line` or library source pointed at.
3. **Walked** — the failure path traced step by step and shown not to reach.
4. **Ran** — a script or test calling the real code, failing loud if the claim is wrong, output included. Often one small script that imports the same library the app ships and calls the exact function at issue.
5. **Reproduced** — demonstrated in the running app.

Two applications:

- A rebuttal that dismisses a correctness or safety finding requires rung 4: exercise the scenario and include what happened. "The input is validated upstream" is rung 2 until the validation is run against the failing input.
- Most scary changes are safe because of a single fact. Find the one fact the change is safe because of, push that fact to rung 4, and state any safety fact still above rung 4 as unproven rather than rounding up. Time spent proving the one fact beats time spent enumerating maybes.

## Output Expectations

Alongside findings, return the **cleared list**: risks checked and cleared, each with the check that cleared it and its evidence rung. A search that finds nothing is still an answer, and a recorded clearance stops later reviewers re-litigating the same surface.

Prioritize findings in this order:

1. Structural code-quality regressions.
2. Missed opportunities for major simplification.
3. Spaghetti or branching complexity growth.
4. Boundary, abstraction, and type-contract problems.
5. File-size and decomposition concerns.
6. Modularity, legibility, and maintainability concerns.

Prefer a small number of high-conviction blocking findings over a long list of cosmetic notes. Do not approve merely because tests pass; the parent branch must remain structurally coherent.
