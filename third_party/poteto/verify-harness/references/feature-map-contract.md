# Feature map contract

The feature map lives at `features/` inside the generated skill: a `README.md` index plus one file per user-facing feature. It is the repo's maintained verification source — a proof that drives one convenient entry point is incomplete when the map lists others. Seed it with the top 3–5 features, found from routes, commands, menus, or docs; the maintain branch grows and corrects it from there.

## The index (`features/README.md`)

- Baseline preconditions every recipe starts from: launch target, isolated data location, seed data, what doctor must report.
- Driving conventions: which harness command runs each kind of action, the stable-handle preference, and how mutations are restored.
- Proof and skip reporting rules: capture the action plus the resulting state, where artifacts go, and how to report an unreachable path — never as verified through a different path.
- A features list linking every sibling file, one line each.

## Feature files

Each file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order:

1. `Sub-features` — short IDs with one line per behavior.
2. `How to get to it (user POV)` — every user entry point.
3. `Driving it with <harness>` — starts with `Preconditions:`, then labeled bullets pairing each user action with an exact command and its observable result.
4. `Gotchas` — traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof — never source files or internals.

A trimmed example: [`feature-map-example/`](feature-map-example/) — the index and one feature file for a notes app driven by a `control-notes` helper.
