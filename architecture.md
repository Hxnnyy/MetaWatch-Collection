# Architecture

MetaWatch is organized as a registry-backed primitive repository.

## Boundaries

- Root docs explain the product identity, workflow choice, migration notes, and validation commands.
- `workflows/<name>/` contains self-contained workflow packs with README, docs, skills, examples, templates, and config.
- `shared/` contains canonical orchestration, review, verification, and template primitives reused across workflows.
- `scripts/` contains workflow-aware utilities that operate on workflow config files, repository docs, and durable Longflow run state.
- `skills/` contains small, independently installable portable skills.
- `third_party/` contains dependency-complete imported/adapted bundles, each with its own licence and machine-readable provenance.
- `registry.json` is the public index and installation boundary; entries point to existing primitives and their human-readable documentation.

## Current Workflow Packs

- `workflows/longflow/`: calibrated delivery from rough intent — intent contract, tier calibration, optional council and PRD, ledger slicing, continuous execution with promise gates, closeout, and retro.
- `workflows/merge-train/`: large parent PR/branch audit, child PR remediation, parent integration checkpoints, and final manual-review readiness. Merge Train owns a workflow-local strict review bar for structural maintainability checks that are stronger than the shared reviewer baseline.

## Shared Primitives

Shared primitives intentionally stay small and protocol-oriented. Workflow packs reference them rather than duplicating the same rules in full. This keeps intent contracts, process calibration, promise gates, continuous mode, bounded agent lifecycle, hard blocks, reviewer semantics, intent audits, walkthrough verification, strict structural review, predicate/test adequacy, autonomy envelope, and course-correction behavior consistent. `shared/` is the single authoring source; `workflows/longflow/skills/_shared/` is generated from it by `scripts/sync-shared.mjs`.

## Scripts

`scripts/validate-config.mjs` detects Longflow and Merge Train config shapes. `scripts/generate-kickoff-prompt.mjs` emits workflow-specific kickoff prompts. `scripts/sync-shared.mjs` generates the shipped `_shared` tree from `shared/` (with `--check` for CI). `scripts/validate-markdown-links.mjs` provides lightweight path/link validation for docs-heavy changes.

Longflow's deterministic inspection boundary is one dependency-free ESM module, `scripts/longflow-core.mjs`, consumed by the thin JSON launcher `scripts/longflow.mjs`. The core validates v4 state and ledger shape, audits promise funding, compares evidence scopes with Git changes, and projects durable resume context. It reads repository state and returns recommendations; it has no mutation, provider-adapter, MCP, hook, or remote-access surface.
