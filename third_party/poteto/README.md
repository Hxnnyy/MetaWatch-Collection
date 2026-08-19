# poteto pstack (adapted)

Skills adapted from Lauren Tan's (poteto) `pstack` collection in [cursor/plugins](https://github.com/cursor/plugins), pinned at the revision recorded in `provenance.json`. Upstream is MIT-licensed (`LICENSE`); each asset's departure from upstream is recorded per-asset in `provenance.json`.

- `explain/` — merged from upstream `how`, `why`, `recall`, and `teach`: evidence-backed explanation of how code works, why it is the way it is, and where work left off.
- `verify-harness/` — merged from upstream `create-verification-skill` and `maintain-verification-skill`: generate and maintain a per-repo `verify-<app>` driving skill and feature map.
- `reflect/` — from upstream `reflect`: mine a session for durable lessons and route each to an edit on an existing skill, behind a user approval gate.

- `_shared/` — generated copies of the two shared contracts the skills link (`epistemics.md`, `prose-tells.md`); the authoring sources live at `shared/review/` in this repo and adapt pstack material with inline attribution (`epistemics.md` from `why/references/epistemics.md`, `prose-tells.md` from `unslop`). Regenerate with `npm run sync:shared`; never edit the copies.

Do not install a nested workflow skill by itself; install complete bundles from the bundle root.
