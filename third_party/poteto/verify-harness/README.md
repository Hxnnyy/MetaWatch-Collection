# Verify harness

**Problem:** proving app behavior by hand takes a different path every run, and any written verification recipe rots as the app changes.

**Why useful:** one branch generates a project-local `verify-<app>` skill — launch, doctor, drive, evidence, cleanup, helpers, plus a per-feature map — and proves it by running it once before handover. The other branch is the upkeep pass: parallel source readers per feature, a required live drive of every feature, at most one PR of proven corrections.

**Scope:** creating and maintaining project-local verification skills. Walkthrough verification consumes the generated skill (`shared/verification/walkthrough-verification.md`); this skill does not replace that contract.

**Provenance:** adapted from pstack's `create-verification-skill` and `maintain-verification-skill` (cursor/plugins pstack, MIT), merged into one two-branch skill with this collection's project-skill path conventions.

**Use:** invoke `verify-harness` by name in the target repo and say whether you want a verify skill generated, audited read-only, or maintained. Follow the bundle-local [installation guidance](../INSTALL.md).
