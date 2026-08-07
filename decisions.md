# Decisions

## 2026-05-14: Convert to Workflow-Pack Repository

Decision: reposition the repository from Arkwright Longflow to Arkwright Workflows, with Longflow as `workflows/longflow` and Merge Train as `workflows/merge-train`.

Rationale: the repository now contains more than one agentic delivery protocol. A workflow-pack layout lets each workflow be self-contained while sharing governance primitives.

## 2026-05-14: Canonical Shared Primitives Live Under `shared/`

Decision: shared orchestration, review, verification, and template docs live under `shared/`.

Rationale: Longflow and Merge Train both need continuous mode, durable state, heartbeat recovery, reviewer protocols, predicate/test adequacy, and autonomy governance. Centralizing these rules avoids drift.

## 2026-05-14: Keep Longflow Compatibility References

Decision: preserve Longflow's local `skills/_shared` folder while adding references to canonical shared docs.

Rationale: existing harness registrations may expect those local paths. The new canonical location can be adopted without breaking every old reference at once.

## 2026-05-14: Workflow-Aware Scripts Instead of Separate Script Families

Decision: keep script names stable and make them workflow-aware.

Rationale: `npm run validate:config` and `npm run prompt:kickoff` remain simple operator commands while supporting both current workflow packs.

## 2026-05-25: Merge Train Gets a Workflow-Local Strict Review Bar

Decision: add `workflows/merge-train/docs/STRICT_REVIEW_BAR.md` and reference it from child audits, parent checkpoints, final closeout, handover, and report templates.

Rationale: Merge Train handles large parent branches where ordinary correctness review is insufficient. The stricter bar makes maintainability regressions, large-file sprawl, ad-hoc branching, weak type boundaries, misplaced logic, and missed structural simplifications explicit blockers unless accepted as residual risk.

## 2026-05-27: Repository Becomes Canonical Skill Source

Decision: keep workflow skills canonical in this repository and export them into `~/.agents/skills/metawatch` for harness discovery.

Rationale: `.agents` is not a git repository, so direct installed-skill edits drift without review history. Repo-first iteration gives workflow changes normal diff, validation, and rollback behavior while still keeping Codex, Claude Code, and Gemini pointed at the same installed skill group.

## 2026-05-27: Merge Train Uses One Public Skill

Decision: collapse Merge Train helper skills into one public `merge-train` skill with internal references and templates.

Rationale: users invoke Merge Train by intent and may start from no PR, an existing parent PR, existing children, or a partial train. One entry point can detect state and continue correctly; helper skills created unnecessary discovery ambiguity for phases that are rarely invoked directly.

## 2026-07-10: Model-Capability Recalibration Pass

Decision: five changes driven by the July 2026 harness/skills audit.

1. Entry-point skills (`longflow-orchestrator`, `merge-train`, `codebase-quality-sweep`) set `disable-model-invocation: true` with shortened human-facing descriptions. They are invoked deliberately by the operator; removing their descriptions from always-on harness context is free. Chain skills (`council`, `write-a-prd`, `prd-to-issues`, `issues-execution`) stay model-invocable because the orchestrator dispatches them.
2. The self-improvement footer/observations.jsonl protocol is retired from skill sources and the export script. Four months of empty observation logs showed the trigger never fires; feedback now flows through operator review and this decisions log.
3. Continuous-mode ceremony trimmed: `CONTINUOUS_DIRECTIVE.md` re-reads move from every batch iteration to every wave; `STATE.json` updates move from every event to child status changes, reviewer verdicts, wave transitions, and hard-blocks. Current models hold contracts across far longer spans; finer-grained events live in the execplan.
4. Default final closeout drops from the 15-audit persona x model cross-product to 5 audits (each persona once, round-robin across closeout models). The cross-product is reserved for elevated-risk PRDs. Escalation on `BLOCKED` re-runs the persona on a different model.
5. `continuous-stop-guard` is wired run-scoped into the target project's settings at Phase 0 and removed at closure, instead of being a recommended global registration. Global always-on hooks contradict the operator's harness posture.

