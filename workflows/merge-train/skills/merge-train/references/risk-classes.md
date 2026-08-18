# Merge Train Risk Classes

## Low

Examples:

- docs-only changes,
- isolated UI copy,
- narrow non-runtime cleanup.

Handling:

- combined audit and remediation is acceptable,
- one fresh verifier is acceptable,
- parent checkpoint usually not required unless batch policy triggers it.

## Medium

Examples:

- normal feature slice,
- localized behavior change,
- bounded frontend or backend change.

Handling:

- audit and remediation may be combined,
- verifier must be separate,
- checkpoint follows normal batch policy.

## High

Examples:

- auth,
- security,
- data/schema,
- public API,
- background jobs,
- shared abstractions,
- build/test config.

Handling:

- separate auditor, remediator, and verifier required,
- parent checkpoint after merge required.

## Critical

Examples:

- potential data loss,
- security model change,
- irreversible migration,
- public contract break.

Handling:

- hard block or human signoff unless config explicitly permits autonomous handling.

## Defaults are a ceiling as well as a floor

Each class's handling is the default bundle in both directions. Skipping below it is a one-line breakglass entry in the execplan — record and continue. Adding ceremony above it — extra reviewers, extra cycles, extra checkpoints — requires intent-auditor concurrence before the ceremony is added; gold-plating review is a scope change like any other.
