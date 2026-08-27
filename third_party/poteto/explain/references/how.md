# How branch

Build a working mental model of how something works — the level of a senior engineer onboarding onto the subsystem, not annotated source. Explanation only; problems and improvements route to reviewers or council after the explanation is delivered.

## 1. Scope and triage

Restate the question's scope in one line: a subsystem, a feature flow, an architectural overview, or a runtime trace. Then triage:

- **Simple** — one module, one utility, one function: explore and explain yourself in a single pass. Skip to step 3.
- **Complex** — a subsystem spanning multiple files or services, a cross-cutting feature, a full overview: fan out first.

Lean simple when in doubt; escalate to a fan-out if the single pass hits a wall. Done when the scope line and the triage call are written.

## 2. Fan out (complex only)

Decompose the question into 2–4 disjoint slices — for a rate limiter, say: data model and state / request path and enforcement / configuration and metrics — sized so no two explorers trace the same code. Narrow questions take 2, broad subsystems up to 4.

Use the harness's available fresh, read-only investigator mechanism and launch one investigator per slice in one batch. When no fresh investigator mechanism exists, explore the slices locally instead of inventing a harness-specific command. Each brief names its slice and asks for findings traced from real code, not guessed from file names: components (name, path, one line each), the flow step by step from entry point to effect, files read, boundaries with other subsystems, non-obvious behavior, and anything it could not trace. Overlap in the returns is fine — synthesis reconciles.

Done when every slice has an explorer launched and no two slices name the same code.

## 3. Synthesize

Merge the returns (or your own single pass) into one picture. Where explorers overlap, merge into one description; where they contradict, re-read the code itself and let it adjudicate — never pick the tidier account. Done when the flow runs from trigger to effect with no hand-waved step, and every contradiction is either resolved against the code or reported as an open gap.

## 4. Deliver

Fixed output contract — a section is skipped only when it has genuinely nothing:

- **Overview.** 1–2 paragraphs: what it is, what it does, what it is for — enough to decide whether to keep reading.
- **Key concepts.** The types, services, or abstractions needed to follow the rest, one line each.
- **How it works.** The core: what triggers it, what happens step by step, where data goes, the decision points. Prose that references specific files and functions, not code dumps.
- **Where things live.** The files and directories someone needs to start working here — not every file.
- **Gotchas.** Non-obvious behavior, historical residue, sharp edges a newcomer would trip on.

Done when a reader could go from any claim in the explanation to the file that backs it.
