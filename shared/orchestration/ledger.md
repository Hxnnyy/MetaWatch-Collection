# Delivery Ledger

Work items live in a **local ledger** — one JSON file per item under `tasks/ledger/` — not in GitHub issues. The ledger is canonical at every tier. GitHub is an optional projection.

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
  "size": "S | M | L",
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
- `rigor_class` sets the item's gate (`process-calibration.md`). `check` must be proportionate to it: a `dogfood-disposable` item's check is one honest command or a walkthrough note, never a frozen predicate script.
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
