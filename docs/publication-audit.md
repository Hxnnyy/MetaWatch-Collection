# Public harness audit

Audit date: 2026-07-26.

## Method

The repository and the user-authored skill collection were inspected for general utility, self-containment, machine paths, personal or account context, secrets, private integrations, platform assumptions, product-internal material, and redistribution provenance. Ambiguity was treated as exclusion.

## Included

- Existing Longflow and Merge Train packs: already public under this repository's MIT licence and integral to the distribution.
- `code-economy`: general coding discipline with no external service or machine dependency.
- `tdd`: general test workflow, reduced to a self-contained public core.
- `supabase-secure-by-default`: concise security posture guidance; it contains no integration code or credentials and clearly delegates product mechanics to official tooling.

The added standalone skill copies are curated snapshots. Their READMEs document scope and limitations.

## Excluded

- Machine-global `AGENTS.md` and harness settings: contain Windows-specific operating rules and local tool choices. A generic merge-safe example is provided instead.
- `.system`, `.claude`, `_meta`, cache, hooks, agent registrations, and symlinks: harness-owned or machine-specific.
- Plugin-provided skills and integrations: redistribution rights and runtime dependencies are outside this repository.
- `context7-cli`: relies on a named external service and local Node-management policy.
- `frontend-design`, `improve-codebase-architecture`, `grilling`, `domain-modeling`, `codebase-design`, and `writing-great-skills`: useful but carry supporting agents, references, workflow coupling, or broader provenance that was not necessary for this release.
- `frontend-design-plus`, `hatch-pet`, `keep-codex-fast`, `loop-company`, `marketing`, `remotion-best-practices`, and `wayfinder`: product-, brand-, environment-, or provenance-specific; not required for the portable core.
- Private repositories, transcripts, user context, credentials, account data, absolute paths, and unpublished integration material: categorically excluded.

Exclusion is not a quality judgment. It means the asset did not clear the necessity, portability, and redistribution bar for this release.
