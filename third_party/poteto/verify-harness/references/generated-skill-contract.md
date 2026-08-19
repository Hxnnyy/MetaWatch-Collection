# Generated skill contract

What the generate branch writes into the target repo. The reader is the next agent: cold, mid-task, never having seen the app. Every section is grounded in what the interview actually found; a placeholder left anywhere fails the contract.

## Location and registration

- Canonical directory in the target repo: its existing skills location if it has one, otherwise `skills/verify-<app>/` at the repo root.
- Linked into the repo's local `.claude/skills`, `.codex/skills`, and `.agents/skills`, per the project-skill conventions in `~/.agents/skills/_meta/skill-management.md`.
- YAML frontmatter: `name: verify-<app>` and a `description` that names the app, the surface, and when to reach for it. Without frontmatter the skill never registers. Leave it model-invocable — walkthrough walkers and other skills must be able to find it on their own.

## The six sections

**Launch.** The exact command that starts the app for verification, and how to tell it's ready (a log line, a port answering, a prompt). Include teardown. For a short-lived CLI or TUI there is no server to keep alive: launch means build the binary (or install deps) once, then start each drive in its own isolated PTY or tmux session. When an irrelevant missing asset blocks startup (a static dir the API never serves, a sample config), the skill may create it, clearly marked as verification scaffolding, and remove it in cleanup.

**Doctor.** One read-only check that answers "is this instance worth driving?" — process up, right version/build, port owned by us, auth valid. An agent runs this first whenever anything looks off.

**Drive.** The harness recipe with real selectors and commands from this repo, not examples. Prefer stable handles — ARIA labels, data attributes, prompt strings, route paths — over coordinates and tab order. If the interview found that two instances cannot coexist (shared port, data dir, or profile), the section says so and instructs the reader to refuse to double-drive a shared instance.

**Evidence.** What to capture for a proof and where it goes. The proof standards: exercise the real user path, not internal setters or test-only endpoints; capture the action and the resulting state, not just the final screen; verify side effects (files written, rows inserted, messages sent) alongside what's visible; mocks only where a production boundary already isolates the external system. When the safe path is a dry-run or test mode, verify what it actually skips by observing (files, network, git refs) rather than trusting its name: some dry-runs still touch the network or open a browser.

**Cleanup.** How to tear down instances the run created. Kill what you started, never by process name. Cleanup removes instances and scratch state, never the evidence: proof artifacts survive the teardown, in a location the skill names.

**Helpers.** Any script the skill ships is executable and its invocation is shown in the skill body. A helper the reader has to reverse-engineer is not a helper.
