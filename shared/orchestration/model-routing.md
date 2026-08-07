# Model Routing

Model routing is configured in `workflows/longflow/longflow.config.json`.

## Aliases, Not Versions

All routing references **aliases** (e.g. `frontier-anthropic-fast`), not physical model names. The alias→physical mapping lives in one place: `modelAliases` in the config. When a frontier model is superseded, update `modelAliases` only.

Standard aliases:

- `frontier-anthropic-strong` — Anthropic's strongest reasoning model.
- `frontier-anthropic-fast` — Anthropic's fast frontier.
- `frontier-openai-strong` — OpenAI's strongest reasoning model.
- `frontier-openai-fast` — OpenAI's fast frontier.
- `frontier-google` — Google's frontier.
- `frontier-xai` — xAI's frontier.

## The judgment rule

Route by the kind of work, not by habit:

- **Judgment calls** — intent audits, proportionality verdicts, tier decisions, the council pragmatist seat, adjudication — go to the **strongest available model** (`routing.intentAuditor`, default `frontier-anthropic-strong`). Common-sense proportionality judgement is precisely what separates the strongest models from heavily RL-tuned fast tiers; this is the wrong place to economise.
- **Mechanical work** — implementation, targeted review, walkthroughs, spikes — goes to fast tiers.

## Council

- `models.council` — the member set, mixed labs, one member briefed as the pragmatist seat (strongest model).
- `models.councilChair` — Google by default, excluded from council membership so it remains lab-independent. Owns dispositions, tie-breaks, and severity-downgrade sign-off. Does not vote. See `council-protocol.md`.

## Adjudication (cross-provider)

`adjudication.providers` lists headless CLIs available on the machine for second opinions on contested intent-audit verdicts at T3 (e.g. `codex exec`, `cursor-agent`, `grok`), in preference order. If none is available, fall back to a fresh-context same-provider sceptic and record `weaker: same-provider`. See `../review/intent-audit.md`.

## Default Lead Routing

- frontend: `frontier-anthropic-fast`
- backend: `frontier-openai-fast`
- security: `frontier-openai-fast`
- docs: `frontier-openai-fast`

## Reviewer Routing

Issue-level reviews use models from `routing.reviewersByIssueType`. Promise-gate panels are risk-routed by persona (`../review/reviewer-protocol.md`) and use models from `routing.promiseGateReviewers`. The intent auditor always resolves via `routing.intentAuditor`.

At T2+, in the initial final-closeout cycle, each required persona runs **exactly once**, distributed round-robin across `routing.finalCloseoutModels` so more than one lab audits the result. If a final audit returns `BLOCKED`, remediate and re-run only the affected persona on a different model; that is the next review cycle and counts against the shared 3-cycle budget. T1 has no reviewer panel.

## Fallback Rules

If a configured alias resolves to an unavailable physical model:

1. Use the designated backup from config if present.
2. If no backup is configured and no approved substitute is available, fire hard-block 7 (unsatisfied external-system dependency) for model substitution approval.
3. Record substitution rationale in the execplan.

## Routing Integrity Rule

Do not silently swap lead or reviewer routing. All substitutions must be explicit, logged, and reviewable. Updating `modelAliases` for a frontier-version bump is not a substitution and does not require approval.
