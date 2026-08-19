# Recall branch

Rebuild the user's working context — where things stand now and what to do next — when they resume with no state file. Two boundaries before anything runs: a mid-run Longflow resume belongs to the Longflow hard-block rules and their state files, not here; and when the user already handed over a full state capsule (paths, branch, the change), use it and skip the mining. This branch is conversational resumption: recent sessions, a topic, no durable run state.

## 1. Pin the scope

Pin all three and state them back in the reply before any search:

- **Window** — "recent" defaults to the last 7 days; "all" means all, never quietly narrowed to a recent N.
- **Topic** — the named feature, file, subsystem, or bug; or "general activity" when none is named.
- **Workspace** — the current project by default; another project's transcripts are read only when asked.

Done when the reply states the scope in a form the user could correct.

## 2. Triangulate three sources

History lies in three different ways — your own transcripts know what you did but not what held, the shared record knows what happened around the same code under other names, and only live state knows what is true now — so all three run, the first two in parallel.

**Own transcripts.** Sessions live at `~/.claude/projects/<cwd-slug>/*.jsonl`, where the slug is the workspace's absolute path with each `/` turned into `-`. Order candidates by modification time (`ls -t`), never by filename. Fan the reading out to general-purpose subagents so raw transcripts never enter the main thread: each takes a slice of the candidate files, greps for the topic first, reads only matching sessions and only their relevant regions, skips the current session and subagent or test noise, and returns one block per session — topic, the user's goal, decisions, open threads, struggles and corrections, artifacts (PRs, tickets, branches) — citing the session file. For one or two candidates, search directly with no fan-out. Done when every in-window candidate file was either grepped past or mined.

**Shared record.** Whenever the topic names a target, run the why branch's category mapping, fan-out, and skip rules ([`why.md`](why.md) steps 3–5) with the question steered from "why was this built" to "what is the current state, what was tried and didn't hold, what are users still reporting". This sweep is the default, not a judgment call — "my work on X" does not exempt it, because a named target carries history your transcripts never saw. Skip it only for pure activity recall with no named target ("what did I do this week"). Done when the investigators return with their Sources Consulted lines, or the no-named-target skip is stated in the brief.

**Live state.** A transcript or a stale ticket is history, not current truth. Take every PR, branch, and ticket the other two sources surfaced and verify with `git` and `gh`: does the branch still exist, did the PR merge or close, did anything revert it afterwards. Done when every surfaced artifact has a live-state check behind it.

## 3. Deliver the brief

Output contract, in order:

- **Capsule** — at most 5 bullets: what this work is and where it stands overall.
- **Threads** — one line each, prefixed with exactly one tag from this closed enum: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, `[planned, not started]`. A thread with no tag is not done — tag it. Tags come from the live-state check, never from a transcript's claim.
- **Problems** — at most 5, the recurring ones, including any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move** — the single most useful concrete action.

Adjacent work stays out unless it blocks a listed thread; when the brief outgrows a screen, cut detail before cutting threads. Cite transcript findings by session file and shared-record findings by their source id (PR #, ticket ID, permalink, error-tracker issue). Register: [`../../_shared/prose-tells.md`](../../_shared/prose-tells.md). Done when every thread line carries exactly one enum tag verified against live state.
