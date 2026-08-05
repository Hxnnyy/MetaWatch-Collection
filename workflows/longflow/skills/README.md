# Skills Index

MetaWatch Longflow exposes these public skills:

1. `longflow-orchestrator`
2. `council`
3. `write-a-prd`
4. `prd-to-issues`
5. `issues-execution`
6. `codebase-quality-sweep`

Use global `grilling` before Longflow when rough intent needs stress testing. `skills/_shared` is generated from the canonical `../../../shared` tree by `npm run sync:shared` — edit `shared/`, never `_shared/`.

Recommended order:

`grilling` -> `longflow-orchestrator` -> `council` -> `write-a-prd` -> `prd-to-issues` -> `issues-execution`

Optional quality-hardening path:

`codebase-quality-sweep` -> `prd-to-issues` -> `issues-execution`
