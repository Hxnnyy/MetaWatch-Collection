---
name: verify-harness
description: Generate a project-local verify-<app> skill that drives the real app the way a user does, or run the maintenance pass that keeps its feature map honest.
disable-model-invocation: true
---

# Verify harness

Every serious project needs a scripted way to prove behavior: launch the real app, exercise a feature the way a user would, capture evidence. That capability lives as a project-local skill named `verify-<app>` inside the target repo, with a feature map (`features/`) as the repo's maintained verification source. Where the collection's Longflow walkthrough contract is installed, walkers consume it instead of improvising their own drive path. You write the generated skill for the next agent, not for a human: it is read cold, mid-task, by an agent that has never seen the app.

## Pick the branch

- The target repo has no `verify-<app>` skill, or the user asks for one → **Generate**.
- A verify skill with a feature map exists and the ask is an upkeep or audit pass → **Maintain**.
- Several candidates → ask which. Asked to maintain when none exists → stop and offer the generate branch rather than inventing a target.

## Generate

### 1. Interview the repo, not the user

Answer from the codebase; ask the user only what you cannot observe.

- **Surface:** what does a user actually touch — a web UI, a CLI/TUI, a desktop app, an API, a library? A repo can have several; pick the primary one and note the rest.
- **Run:** how does the app start locally? Prefer the repo's own documented dev command (package scripts, Makefile, README quickstart). Note ports, env vars, seed data, auth.
- **Drive:** how can an agent interact with it programmatically? Existing harnesses first — Playwright/Cypress specs, expect scripts, PTY helpers, curl-able endpoints, a debug port. Only then pick a generic recipe: browser/CDP for web and Electron, a tmux/PTY harness for CLI/TUI, plain HTTP for services.
- **Observe:** what evidence can be captured — screenshots, terminal transcripts, response bodies, logs, exit codes, DB state?
- **Isolate:** can two instances run side by side (ports, data dirs, profiles)? If not, the generated skill must say so and refuse to double-drive a shared instance: refusing beats corrupting the user's session.

If the checkout doesn't build or start as-is, fix that first (or report it precisely) before generating; a skill written against a broken base teaches wrong steps.

Done when all five questions have codebase-grounded answers and anything you asked the user was genuinely unobservable.

### 2. Write the skill

Create the skill at a canonical directory in the target repo and register it in whichever project-local skill directories the repo's harnesses actually use (for example `.claude/skills/` and `.codex/skills/`, as symlinks to the canonical directory) — discover the repo's existing convention rather than inventing one. Its SKILL.md carries six sections — Launch, Doctor, Drive, Evidence, Cleanup, Helpers — specified in [`references/generated-skill-contract.md`](references/generated-skill-contract.md).

Done when every section is grounded in an interview finding and no placeholder text remains anywhere in the file.

### 3. Seed the feature map

Create `features/README.md` plus one file per feature for the top 3–5 user-facing features (found from routes, commands, menus, or docs), following [`references/feature-map-contract.md`](references/feature-map-contract.md).

Done when the index links every feature file and each file carries the four required H2s with real commands from this repo.

### 4. Prove it before handover

Run the generated skill's own instructions end to end once: launch, doctor, drive ONE mapped feature (one is enough — the map exists so later runs cover the rest), capture evidence, clean up. After cleanup, confirm the evidence still exists at its named location; a cleanup that eats the proof fails this step. Fix what fails, and run the generated cleanup after every failed iteration too, so broken attempts don't strand processes and ports. A generated skill that was never executed is a draft, not a deliverable.

Done when you can name three things: the feature driven, the evidence artifact's path, and the check that it survived cleanup. A handover missing any of the three is not a handover.

### 5. Hand over

Report what was generated and the step-4 proof (all three named things), and point the user at this skill's maintain branch for keeping the map honest. Suggest a cadence only if they ask.

Done when the report contains the proof and the maintain pointer.

## Maintain

The upkeep loop for a generated verify skill (or any project-local verification skill with a feature map). The unit of rigor is the feature, not every sentence: cover every feature file from source and exercise every feature live.

