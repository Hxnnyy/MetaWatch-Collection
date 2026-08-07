# Delivery Ledger

At T1 and above, work items live in a **local ledger** — one JSON file per item under `tasks/ledger/` — not in GitHub issues. The ledger is canonical for those tiers; T0 creates no Longflow files. GitHub is an optional projection.

## Why local-first

- **Speed and context economy.** `gh issue view --comments` per child on every ingest and resume is slow and burns context; a directory of small JSON files reads in one pass.
- **No repo pollution.** A run can create a hundred generated items; a team's issue tracker should not absorb them by default.
- **Proven at scale.** The ledger pattern has carried 200+-item programmes with deterministic resume.

## Item schema

One file per item: `tasks/ledger/<ID>.json` (template: `../templates/ledger-item.json`).

```json
{
  "id": "LF-001",
  "title": "short imperative title",
  "promises": [1],
  "rigor_class": "production-transferable | dogfood-disposable | spike",
  "risk_tags": [],
  "size": "null at T1 | S | M | L at T2+",
  "status": "ready | blocked | in_progress | implemented | gated | closed | cancelled",
  "blockedBy": [],
  "files": ["expected file-ownership list"],
  "acceptance": "what must be true, in one or two sentences",
  "check": "how it is verified — predicate script path, test command, or 'walkthrough' for disposable items",
  "evidence": [],
  "notes": ""
}
```

Rules:

- **`promises` is mandatory and non-empty.** An item that serves no promise does not get created — that is the coverage audit's contract (`../review/intent-audit.md`). Enabling work (build plumbing, shared fixtures) cites the promise it unblocks.
- **`risk_tags` is the canonical reviewer routing input.** Use only risks the item actually introduces or changes: `security`, `design`, `docs`, `performance`, or another tag explicitly mapped by reviewer policy. An empty list means no specialist domain beyond the tier-scaled defaults.
- `size` is `null` at T1 and one of `S` / `M` / `L` at T2+. T1 does not invent a drift denominator it will not use.
- At T1, `check` is one honest command, test, or walkthrough note for every item; there are no frozen predicate scripts. At T2+, `rigor_class` sets the item's gate (`process-calibration.md`) and the check is proportionate to it.
- `status: cancelled` keeps the file — cancelled items are part of the audit trail, with a one-line reason in `notes`. Cancelling unstarted work is the cheapest correction available.
- `evidence` accumulates check output references, commit SHAs, and walkthrough pointers as the item moves.

`STATE.json` holds the roll-up (counts, active items, promise status); the ledger holds the detail. Never duplicate item bodies into STATE.

## GitHub projection (optional)

Sync the ledger to GitHub issues only when there is a reason: the owner asks, a team needs visibility, or the run is T3 on a shared repo. When syncing:

- the ledger remains canonical — GitHub numbers are recorded back into the item files as `github: <number>`;
- the parent PRD may be a GitHub issue for team review while children stay local;
- at closeout, an export summary comment on the parent is usually worth more than a hundred closed child issues.

## See also

- `process-calibration.md` — rigour classes and sizing.
- `promise-gates.md` — how items closing rolls up to promise gates.
- `../templates/ledger-item.json` — the template.