Also: `grill-me` references now point at the model-invocable `grilling` skill (the global `grill-me` is a user-invoked wrapper other skills cannot reach), `grill-me` removed from stale-skill cleanup so the export no longer deletes the standalone skill's harness symlinks, anti-pattern lists deduplicated against hard rules, and Anthropic model aliases bumped (Fable 5 / Sonnet 5).

## 2026-07-10: Symmetric Strong/Fast Alias Tiers; Orchestrator Model Fields Dropped

Decision: OpenAI aliases follow the same two-tier convention as Anthropic — `frontier-openai-strong` (GPT-5.6-Sol) and `frontier-openai-fast` (GPT-5.6-Terra) — replacing `frontier-openai`, `frontier-openai-code`, and `frontier-openai-orchestrator`. The `models.orchestrator` (longflow) and `models.orchestratorModel` (merge-train) config fields are removed.

Rationale: the orchestrator is whatever model the operator's harness session is already running; configuring it was dead weight and implied a dispatch that never happens. The strong/fast split maps cleanly onto how models are actually used: strong tiers appear only in council Stage A; fast tiers do implementation leads, reviewer panels, wave gates, and final closeout. OpenAI no longer ships a code-specialised frontier, so the -code alias lost its meaning.

## 2026-07-16: Longflow Uses a Bounded, Reaped Agent Pool

Decision: Issues Execution records every spawned agent in durable state, reserves two thread slots, defaults child delegation to zero, reconciles the pool before dispatch and after compaction, and closes consumed implementers and reviewers promptly. Agent-limit failures receive one cleanup/retry before concurrency is reduced or execution falls back to sequential work.

Rationale: completed-but-open threads can continue occupying harness capacity and accumulate as stale UI entries. Treating return, consumption, and closure as separate lifecycle states prevents slot exhaustion, preserves room for corrective and review work, and makes recovery after context compaction deterministic.

## 2026-07-19: Hard Review-Cycle Budget of 3 Per Gate

Decision: replace the per-reviewer iteration cap with a hard budget of 3 review cycles per gate (each wave gate and the final-closeout panel). A cycle is any reviewer dispatch against the gate plus its remediation; relabelled "fresh"/"final"/"zero-blocker" panels count against the same budget. At the budget, only material findings (exploitable security vulnerability, data loss/corruption, tenant-isolation breach, failing predicate/test) hard-block; all other open findings are recorded as residual findings and carried to `merge-train`, which re-reviews the full branch pre-merge and is the designated backstop. Merge Train's own audit-remediate loop is likewise capped at 3 cycles per child, with cap-hit held for owner disposition. `STATE.json` gains `reviewer_verdicts.<gate>.review_cycles`.

Rationale: repeated relabelling of review panels can bypass a per-reviewer cap, producing diminishing returns while remediation itself creates new review surface. A gate-scoped budget that no renaming can reset bounds the loop, while Merge Train remains the pre-merge backstop.

## 2026-07-26: Publish the Portable Harness as MetaWatch

Decision: make MetaWatch the public repository identity and distribute a registry of review-first, portable primitives. Preserve Longflow and Merge Train, and add only audited user-authored skills that are self-contained and general-purpose.

Rationale: the useful product is a curated harness distribution, not a machine-global configuration dump or a cosmetic rename. Installation must inspect and merge with local rules; ambiguous provenance, private context, credentials, machine paths, plugin-owned material, and platform-specific configuration remain excluded. The Git history preserves the repository's earlier Arkwright identity.

## 2026-07-26: Add a Provenance-Gated Skill Catalog

Decision: expand MetaWatch Collection with the exact curated skill set recorded in `registry.json`. MetaWatch-owned work and third-party work have distinct ownership metadata. Third-party skills ship only as dependency-complete roots with pinned provenance and retained MIT notices.

Rationale: a centralized harness catalog is useful only when direct users can tell what is original, exact, adapted, externally dependent, or excluded. Bundle-level installation prevents relative references and companion-skill dependencies from being separated.

