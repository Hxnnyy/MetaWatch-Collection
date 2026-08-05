# MetaWatch Collection

MetaWatch Collection is a portable, review-first catalog of coding-agent workflows, skills, and governance primitives. It combines MetaWatch-owned work with clearly licensed snapshots and adaptations while keeping provenance and installation boundaries explicit.

## Start here

- Choose [Longflow](workflows/longflow/README.md) to take rough intent through calibrated planning, implementation, review, and handover — it sizes its own ceremony to the task, from "just build it" to full governance.
- Choose [Merge Train](workflows/merge-train/README.md) to audit and remediate a large branch or pull request before merge.
- Browse [the primitive registry](registry.json) for every distributed workflow, skill, and example.
- Read [installation guidance](INSTALL.md) before asking an agent to integrate MetaWatch into a harness.
- Review [security and portability rules](security.md) before publishing changes.

MetaWatch is guidance and local tooling, not an autonomous deployment system. Its workflows still require the target repository's instructions, tests, permissions, and owner decisions.

## Quick start

Requires Git and a current Node.js runtime. No package installation is required.

```sh
git clone https://github.com/Hxnnyy/MetaWatch-Collection.git
cd MetaWatch-Collection
npm test
```

Then give your coding agent the canonical prompt in [INSTALL.md](INSTALL.md). The prompt tells it to inspect your existing harness, propose a merge, preserve local customisations, and run checks. Do not copy a whole directory over an existing harness blindly.

To try a workflow without installing skills:

```sh
cp workflows/longflow/longflow.config.example.json workflows/longflow/longflow.config.json
npm run validate:config -- workflows/longflow/longflow.config.json
npm run prompt:kickoff -- workflows/longflow/longflow.config.json
```

PowerShell users can replace `cp` with `Copy-Item`.

## Repository map

| Path | Purpose |
| --- | --- |
| `workflows/longflow/` | Intent-to-delivery workflow pack |
| `workflows/merge-train/` | Pre-merge audit and remediation workflow |
| `skills/` | Small, independently useful portable skills |
| `third_party/` | MIT-licensed snapshots and adaptations with retained notices |
| `shared/` | Orchestration, review, verification, and state contracts |
| `examples/AGENTS.md` | OS-agnostic project-instruction example |
| `registry.json` | Machine-readable public primitive index |
| `scripts/` | Validation and optional local workflow helpers |

## Skill catalog

- **MetaWatch workflows:** Longflow and Merge Train.
- **MetaWatch-owned skills:** `code-economy` and `frontend-design`.
- **Matt Pocock collection:** `codebase-design`, `domain-modeling`, `writing-great-skills`, `improve-codebase-architecture`, `tdd`, `wayfinder`, and `grilling`.
- **Design:** Emil Kowalski's adapted `frontend-design-plus`.
- **Marketing:** Corey Haines' six-workflow package—AI SEO, cold email, copywriting, pricing strategy, product marketing context, and programmatic SEO.
- **Current docs:** `context7-cli`, with the external Context7 CLI as an explicit prerequisite.

`writing-great-skills` is the highlighted meta-skill for codifying repeatable knowledge into predictable new skills. It covers invocation, information hierarchy, progressive disclosure, completion criteria, pruning, and common failure modes.

Each bundle has a README. Third-party bundles also carry a retained licence and machine-readable provenance record.

## Safety model

MetaWatch deliberately excludes global configuration, credentials, personal or client context, account identifiers, private integrations, machine paths, platform-only setup, plugin-owned skills, and assets with unclear redistribution rights. The source audit and exclusions are recorded in [docs/publication-audit.md](docs/publication-audit.md).

`npm test` validates the registry, skills, links, configs, and common portability hazards. Automated scanning is a guardrail, not a substitute for review.

## History

MetaWatch evolved from the public Arkwright Workflows repository. Git history and the decision log preserve that provenance; current public product names and examples use MetaWatch.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). MetaWatch-owned work is available under the root [MIT License](LICENSE). Third-party bundles retain their own licences and notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
