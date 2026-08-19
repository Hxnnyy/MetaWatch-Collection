# Synthesis filters

The parent applies every filter to every finding from both reviewers. A finding is Accepted only when it passes all of them; the first filter it fails is its rejection reason. Findings that fail only the structural-mechanism filter move to Backlog rather than Rejected.

- **Durability** — still true in six months, after paths, versions, and code shapes have changed.
- **Specificity** — broad enough to apply across tasks, precise enough that a future agent recognizes the moment. Platitudes ("write good code") fail; pinned facts that will rot ("skill X is 175 tokens over its limit") fail.
- **Existing-skill-first** — `new skill: <kebab-name>` only when no existing skill is a real home and the pattern recurs.
- **Convergence** — a finding both reviewers surfaced carries higher confidence; a singleton must clear every other filter with room to spare.
- **Decision-changing** — a future agent does something different because of the edit, not just reads more text.
- **Structural-mechanism** — when a lint rule, script, hook, or metadata flag could enforce the lesson, route it to Backlog as a mechanism note. Encode lessons in structure; skill prose is for what mechanisms cannot enforce.
- **Skill-was-used** — the hard scope rule, re-checked: the routing target was invoked this session, or the row is `tune description:` on a skill that was visible and missed. Anything else is rejected as skill-not-used.
- **Already-covered** — read the target skill before accepting any edit to it. Guidance already there, clear and well-placed: reject as already-covered — the failure was execution, not the skill. Guidance present but buried or weak: accept, reframed as a placement or wording fix rather than an addition.

Drop (details that drift):

- "the linter at SHA `bd91aa7` uses a chars/4 heuristic"
- "`foo-skill` has 175 tokens at limit 80"
- "the reviewer flagged regex backtracking on May 2"

Keep (patterns that survive drift):

- "closed regex enums for trigger detection are brittle; prefer schema-validated structures"
- "skill descriptions front-load trigger keywords"
- "path-shaped triggers belong in metadata, not description prose"

## Output

Exactly this shape. One sentence per cell; each row readable in five seconds. The user rules row by row.

### Accepted

| Problem | Proposal | Routing |
|---|---|---|
| <failure mode in a skill the session used> | <the change to that skill's body> | <skill + section> |
| <skill was visible but didn't trigger> | <the description change so it fires next time> | tune description: <skill> |
| <recurring pattern with no existing home> | <draft a new skill> | new skill: <kebab-name> |

### Rejected

One line per finding: Principle — failing filter.

### Backlog

One line per item: the pattern, what it cost this session, and the mechanism that would enforce it (lint, hook, script, metadata).
