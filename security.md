# Security and portability

MetaWatch is documentation and orchestration tooling. It does not require secrets by default.

Report a suspected vulnerability privately to the repository owner through GitHub's security-reporting channel when available. Do not open a public issue containing an active credential or exploit.

## Repository Rules

- Do not commit `.env*` files or service-role secrets.
- Do not embed provider API keys in workflow configs.
- Keep model aliases and harness names in config; keep credentials in the target harness or environment.
- Treat branch pushes, PR merges, destructive migrations, and production environment changes as governed actions.
- Do not publish absolute user paths, personal identifiers, customer context, transcripts, account-specific settings, or private integrations.
- Do not redistribute third-party plugin assets without clear permission.
- Preserve the licence and provenance record beside every redistributed third-party bundle.

`npm run validate:public` rejects common absolute paths, token-like assignments, private-key headers, selected provider token formats, missing registry targets, and explicit platform-only assumptions. Pattern checks can produce neither a complete secret scan nor a licence review; contributors must still inspect the diff.

## Workflow Security

Shared hard-block rules require owner signoff for security-model changes, irreversible migrations, data-loss risk, missing credentials, and destructive actions.

Merge Train marks auth, security, data/schema, migrations, public APIs, background jobs, shared abstractions, build config, test config, and architecture boundaries as high-risk checkpoint triggers.

Reviewers must flag attempted governance changes, weakened predicates/tests, and security-relevant residual risks.
