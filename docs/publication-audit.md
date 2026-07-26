# Public harness audit

Audit date: 2026-07-26.

## Method

Every included item was checked for utility, portability, dependency completeness, secrets/private context, and redistribution provenance. Third-party bundles require an authoritative MIT licence, creator, upstream repository and path, pinned revision, exact/adapted status, modifications, dependencies, and installation disposition.

## Included

- MetaWatch-owned: Longflow, Merge Train, `code-economy`, and the user's original `frontend-design`. The latter draws on the author's earlier design work and general influences; it is not represented as sourced from a third-party repository.
- Matt Pocock MIT collection: exact installed snapshots of `codebase-design`, `domain-modeling`, and `writing-great-skills`; adapted installed snapshots of `improve-codebase-architecture`, `tdd`, `wayfinder`, and `grilling`. They remain one dependency-complete bundle.
- Emil Kowalski MIT: adapted `frontend-design-plus` bundle.
- Corey Haines MIT: the complete adapted marketing router with `ai-seo`, `cold-email`, `copywriting`, `pricing-strategy`, `product-marketing-context`, and `programmatic-seo`.
- Upstash Context7 MIT: adapted `context7-cli` guidance. The external CLI is not embedded; Node.js plus `npx ctx7@latest` is the honest prerequisite path.

See each third-party `provenance.json` and retained `LICENSE` for exact evidence.

## Excluded

- `hatch-pet` and `keep-codex-fast`: harness-specific rather than portable catalog primitives.
- `loop-company`: experimental.
- `remotion-best-practices`: no authoritative redistribution licence was available.
- `supabase-secure-by-default`: too specialised to Supabase RLS for this curated collection.
- Every other installed skill not explicitly listed above: outside the user's exact curation decision.
- Machine-global instructions/settings, plugin cache, hooks, symlinks, credentials, private context, account data, absolute machine paths, and unpublished integration material: categorically excluded.
