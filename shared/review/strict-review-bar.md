# Strict Review Bar

Merge Train reviews must be stricter than ordinary PR review. A child can pass local behavior checks and still block the train if it makes the parent branch harder to maintain, reason about, or safely extend.

Strictness means depth of inspection, not volume of demands. The bar polices in **both directions**: a structural regression waved through and a restructure demanded without consequence are the same review failure.

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

## What makes a finding blocking

A finding blocks by naming its **consequence**: the defect it causes, the security or data risk it opens, the contract it breaks, the check it fails, or the specific, plausible future change it makes materially harder — with that change named. "This could be simpler" is an observation; "every new failure class must now be added in three places, and this parent adds failure classes" is a consequence.

- A structural finding with a named consequence blocks. Severity follows the consequence, not the elegance gap.
- A structural preference with no named consequence is severity `note`, disposition `follow-up` — recorded in the packet, worked after the train.
- The remedy's cost is part of the finding. A fix that grows net complexity, or a restructure whose payoff the reviewer cannot name, is proposed as `follow-up`, never demanded as in-train remediation. Each accepted finding becomes a narrow correction or a regression check, not a broader framework.

## Presumptive Blockers

These patterns block by default because their consequence is well-known; the author may rebut with a recorded justification the reviewer accepts:

- A file moves from below 1000 lines to above 1000 lines because of the PR.
- New ad-hoc conditionals, feature flags, nullable modes, or one-off branches tangle unrelated flows.
- Feature-specific behavior leaks into shared/general-purpose code without an ownership reason.
- A new wrapper, abstraction, generic mechanism, or helper adds indirection without removing complexity.
- The implementation relies on casts, `any`, `unknown`, silent fallbacks, or unnecessary optionality where a sharper boundary is available.
- The PR duplicates canonical utilities or puts logic in the wrong layer.
- Repeated conditionals signal a missing model, policy object, dispatcher, or state machine.
- Related state updates can leave the system partially applied when an atomic structure is feasible.

## Preferred Remedies

When a consequence is named, push for remedies that reduce the concepts a future reader must hold:

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

## Adjudication and memory

Findings are advisory until the orchestrator dispositions them — `fix-now`, `follow-up`, `residual-risk`, or `rebutted` (evidence-backed), per the reviewer protocol. Only `fix-now` findings reach a remediator; raw verdicts stay immutable either way.

Every reviewer dispatched after the first receives the dispositions record to date. A `rebutted` finding returns only with new evidence; re-raising it without any is itself a proportionality finding. Fresh eyes consume cycles; they never mint them.

## Output Expectations

Alongside findings, return the **cleared list**: risks checked and cleared, each with the check that cleared it and its evidence rung. A search that finds nothing is still an answer, and a recorded clearance stops later reviewers re-litigating the same surface.

Prioritize findings in this order:

1. Correctness, security, and data consequences.
2. Structural regressions with named consequences.
3. Boundary, abstraction, and type-contract problems.
4. Simplification opportunities, as `follow-up` proposals with the payoff named.
5. File-size, decomposition, modularity, and legibility notes.

Prefer a small number of high-conviction blocking findings over a long list of cosmetic notes. Do not approve merely because tests pass — the parent branch must remain structurally coherent — and do not block merely because a restructure is imaginable: the train ships with consequences fixed, not preferences satisfied.
