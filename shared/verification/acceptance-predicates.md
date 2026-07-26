# Acceptance Predicates

Mechanically verifiable acceptance criteria. Every child issue in the MetaWatch Longflow set ships with a predicate script. A child cannot be closed unless its predicate exits 0 on the integration branch.

## Why

Prose acceptance criteria are gameable. Predicates are not. By converting each AC into a deterministic script, child closure becomes a function of:

```
bash scripts/verify-issue-<n>.sh; echo $?
```

…rather than orchestrator judgment. This eliminates the most common failure mode in long autonomous runs: the implementer finishing what they think the AC means, the orchestrator agreeing under context pressure, and the issue closing without the AC actually being met.

## Authorship

Predicate scripts are authored by **`prd-to-issues`** at issue-creation time, **not** by the implementer. This means the AC contract is set before implementation and cannot be rewritten by the implementer to fit what they shipped.

If `prd-to-issues` cannot make an AC deterministic, the AC is underspecified. Split, sharpen, or mark HITL — do not ship the issue with a hand-wave. Inability to write a predicate is a signal, not a workaround opportunity.

`issues-execution` enforces:

- The implementer subagent receives the predicate script as input but is **explicitly forbidden from modifying it**.
- A diff that touches `scripts/verify-issue-<n>.sh` from an implementer dispatch is rejected.

## Location

Each child issue has one script:

```
scripts/verify-issue-<issue-number>.sh
```

The script lives in the repo, is committed alongside the implementation, and is reviewable in diffs. It runs against a clean checkout and exits 0 when all ACs are met.

For Windows-only repos that lack bash, use `.ps1` instead — but bash via Git Bash / WSL / a Linux container is more portable. Default to bash.

## Allowed predicate types

A predicate script is a sequence of one or more checks. Each check must be deterministic on a clean checkout.

### 1. Failing-test-turns-green (preferred)

Commit a failing test first; the implementation makes it pass.

```bash
npm test -- --run path/to/new-feature.test.ts
```

This is the strongest predicate type. Use it whenever the AC describes observable behaviour.

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

For type-system criteria.

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

### 7. Endpoint-probe (for backend ACs)

For API-shape ACs that need a running service. Requires a deterministic local-dev fixture.

```bash
curl -fsS -X POST http://localhost:3000/api/x \
  -H 'Content-Type: application/json' \
  -d '{"valid": true}' >/dev/null
```

## Script contract

Every script:

- Starts with `set -euo pipefail`.
- Has a comment block listing the issue number and each AC mapped to a check.
- Runs each check sequentially.
- On failure: prints `[verify-issue-<n>] FAIL: <which AC>` to stderr and exits 1.
- On success: prints `[verify-issue-<n>] PASS: <which AC>` per check and `[verify-issue-<n>] all predicates passed` at the end.

Template: `_shared/templates/verify-issue.sh`.

## Close gate

`issues-execution` enforces:

```
A child issue may not be closed unless:
  bash scripts/verify-issue-<n>.sh
  exits 0 on the integration branch.
```

This is non-negotiable in continuous mode.

In addition, before final parent closeout, `issues-execution` runs the full predicate roll-up:

```bash
for f in scripts/verify-issue-*.sh; do bash "$f"; done
```

Every predicate must still pass at final closeout. A regression that breaks a previously-green predicate is a `BLOCKED` finding.

## Maintenance

Predicate scripts are durable artifacts. They survive past the PRD and become part of the regression suite. Optionally:

- Wire them into CI as a `verify-sweep` job.
- Promote stable predicates to permanent test files when they describe behaviour worth keeping.
- Delete predicates only when their underlying AC is superseded by a newer issue's predicate.
