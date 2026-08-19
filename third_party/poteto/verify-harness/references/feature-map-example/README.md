# Notes verification map

This directory is the maintained source for verifying the user-facing behavior of Notes. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch Notes at `http://127.0.0.1:4173` with a disposable data directory: `NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID`, so concurrent runs do not share state.
- Seed notes titled `Quarterly plan` and `Grocery list`.
- Run `control-notes doctor` and require the expected URL, data directory, and build revision.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Run browser actions through `control-notes browser` and terminal actions through `control-notes cli -- <command>`. Treat every command as literal; keep quoted names and flags unchanged.
- Restore seeded data after a mutation. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the app identity visible. CLI proof includes the command, stdout, stderr, and exit code. Mutation proof includes a read-only second view of the stored value.
- Report an unreachable path with the attempted command and the unmet precondition. Do not report a skipped entry point as verified through a different path.

## Features

- [Create a note](./create-note.md) covers browser and CLI creation and persistence.
