# Acceptance Predicates

Mechanically verifiable acceptance criteria, applied in **two tiers with different freeze rules**. The historical single-tier design — every item gets a frozen predicate the implementer may not touch — applied waterfall rigidity at the finest grain, where slicing-time guesses are least reliable, and turned miscalibrated predicates into token-burning workaround factories.

## The two tiers

### Promise-level acceptance (frozen)

One entry per intent-contract promise describes how the running product shows the promise is true. At T1 it lives with the intent and short execplan; at T2+ it is authored in the PRD (`templates/prd.md`, "Promise-level acceptance"). These are **frozen like the intent contract itself — only the owner amends them.** They are verified by walkthrough at promise gates (`walkthrough-verification.md`), not by scripts.

This is where the anti-goalpost-moving guarantee lives now: at the level where slicing-time judgement is trustworthy, over criteria few enough to hold in one head.

### Item-level checks (proportionate, renegotiable)

T1 uses **one honest check per item**: a command, test, walkthrough note, or recorded spike answer. T1 has no frozen predicate scripts, including for `production-transferable` items.

At T2+, each ledger item carries a check proportionate to its `rigor_class` (`process-calibration.md`):

- `production-transferable` → a deterministic predicate script, authored at slicing time by `prd-to-issues`.
- `dogfood-disposable` → **one honest check** — a single command, test, or walkthrough note. No predicate script, no perturbation, no adversarial review.
- `spike` → the recorded answer to the spike's question. No check at all.

Item checks are **renegotiable through the visible channel**: an implementer who believes a check is miscalibrated raises a course-correction proposal (`course-correction-protocol.md`) instead of either silently editing it or expensively satisfying it. Building machinery whose only purpose is satisfying a check is tripwire 2 (`intent-audit.md`) — the check was probably wrong, and the auditor decides.

What stays non-negotiable: implementers never edit a check *silently*. The diff-rejection rule stands — a change to `scripts/verify-issue-<id>.sh` inside an implementation dispatch is rejected; the same change proposed through the channel is a normal amber decision.

## Why predicates at all

Prose acceptance criteria are gameable under context pressure. For production-transferable work, a deterministic script keeps item closure a function of:

```
bash scripts/verify-issue-<id>.sh; echo $?
```

…rather than orchestrator judgment. The proportionality rules above bound where that rigour is applied; the predicate types below define how.

## Location

```
scripts/verify-issue-<id>.sh
```

Committed alongside the item, reviewable in diffs, runs against a clean checkout, exits 0 when the item's criteria are met. For Windows-only repos without bash, `.ps1` — but bash via Git Bash / WSL is more portable. Default to bash.

## Allowed predicate types

Each check must be deterministic on a clean checkout.

### 1. Failing-test-turns-green (preferred)

Commit a failing test first; the implementation makes it pass.

```bash
npm test -- --run path/to/new-feature.test.ts
```

The strongest type. Use it whenever the criterion describes observable behaviour.

### 2. Grep-zero

For removal-style criteria ("no `as any` in `src/api/`").

```bash
test "$(grep -rn 'as any' src/api/ | wc -l)" = "0"
```

### 3. File-exists / file-content

For documentation or schema deliverables.

```bash
test -f docs/decisions/0042-new-auth-flow.md
grep -q '## Decision' docs/decisions/0042-new-auth-flow.md
```

### 4. Type-compiles

```bash
npx tsc --noEmit -p tsconfig.json
```

### 5. Predicate-script (custom)

For composite or domain-specific checks. Define an auxiliary script that exits 0 on success.

```bash
node scripts/check-rls-coverage.mjs
```

### 6. Diff-invariant

For "no regression" criteria. Compare against a baseline.

```bash
test -z "$(git diff --stat origin/main -- 'src/legacy/**')"
```

### 7. Endpoint-probe

For API-shape criteria that need a running service. Requires a deterministic local-dev fixture.

```bash
curl -fsS -X POST http://localhost:3000/api/x \
  -H 'Content-Type: application/json' \
  -d '{"valid": true}' >/dev/null
```

## Script contract

Every script:

- Starts with `set -euo pipefail`.
- Has a comment block listing the item id and each criterion mapped to a check.
- Runs each check sequentially.
- On failure: prints `[verify-issue-<id>] FAIL: <which criterion>` to stderr and exits 1.
- On success: prints `[verify-issue-<id>] PASS: <which criterion>` per check and `[verify-issue-<id>] all predicates passed` at the end.

Template: `_shared/templates/verify-issue.sh`.

## Close gate

At T2+, a `production-transferable` item may not close unless its script exits 0 on the integration branch. Before final closeout, run the full roll-up:

```bash
for f in scripts/verify-issue-*.sh; do bash "$f"; done
```

A regression that breaks a previously-green predicate is a `BLOCKED` finding. The roll-up is an evidence floor, not the closure ceiling — the final gate is the end-to-end walkthrough plus intent audit (`promise-gates.md`).

The production predicate roll-up is T2+ only. T1 closeout runs the ledger's honest checks directly.

## Maintenance

Predicate scripts for production-transferable work are durable artifacts — they survive the run and can join CI as a `verify-sweep` job or be promoted to permanent tests. Checks for disposable items are deleted with the items; keeping them is clutter, not rigour.
