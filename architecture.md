# Architecture

MetaWatch is organized as a registry-backed primitive repository.

## Boundaries

- Root docs explain the product identity, workflow choice, migration notes, and validation commands.
- `workflows/<name>/` contains self-contained workflow packs with README, docs, skills, examples, templates, and config.
- `shared/` contains canonical orchestration, review, verification, and template primitives reused across workflows.
- `scripts/` contains workflow-aware utilities that operate on workflow config files and repository docs.
- `skills/` contains small, independently installable portable skills.
- `third_party/` contains dependency-complete imported/adapted bundles, each with its own licence and machine-readable provenance.
- `registry.json` is the public index and installation boundary; entries point to existing primitives and their human-readable documentation.

## Current Workflow Packs

- `workflows/longflow/`: planned delivery from rough intent to PRD, child issues, implementation waves, final closeout, and handover.
- `workflows/merge-train/`: large parent PR/branch audit, child PR remediation, parent integration checkpoints, and final manual-review readiness. Merge Train owns a workflow-local strict review bar for structural maintainability checks that are stronger than the shared reviewer baseline.

## Shared Primitives

Shared primitives intentionally stay small and protocol-oriented. Workflow packs reference them rather than duplicating the same rules in full. This keeps continuous mode, bounded agent lifecycle, hard blocks, heartbeat recovery, reviewer semantics, strict structural review, predicate/test adequacy, autonomy envelope, and course-correction behavior consistent.

## Scripts

`scripts/validate-config.mjs` detects Longflow and Merge Train config shapes. `scripts/generate-kickoff-prompt.mjs` emits workflow-specific kickoff prompts. `scripts/validate-markdown-links.mjs` provides lightweight path/link validation for docs-heavy changes.
