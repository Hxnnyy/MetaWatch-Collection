# Model and Persona Routing

MetaWatch Longflow uses **provider aliases** rather than physical model names everywhere except `modelAliases`. To roll a frontier-version bump, edit `modelAliases` in one place — every routing rule resolves to the new version automatically.

## Aliases

The default opinionated profile defines:

- `frontier-anthropic-strong` — Anthropic's strongest reasoning model.
- `frontier-anthropic-fast` — Anthropic's fast frontier.
- `frontier-openai-strong` — OpenAI's strongest reasoning model.
- `frontier-openai-fast` — OpenAI's fast frontier (implementer leads, reviewer panels).
- `frontier-google` — Google's frontier and the default council chair.
- `frontier-xai` — xAI's frontier.

## The Judgment Rule

Route by the kind of work:

- **Judgment calls** — intent audits, proportionality and tier decisions, the council pragmatist seat, adjudication — go to the strongest available model: `routing.intentAuditor` (default `frontier-anthropic-strong`). Common-sense proportionality judgement is what separates the strongest models from heavily RL-tuned fast tiers; never economise here.
- **Mechanical work** — implementation, targeted review, walkthroughs, spikes — goes to fast tiers.

## Council Composition

- Members are drawn from Anthropic, OpenAI, and xAI for independent signal; one member carries the pragmatist seat on the strongest model.
- The chair is `frontier-google` — deliberately excluded from membership so dispositions and severity-downgrade sign-offs remain lab-independent. The chair does not vote; it adjudicates. See `../../../shared/orchestration/council-protocol.md`.

## Cross-Provider Adjudication

`adjudication.providers` lists headless CLIs (e.g. `codex exec`, `cursor-agent`, `grok`) used for second opinions on contested intent-audit verdicts at T3. If the adjudicator concurs with the auditor, the verdict is final. No second provider available → fresh-context same-provider sceptic, recorded as `weaker: same-provider`.

## Default Lead Routing

- Frontend-heavy issue lead: `frontier-anthropic-fast`
- Backend-heavy issue lead: `frontier-openai-fast`
- Security-heavy issue lead: `frontier-openai-fast`
- Docs-heavy issue lead: `frontier-openai-fast`

## Default Issue Review Routing

Issue-level reviews take their models from `routing.reviewersByIssueType`:

- Frontend-heavy issue reviewers:
  - `frontier-google` for UI and UX quality
  - `frontier-openai-fast` for engineering robustness
- Backend / docs / security-heavy issue reviewers:
  - `frontier-openai-fast` full review
  - `frontier-anthropic-fast` full review

## Promise-Gate Panel

Reviewers are **risk-routed by persona** (`../../../shared/review/reviewer-protocol.md`): only personas whose domain the promise's items touch are dispatched, on models from `routing.promiseGateReviewers`. A gate whose items are all disposable gets no panel — its gate is the walkthrough. The intent auditor attends every T2+ gate regardless, via `routing.intentAuditor`.

## Default Final Closeout Panel (T2+)

Models: `routing.finalCloseoutModels` (three labs by default).

Personas (`routing.finalCloseoutPersonas` — the consolidated roster):

- implementation-reviewer
- product-reviewer
- operations-reviewer
- security-reviewer

In the initial cycle each persona runs exactly once, distributed round-robin across the closeout models so every lab audits at least one domain. If an audit returns `BLOCKED`, re-run that persona on a different closeout model after remediation. The full persona x model cross-product is reserved for elevated risk tags (`security`, `data`, migration/irreversible change) at T3. T1 has no final reviewer panel.

Normal closure requires every required persona audit to report no blocking findings, the end-to-end walkthrough to hold, and the final intent audit to be `aligned`. The budget-exhausted exception is separate: after cycle 3, only non-material findings may close as `closed_with_residuals`. Preserve raw blocking verdicts unchanged and record dispositions separately; a material finding still hard-blocks.

## Editing Routing

- To roll a frontier model: edit only `modelAliases`.
- To change which provider plays which role: edit the alias values in `routing.*`.
- Never substitute a model silently — log all overrides in the execplan.
