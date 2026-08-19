---
name: code-economy
description: Write or refactor non-trivial code with the fewest concepts that fully solve the current problem.
---

# Code economy

Every function, type, parameter, option, layer, and caught exception must earn its keep in a current caller or requirement.

Subtract before you build: delete dead weight, redundant validators, and references to stubs first, then build on the simpler base.

- Extract a helper at the second caller.
- Add a parameter at the second real value.
- Add a seam at the second implementation.
- Catch an exception only where the code can act on it.
- Validate once at the system boundary.
- Prefer existing language and project facilities.
- Keep comments for constraints and reasons the code cannot express.
- Migrate callers and delete the old path in the same wave when a new internal API replaces one — no internal compatibility layers.
- Answering "where does this value come from" should cross at most three files; a deeper chain is a flattening candidate.
- Strengthen a type only where the loose one forces a `!`, a cast, or a should-never-happen branch; otherwise keep the simple type.

Design out the failure instead of guarding it:

- Operations that run amid retries and crashes converge when run twice.
- When concurrent actors share a write target, remove the sharing before reaching for a lock — "we need a lock" is a design smell to check.
- For runs of similar edits, build the codemod or script and make it the reviewable artifact; a cited lever with no script in the diff was not applied.

Before finishing, reread the full diff and delete speculative generality, pass-through layers, helper confetti, defensive padding, narration, and unsolicited features. Economy never trades away correctness, explicit boundaries, or tests.
