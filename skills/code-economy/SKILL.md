---
name: code-economy
description: Write or refactor non-trivial code with the fewest concepts that fully solve the current problem.
---

# Code economy

Every function, type, parameter, option, layer, and caught exception must earn its keep in a current caller or requirement.

- Extract a helper at the second caller.
- Add a parameter at the second real value.
- Add a seam at the second implementation.
- Catch an exception only where the code can act on it.
- Validate once at the system boundary.
- Prefer existing language and project facilities.
- Keep comments for constraints and reasons the code cannot express.

Before finishing, reread the full diff and delete speculative generality, pass-through layers, helper confetti, defensive padding, narration, and unsolicited features. Economy never trades away correctness, explicit boundaries, or tests.
