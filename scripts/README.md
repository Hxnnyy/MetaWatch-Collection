# Scripts

These helpers are workflow-aware.

## Inspect a Longflow Run

The Longflow mechanics command reads a run without changing it. It defaults to the current directory; pass `--root <path>` to inspect another repository.

```powershell
npm run --silent longflow -- validate
npm run --silent longflow -- coverage --root C:\path\to\repo
npm run --silent longflow -- stale-scan
npm run --silent longflow -- resume-context --tail 100
```

Each invocation writes one compact JSON object to stdout:

| Command | Result-specific fields |
|---|---|
| `validate` | `problems` for v4 state, required artifacts, and ledger shape |
| `coverage` | numbered promises with `funded_by`, uncovered promises, and missing or unknown item citations |
| `stale-scan` | verified-promise freshness, in-scope changed paths, and a recommended `needs_recheck` transition |
| `resume-context` | snapshot identity, mode, promise freshness, durable judgement, closeout/block context, and an execplan tail |

All results include `command`, `ok`, and `problems`. Exit `0` means clean, `1` means a semantic problem such as invalid state, missing coverage, stale evidence, or indeterminate freshness, and `2` means command misuse or an unreadable root boundary. Missing or malformed artifacts in a readable root are reported as JSON problems rather than thrown errors.

`stale-scan` compares committed, staged, unstaged, and untracked paths with each verified promise's evidence scope. A scope entry is either an exact repo-relative file or a trailing-slash directory prefix; globs, negation, absolute paths, and traversal are invalid. The command recommends state changes but never applies them.

## Validate Config

```powershell
npm run validate:config -- workflows\longflow\longflow.config.example.json
npm run validate:config -- workflows\merge-train\merge-train.config.example.json
```

The validator detects Longflow and Merge Train config shapes from `workflow.name` and `workflow.type`.

## Generate Kickoff Prompt

```powershell
npm run prompt:kickoff -- workflows\longflow\longflow.config.example.json outputs\longflow-kickoff.txt
npm run prompt:kickoff -- workflows\merge-train\merge-train.config.example.json outputs\merge-train-kickoff.txt
```

## Shared Tree Sync

`shared/` is the single authoring source for orchestration/review/verification contracts. The flattened copy that ships with skills is generated:

```powershell
npm run sync:shared
```

`npm test` runs `sync:shared -- --check` and fails when the trees drift.

## Markdown Link Validation

```powershell
npm run validate:links
```

## Skill and Agent Validation

```powershell
npm run validate:skills
npm run validate:agents
```

`validate:skills` checks canonical repo skill entrypoints and stale helper discovery. `validate:agents` checks repository-owned reviewer prompts under `workflows/longflow/agents/`, both harness exports, and workflow config persona references.

## Export Installed Skills

```powershell
npm run export:skills
npm run export:agents
npm run validate:install
```

The skill exporter refreshes `~/.agents/skills/metawatch` from this repo and repairs Codex/Claude skill links. The agent exporter links both `~/.agents/agents` and `~/.claude/agents` to the repository-owned prompts. Gemini discovers `~/.agents/skills` directly, so no Gemini skill symlinks are created.