## 2026-08-05: Pragmatic Longflow — Intent Contracts, Calibration, and Promise Gates

Decision: rework Longflow from a fixed process into a calibrated toolkit. Nine linked changes:

1. **Intent contract** (`INTENT.md`): every run anchors to a short, frozen, plain-business-language statement of promises, non-goals, and product class, drafted during grilling and amendable only by the owner. Resolution order: intent > PRD > issues > code.
2. **Process calibration**: an explicit tier decision (T0 "just build it" through T3 "fortress") opens every run, with per-item rigour classes (`production-transferable` / `dogfood-disposable` / `spike`) and an asymmetric breakglass — skipping tier-default ceremony is a recorded one-liner; adding ceremony above defaults needs independent concurrence. Standing default: err toward under-engineering.
3. **Intent auditor**: a fresh-context persona on the strongest available model runs a blocking bidirectional coverage audit at slicing, audits every T2+ promise gate, and fires on tripwires (gates burning review cycles, checks satisfied by check-shaped machinery, ~2× spend, status updates that cannot name a product outcome, process self-praise). Its descope verdicts are binding at T1–T2; contested T3 verdicts go to cross-provider adjudication via headless CLIs.
4. **Promise gates replace wave gates**: waves schedule silently; gates attach to intent-contract promises and open with a fresh-agent walkthrough of the user journey. Verification is through use, not only predicates.
5. **Two-tier acceptance**: promise-level acceptance is frozen (owner-amendable only); item-level checks are proportionate to rigour class and renegotiable through the visible course-correction channel. Course corrections gain the symmetric forbidden list — gold-plating is the same offence as corner-cutting.
6. **Local ledger by default**: items live in `tasks/ledger/*.json`; GitHub becomes an optional projection. Artifact set consolidates to INTENT/STATE/ledger/execplan; heartbeat protocol, watcher, and CONTINUOUS_DIRECTIVE.md are retired (directive folds into `STATE.json.directive`); the stop-guard hook is demoted to optional.
7. **Council reshaped**: one time-boxed adversarial round with a standing pragmatist seat; empirical disagreements are settled by spikes, not argument; the two-stage convergence loop is retired (a second round is a T3 exception).
8. **Reviewer personas consolidated 8 → 4 + auditor**: implementation (absorbs quality/architecture/regression-test), product (design + documentation), operations (performance + runtime-integration), security unchanged, plus intent-auditor. More seats had produced more findings, not more caught defects.
9. **Plain-English reporting and the retro loop**: substantive execplan entries and all owner-facing reports open with what happened / what we decided / what it means for the product / intent-match confidence; closeout appends a retro to `RUNS.md` so runs compound.

Rationale: field experience with long autonomous runs showed models over-indexing on ceremony — literal, maximal execution losing sight of business intent. The definitive incident: a ~110-item programme whose most central product promise was unbuilt and untracked while elaborate compliance machinery accumulated around it, caught only by an owner-triggered fresh-context intent audit whose prompt this rework canonises. The recovery phase of that run independently invented the intent-authority document, the per-item disposition field, and product-outcome gate reviews — this rework generalises what that run learned. RL-trained agents need structural counterweights, not exhortation: a frozen reference, scheduled independent audits with authority to act, and incentives that make descoping cheap and gold-plating expensive. `shared/` additionally becomes the single authoring source for the shipped `_shared` tree via `scripts/sync-shared.mjs`.

## 2026-08-07: Longflow Mechanics Stay Read-Only and Harness-Neutral

Decision: expose `validate`, `coverage`, `stale-scan`, and `resume-context` through one dependency-free ESM core and a thin compact-JSON command line. Commands may inspect durable artifacts and Git but only report problems, freshness, and recommended transitions; they never write run state.

Rationale: validation, trace coverage, path comparison, and resume projection are deterministic work that should not consume model judgement. Keeping mutation and provider integration outside this boundary preserves the agent's authority over lifecycle decisions and gives programmatic tool calling, MCP, hooks, and adapters time to earn their place through dogfooding.
