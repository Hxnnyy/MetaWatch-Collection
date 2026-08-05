# Harness Setup (OS Agnostic)

This repository is harness-agnostic by design.

## Goal

Make each skill available in your preferred coding harness with minimal coupling to one vendor.

## Setup Pattern

1. Keep this repository as the source of truth.
2. Register each skill directory in `workflows/longflow/skills` in your harness skill system.
3. Ensure shared files remain reachable at `workflows/longflow/skills/_shared` (generated — run `npm run sync:shared` after editing `shared/`).
4. Use `workflows/longflow/longflow.config.json` to control model and routing policy.

## Recommended Skill Registration Order

1. grilling
2. longflow-orchestrator
3. council
4. write-a-prd
5. prd-to-issues
6. issues-execution

## Compatibility Notes

- If your harness supports named agents, map reviewer persona names directly.
- If your harness does not support named agents, use prompt templates in `workflows/longflow/examples/prompts` and run role-equivalent generic subagent tasks.
- If your harness has no parallel dispatch, run the same process sequentially.

## Validation Checklist

- Skills are visible in your harness.
- Shared contract files are readable.
- Config file validates using `npm run validate:config -- workflows/longflow/longflow.config.json`.
- You can generate a kickoff prompt using `npm run prompt:kickoff -- workflows/longflow/longflow.config.json`.
- Cross-provider adjudication CLIs listed in `adjudication.providers` are installed, or the config records the same-provider fallback.
- Long-horizon persistence comes from the harness plus `STATE.json` — no heartbeat watcher is needed.
