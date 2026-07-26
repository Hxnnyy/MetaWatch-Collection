# Model and Persona Routing

MetaWatch Longflow uses **provider aliases** rather than physical model names everywhere except `modelAliases`. To roll a frontier-version bump, edit `modelAliases` in one place — every routing rule resolves to the new version automatically.

## Aliases

The default opinionated profile defines:

- `frontier-anthropic-strong` — Anthropic's strongest reasoning model.
- `frontier-anthropic-fast` — Anthropic's fast frontier.
- `frontier-openai-strong` — OpenAI's strongest reasoning model (council Stage A heavyweight).
- `frontier-openai-fast` — OpenAI's fast frontier (implementer leads, reviewer panels).
- `frontier-google` — Google's frontier.
- `frontier-xai` — xAI's frontier.
- `frontier-oss` — strongest open-source model, used as council chair.

## Council Composition

- Voting members are drawn from four labs (Anthropic, OpenAI, Google, xAI by default) for independent signal.
- The chair is `frontier-oss` — deliberately drawn from a lab not represented in the voting set, so tie-breaks and severity-downgrade sign-offs are not subject to intra-lab homogenization.
- The chair does not vote; it adjudicates.

## Default Lead Routing

- Frontend-heavy issue lead: `frontier-anthropic-fast`
- Backend-heavy issue lead: `frontier-openai-fast`
- Security-heavy issue lead: `frontier-openai-fast`
- Docs-heavy issue lead: `frontier-openai-fast`

## Default Issue Review Routing

- Frontend-heavy issue reviewers:
  - `frontier-google` for UI and UX quality
  - `frontier-openai-fast` for engineering robustness
- Backend / docs / security-heavy issue reviewers:
  - `frontier-openai-fast` full review
  - `frontier-anthropic-fast` full review

## Default Wave-Gate Panel

All required:

- `frontier-openai-fast`
- `frontier-anthropic-fast`
- `frontier-google`

Each reviewer must explicitly confirm:

1. Scope completeness
2. Test sufficiency and pass status
3. Documentation sufficiency and freshness
4. Engineering quality bar

## Persona Routing for Stage B

Stage B persona selection is **per PRD type**, not always-all-five. The routing table is `routing.personasByPrdType`:

| PRD type    | Personas                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `frontend`  | implementation-quality, product-design, performance                                              |
| `backend`   | implementation-quality, performance, security, documentation                                     |
| `data`      | implementation-quality, security, performance                                                    |
| `infra`     | security, performance, documentation                                                             |
| `fullstack` | implementation-quality, documentation, performance, product-design, security (all five)          |
| `default`   | all five (safety floor for unknown PRD types)                                                    |

A PRD may explicitly include or exclude personas. **Exclusions require chair sign-off with logged rationale.** This keeps rigor where it matters and prevents personas from inventing concerns on PRDs they have no purchase on (e.g. security persona on a pure CSS refactor).

## Default Final Closeout Panel

Models:

- `frontier-openai-fast`
- `frontier-anthropic-fast`
- `frontier-google`

Personas (always all five at final closeout — this is the last gate, not a per-cycle loop):

- implementation-quality-reviewer
- documentation-reviewer
- performance-reviewer
- product-design-reviewer
- security-reviewer

Each persona runs exactly once, distributed round-robin across the closeout models so every lab audits at least one domain. Total required passes by default: 5. If an audit returns `BLOCKED`, re-run that persona on a different closeout model after remediation. The full persona x model cross-product (15 audits) is reserved for PRDs with elevated risk tags (`security`, `data`, migration/irreversible change).

Parent PRD closure condition:

- Every required persona audit reports no blocking findings.

## Editing Routing

- To roll a frontier model: edit only `modelAliases`.
- To change which provider plays which role: edit the alias values in `routing.*`.
- To change Stage B persona load by PRD type: edit `routing.personasByPrdType`.
- Never substitute a model silently — log all overrides in execplan.
