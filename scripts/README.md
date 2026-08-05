# Scripts

These helpers are workflow-aware.

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

`validate:skills` checks canonical repo skill entrypoints and stale helper discovery. `validate:agents` checks canonical reviewer personas under `~/.agents/agents` and verifies workflow config persona references.

## Export Installed Skills

```powershell
npm run export:skills
npm run export:agents
npm run validate:install
```

The skill exporter refreshes `~/.agents/skills/metawatch` from this repo and repairs Codex/Claude skill links. The agent exporter repairs Claude reviewer-persona symlinks from `~/.agents/agents`. Gemini discovers `~/.agents/skills` directly, so no Gemini skill symlinks are created.
