# MetaWatch

MetaWatch is a portable, review-first collection of coding-agent workflows, skills, and governance primitives. It packages the parts of a working harness that can safely travel between projects without carrying credentials, personal context, private integrations, or machine-specific configuration.

## Start here

- Choose [Longflow](workflows/longflow/README.md) to take rough intent through planning, implementation, review, and handover.
- Choose [Merge Train](workflows/merge-train/README.md) to audit and remediate a large branch or pull request before merge.
- Browse [the primitive registry](registry.json) for every distributed workflow, skill, and example.
- Read [installation guidance](INSTALL.md) before asking an agent to integrate MetaWatch into a harness.
- Review [security and portability rules](security.md) before publishing changes.

MetaWatch is guidance and local tooling, not an autonomous deployment system. Its workflows still require the target repository's instructions, tests, permissions, and owner decisions.

## Quick start

Requires Git and a current Node.js runtime. No package installation is required.

```sh
git clone https://github.com/Hxnnyy/MetaWatch.git
cd MetaWatch
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
| `shared/` | Orchestration, review, verification, and state contracts |
| `examples/AGENTS.md` | OS-agnostic project-instruction example |
| `registry.json` | Machine-readable public primitive index |
| `scripts/` | Validation and optional local workflow helpers |

Each distributed skill folder includes a README covering its purpose, value, limitations, and usage.

## Safety model

MetaWatch deliberately excludes global configuration, credentials, personal or client context, account identifiers, private integrations, machine paths, platform-only setup, plugin-owned skills, and assets with unclear redistribution rights. The source audit and exclusions are recorded in [docs/publication-audit.md](docs/publication-audit.md).

`npm test` validates the registry, skills, links, configs, and common portability hazards. Automated scanning is a guardrail, not a substitute for review.

## History

MetaWatch evolved from the public Arkwright Workflows repository. Git history and the decision log preserve that provenance; current public product names and examples use MetaWatch.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). MetaWatch is available under the [MIT License](LICENSE).
