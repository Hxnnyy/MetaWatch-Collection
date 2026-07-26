# Review-first installation

MetaWatch does not prescribe a universal harness directory. Coding agents should discover the conventions supported by the user's current tool and project, then propose an integration.

## Canonical agent prompt

> Inspect this MetaWatch checkout, its `registry.json`, and the target project's existing agent instructions and harness configuration. Propose the smallest useful set of MetaWatch primitives and show which existing files each would affect. Merge rather than overwrite: preserve local rules and customisations, resolve conflicts explicitly, and do not import credentials, private context, account-specific data, absolute machine paths, machine-specific settings, or private integrations. Do not invent an installation location; use only a location documented by the target harness or selected by the user. Before writing, summarize the proposed changes and exclusions. After approval, make reviewable changes, run MetaWatch and target-project checks, inspect the diff for portability hazards, and summarize exactly what changed.

## Agent checklist

1. Read `registry.json` and the selected primitive READMEs.
2. Inspect existing project and user instructions; more specific local rules remain authoritative.
3. Propose additions and conflicts before modifying harness state.
4. Copy only selected registered files and their declared dependencies.
5. Merge instruction text; never replace an existing `AGENTS.md` wholesale.
6. Run `npm test` in MetaWatch and the relevant checks in the target project.
7. Review the resulting diff and report preserved customisations and exclusions.

The repository's legacy export helpers are maintainer conveniences for an already configured local harness. They are not the public installation contract.