The outcome is ternary, and the run must name which:

- **clean** — every feature got source AND live coverage; nothing worth shipping. No branch, no PR. A run that skipped live driving cannot claim clean; it is blocked.
- **changed** — one PR ships proven doc, harness, or map corrections.
- **blocked** — coverage could not finish or a proven fix could not ship safely. Say exactly what blocked it.

Edit scope: only the verify skill's own directory (its SKILL.md, `features/`, and any harness scripts it owns). Never edit product code during a run: a behavior the map describes that the app no longer does is either doc drift (fix the map) or a product regression (report it — rewriting the map to match a regression hides a bug).

### The pass

0. **Locate the target.** Find the project-local verify skill: the one whose body has launch/drive sections and a feature map. Several candidates → ask which. None → stop and offer the generate branch. Done when exactly one target is agreed.
1. **Index hygiene.** Read the feature map README and glob its sibling files. Fix missing, extra, duplicate, or dead entries. Lightweight; no generated inventory. Done when index and feature files match one-to-one.
2. **Source wave.** One read-only subagent per feature file, launched concurrently. Each explains "how does this user-facing feature work?" from source and returns: feature summary / source entry points / likely drift with citations, or none / one concise live-verification recipe. Children never drive the app and never edit files. Done when every feature file has a returned report in that shape.
3. **Reconcile.** Merge overlapping recipes into as few app states as practical. Spot-check cited drift; don't re-prove clean claims. Sweep recent churn for user-facing surfaces missing from the map — a missing-feature claim needs a concrete source path before it counts. Done when every drift claim is confirmed or dropped and every missing-feature claim carries its path.
4. **Live pass.** Required even when source looks clean. The coordinator owns all driving. Follow the verify skill's own Launch section for the run shape — one long-lived instance driven serially for servers and UIs, or a fresh isolated session per drive for short-lived CLIs; that section decides, not this one. Exercise every feature at least once, holding three invariants the whole pass, whatever fails:
   1. Doctor before drive: doctor before the first drive, on each fresh session where sessions are the unit, and again after any failed drive or anything surprising. Where doctor can't see the failure (a wedged UI state on a healthy process), reset to a known state or relaunch rather than hoping.
   2. Evidence captured so far survives every cleanup — checked at its named location, not assumed.
   3. Nothing a drive started outlives that drive's usefulness: failed-iteration residue is cleaned whether the session is stuck, exited, or shared (for a shared instance, clean the residue, not the instance).

   A doctor failure caused by skill drift is drift: fix it under edit scope and retry once — restart whatever the fix invalidated, nothing more — before calling the pass blocked. A feature counts as `verified-unreachable` only with the concrete prerequisite (auth, entitlement, OS, external state) and the route attempted; a map that omits that prerequisite has drift. Any harness fix from triage is re-driven live before it ships. Final teardown happens after the last drive of the run, re-proofs included — evidence stays, per the skill. Done when every feature was either driven with evidence or marked `verified-unreachable` with its prerequisite and attempted route.
5. **Triage.** Wrong or missing user-POV description → doc drift, fix it. Working behavior the harness can't drive → harness gap, fix it, under the same Helpers rule as generation (scripts executable, invocation shown in the skill body). App behavior that's actually broken → product gap: record it for the user, keep it out of this PR. Done when every finding carries exactly one of the three labels.
6. **Ship or stop.** For changed: one PR of proven corrections, every changed file re-read first. For clean or blocked: no PR; report the outcome and the coverage honestly. Done when the run has named its outcome and the evidence behind it.

Keep concise run notes (features covered, unreachable prerequisites, confirmed drift, outcome) in a scratch location; don't commit them.

## See also

- The Longflow walkthrough contract (`walkthrough-verification.md`, where that workflow is installed) — walkers use the generated skill for launch, drive, and evidence.
- `../_shared/epistemics.md` — confidence tiers for maintain reports and blocked verdicts.
- `../_shared/prose-tells.md` — voice for PR descriptions and handover reports.
