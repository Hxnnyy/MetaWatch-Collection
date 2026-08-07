import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const STATE_SCHEMA = "metawatch-longflow-4.0";
const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const PROMISE_STATUSES = ["open", "in_progress", "verifying", "verified", "needs_recheck"];
const MODES = ["continuous", "interactive", "complete", "hard_blocked", "interactive_override"];
const RUN_STATUSES = ["in_progress", "complete", "hard_blocked"];
const LEDGER_STATUSES = ["ready", "blocked", "in_progress", "implemented", "gated", "closed", "cancelled"];

function problem(code, file, message) {
  return { code, file, message };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringArray(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isoDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function repoPath(value) {
  if (!nonEmptyString(value) || value.includes("\\") || value.startsWith("/") || /^[A-Za-z]:/.test(value)) return false;
  if (["*", "?", "[", "]", "{", "}", "!"].some((character) => value.includes(character))) return false;
  const withoutTrailingSlash = value.endsWith("/") ? value.slice(0, -1) : value;
  if (!withoutTrailingSlash || withoutTrailingSlash.includes("//")) return false;
  return withoutTrailingSlash.split("/").every((segment) => segment !== "." && segment !== "..");
}

function inspectRoot(root, command) {
  if (typeof root !== "string" || root.length === 0) {
    return {
      result: {
        command,
        ok: false,
        boundary: true,
        problems: [problem("root_unreadable", null, "Root must be a readable directory.")]
      }
    };
  }
  const resolved = path.resolve(root);
  try {
    if (!fs.statSync(resolved).isDirectory()) throw new Error("not a directory");
    fs.accessSync(resolved, fs.constants.R_OK);
  } catch {
    return {
      result: {
        command,
        ok: false,
        boundary: true,
        problems: [problem("root_unreadable", resolved, "Root must be a readable directory.")]
      }
    };
  }
  return { root: resolved };
}

function readText(root, relativePath, problems) {
  try {
    return fs.readFileSync(path.join(root, ...relativePath.split("/")), "utf8");
  } catch {
    problems.push(problem("artifact_missing", relativePath, "Required Longflow artifact is missing or unreadable."));
    return null;
  }
}

function readJson(root, relativePath, problems) {
  const text = readText(root, relativePath, problems);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    problems.push(problem("json_malformed", relativePath, "Artifact is not valid JSON."));
    return null;
  }
}

function findExecplans(root) {
  try {
    return fs.readdirSync(path.join(root, "tasks"))
      .filter((name) => name.endsWith("-execplan.md"))
      .sort()
      .map((name) => `tasks/${name}`);
  } catch {
    return [];
  }
}

function loadLedgers(root, problems) {
  let names;
  try {
    names = fs.readdirSync(path.join(root, "tasks", "ledger")).filter((name) => name.endsWith(".json")).sort();
  } catch {
    problems.push(problem("artifact_missing", "tasks/ledger/", "The Longflow ledger directory is missing or unreadable."));
    return [];
  }
  if (names.length === 0) {
    problems.push(problem("ledger_empty", "tasks/ledger/", "At least one ledger item is required."));
  }
  return names.map((name) => ({ name, value: readJson(root, `tasks/ledger/${name}`, problems) }));
}

function validateJudgement(state, problems) {
  const shapes = {
    active_decisions: ["id", "decision", "because", "recorded_at"],
    open_assumptions: ["id", "assumption", "validation", "recorded_at"],
    binding_actions: ["id", "source", "action", "recorded_at"],
    residual_risks: ["id", "risk", "disposition", "recorded_at"]
  };
  for (const [field, required] of Object.entries(shapes)) {
    const entries = state[field];
    let valid = Array.isArray(entries);
    if (valid) {
      valid = entries.every((entry) => isObject(entry)
        && required.every((key) => key === "recorded_at" ? isoDate(entry[key]) : nonEmptyString(entry[key]))
        && Number.isInteger(entry.serves_promise)
        && entry.serves_promise > 0
        && (field !== "binding_actions" || ["open", "completed", "superseded"].includes(entry.status)));
    }
    if (!valid) problems.push(problem("judgement_shape", `tasks/STATE.json#${field}`, `${field} does not match the v4 judgement shape.`));
  }
}

function validateEvidence(promiseValue, reference, problems) {
  const evidence = promiseValue.evidence;
  let valid = isObject(evidence)
    && (evidence.verified_at === null || isoDate(evidence.verified_at))
    && (evidence.verified_at_sha === null || (typeof evidence.verified_at_sha === "string" && SHA_PATTERN.test(evidence.verified_at_sha)))
    && stringArray(evidence.references)
    && Array.isArray(evidence.scope);
  if (!valid) problems.push(problem("evidence_shape", reference, "Promise evidence does not match the v4 shape."));
  if (isObject(evidence) && Array.isArray(evidence.scope)) {
    if (evidence.scope.length === 0 || evidence.scope.some((entry) => !repoPath(entry))) {
      problems.push(problem("scope", `${reference}/evidence/scope`, "Scope entries must be exact repo-relative files or trailing-slash directory prefixes without traversal or globs."));
      valid = false;
    }
  }
  if (promiseValue.status === "verified" && isObject(evidence)) {
    if (!isoDate(evidence.verified_at) || !stringArray(evidence.references) || evidence.references.length === 0) {
      problems.push(problem("verified_evidence", reference, "Verified promises require dated evidence references."));
    }
  }
  if (!(promiseValue.dirty_since_sha === null || (typeof promiseValue.dirty_since_sha === "string" && SHA_PATTERN.test(promiseValue.dirty_since_sha)))) {
    problems.push(problem("dirty_since_sha", reference, "dirty_since_sha must be null or a full Git SHA."));
  }
  return valid;
}

function validateGate(promiseValue, reference, problems) {
  const gate = promiseValue.gate;
  const valid = isObject(gate)
    && ["pending", "holds", "does_not_hold", "cannot_walk"].includes(gate.walkthrough)
    && ["pending", "aligned", "drifting", "misaligned", "n/a"].includes(gate.intent_audit)
    && Number.isInteger(gate.review_cycles)
    && gate.review_cycles >= 0
    && gate.review_cycles <= 3
    && ["pending", "passed", "closed_with_residuals"].includes(gate.review_outcome)
    && Array.isArray(gate.raw_reviewer_verdicts)
    && gate.raw_reviewer_verdicts.every((entry) => isObject(entry)
      && nonEmptyString(entry.id)
      && Number.isInteger(entry.cycle)
      && entry.cycle >= 1
      && isoDate(entry.recorded_at)
      && isObject(entry.verdict))
    && Array.isArray(gate.applied_dispositions)
    && gate.applied_dispositions.every((entry) => isObject(entry)
      && nonEmptyString(entry.verdict_id)
      && Number.isInteger(entry.finding_index)
      && entry.finding_index >= 0
      && ["fix-now", "follow-up", "residual-risk", "rebutted"].includes(entry.action)
      && nonEmptyString(entry.rationale)
      && isoDate(entry.applied_at));
  if (!valid) problems.push(problem("gate_shape", `${reference}/gate`, "Promise gate does not match the v4 shape."));
  if (isObject(gate) && Array.isArray(gate.raw_reviewer_verdicts)) {
    const verdicts = new Map();
    for (const entry of gate.raw_reviewer_verdicts) {
      if (!isObject(entry) || !nonEmptyString(entry.id)) continue;
      if (verdicts.has(entry.id)) {
        problems.push(problem("gate_verdict_id_duplicate", `${reference}/gate/raw_reviewer_verdicts`, `Raw reviewer verdict id ${entry.id} is duplicated.`));
      } else {
        verdicts.set(entry.id, entry.verdict);
      }
    }
    if (Array.isArray(gate.applied_dispositions)) {
      for (const [index, disposition] of gate.applied_dispositions.entries()) {
        if (!isObject(disposition) || !nonEmptyString(disposition.verdict_id) || !Number.isInteger(disposition.finding_index)) continue;
        const verdict = verdicts.get(disposition.verdict_id);
        if (!isObject(verdict) || !Array.isArray(verdict.findings) || disposition.finding_index < 0 || disposition.finding_index >= verdict.findings.length) {
          problems.push(problem("gate_disposition_reference", `${reference}/gate/applied_dispositions/${index}`, "Disposition must reference an existing raw verdict finding."));
        }
      }
    }
  }
  if (promiseValue.status === "verified" && isObject(gate)
    && (gate.walkthrough !== "holds" || !["passed", "closed_with_residuals"].includes(gate.review_outcome))) {
    problems.push(problem("verified_gate", reference, "Verified promises require a holding walkthrough and closed review outcome."));
  }
}

function validateCloseout(root, tier, closeout, problems) {
  if (!isObject(closeout)) {
    problems.push(problem("final_closeout_shape", "tasks/STATE.json#final_closeout", "final_closeout does not match the v4 shape."));
    return;
  }
  if (!isoDate(closeout.completed_at)
    || closeout.walkthrough !== "holds"
    || !["aligned", "n/a"].includes(closeout.intent_audit)
    || !["passed", "closed_with_residuals", "n/a"].includes(closeout.review_outcome)
    || !Array.isArray(closeout.evidence_references)
    || !nonEmptyString(closeout.retro_reference)) {
    problems.push(problem("final_closeout_shape", "tasks/STATE.json#final_closeout", "final_closeout does not match the v4 shape."));
  }
  if (!stringArray(closeout.evidence_references)
    || closeout.evidence_references.length === 0
    || closeout.evidence_references.some((entry) => !nonEmptyString(entry))) {
    problems.push(problem("final_closeout_evidence", "tasks/STATE.json#final_closeout/evidence_references", "Final closeout requires at least one non-empty evidence reference."));
  }
  if (["T2", "T3"].includes(tier) && closeout.intent_audit !== "aligned") {
    problems.push(problem("final_closeout_intent_audit", "tasks/STATE.json#final_closeout/intent_audit", `${tier} final closeout requires an aligned intent audit.`));
  }
  if (["T2", "T3"].includes(tier) && !["passed", "closed_with_residuals"].includes(closeout.review_outcome)) {
    problems.push(problem("final_closeout_review_outcome", "tasks/STATE.json#final_closeout/review_outcome", `${tier} final closeout requires a passed or closed_with_residuals reviewer outcome.`));
  }
  if (!repoPath(closeout.retro_reference) || closeout.retro_reference.endsWith("/")) {
    problems.push(problem("retro_reference", "tasks/STATE.json#final_closeout/retro_reference", "retro_reference must be an exact safe repo-relative file path."));
  } else {
    readText(root, closeout.retro_reference, problems);
  }
}

function validateState(root, state, problems) {
  if (state === null) return;
  if (!isObject(state)) {
    problems.push(problem("state_shape", "tasks/STATE.json", "State must be a JSON object."));
    return;
  }
  if (state.schema_version !== STATE_SCHEMA) problems.push(problem("schema_version", "tasks/STATE.json", `schema_version must be ${STATE_SCHEMA}.`));
  if (!Number.isInteger(state.state_version) || state.state_version < 1) problems.push(problem("state_version", "tasks/STATE.json", "state_version must be a positive integer."));
  if (!(state.checkpoint_id === null || nonEmptyString(state.checkpoint_id))) problems.push(problem("checkpoint_id", "tasks/STATE.json", "checkpoint_id must be null or a non-empty string."));
  if (!(state.last_managed_commit === null || (typeof state.last_managed_commit === "string" && SHA_PATTERN.test(state.last_managed_commit)))) problems.push(problem("last_managed_commit", "tasks/STATE.json", "last_managed_commit must be null or a full Git SHA."));
  if (!MODES.includes(state.mode)) problems.push(problem("mode", "tasks/STATE.json", "mode is not in the v4 vocabulary."));
  if (!RUN_STATUSES.includes(state.status)) problems.push(problem("status", "tasks/STATE.json", "status is not in the v4 vocabulary."));
  if (!["T1", "T2", "T3"].includes(state.tier)) problems.push(problem("tier", "tasks/STATE.json", "Durable Longflow tier must be T1, T2, or T3; T0 has no state file."));
  if (state.intent_authority !== "tasks/INTENT.md") problems.push(problem("intent_authority", "tasks/STATE.json", "intent_authority must be tasks/INTENT.md."));
  if (!(state.directive === null || nonEmptyString(state.directive))) problems.push(problem("directive", "tasks/STATE.json", "directive must be null or a non-empty string."));
  if (["continuous", "interactive_override"].includes(state.mode) && !nonEmptyString(state.directive)) problems.push(problem("directive", "tasks/STATE.json", `${state.mode} mode requires the durable directive.`));

  const expectedStatus = state.mode === "complete" ? "complete" : state.mode === "hard_blocked" ? "hard_blocked" : "in_progress";
  if (MODES.includes(state.mode) && state.status !== expectedStatus) problems.push(problem("mode_status", "tasks/STATE.json", `${state.mode} mode must pair with ${expectedStatus} status.`));

  if (!Array.isArray(state.promises) || state.promises.length === 0) {
    problems.push(problem("promises_shape", "tasks/STATE.json#promises", "A durable run needs at least one promise."));
  } else {
    const numbers = new Set();
    for (const [index, promiseValue] of state.promises.entries()) {
      const reference = `tasks/STATE.json#promises/${index}`;
      if (!isObject(promiseValue)) {
        problems.push(problem("promise_shape", reference, "Promise must be an object."));
        continue;
      }
      if (!Number.isInteger(promiseValue.number) || promiseValue.number < 1 || numbers.has(promiseValue.number) || !nonEmptyString(promiseValue.summary)) {
        problems.push(problem("promise_shape", reference, "Promise needs a unique positive number and summary."));
      }
      numbers.add(promiseValue.number);
      if (!PROMISE_STATUSES.includes(promiseValue.status)) problems.push(problem("promise_status", reference, "Promise status is not in the v4 lifecycle."));
      validateEvidence(promiseValue, reference, problems);
      validateGate(promiseValue, reference, problems);
    }
  }

  validateJudgement(state, problems);
  if (!isObject(state.budget) || !(state.budget.estimate === null || typeof state.budget.estimate === "string")
    || !(state.budget.spent_note === null || typeof state.budget.spent_note === "string") || !stringArray(state.budget.items_over_2x)) {
    problems.push(problem("budget_shape", "tasks/STATE.json#budget", "budget does not match the v4 shape."));
  }
  if (!stringArray(state.breakglass_log)) problems.push(problem("breakglass_shape", "tasks/STATE.json#breakglass_log", "breakglass_log must be an array of strings."));
  if (!nonEmptyString(state.next_action)) problems.push(problem("next_action", "tasks/STATE.json", "next_action must be a non-empty string."));
  if (!isObject(state.agent_pool) || !(state.agent_pool.max_threads === null || (Number.isInteger(state.agent_pool.max_threads) && state.agent_pool.max_threads > 0))
    || !Number.isInteger(state.agent_pool.reserved_slots) || state.agent_pool.reserved_slots < 0
    || !(state.agent_pool.last_reconciled_at === null || isoDate(state.agent_pool.last_reconciled_at)) || !Array.isArray(state.agent_pool.threads)) {
    problems.push(problem("agent_pool_shape", "tasks/STATE.json#agent_pool", "agent_pool does not match the v4 shape."));
  }
  if (!Array.isArray(state.commits)) problems.push(problem("commits_shape", "tasks/STATE.json#commits", "commits must be an array."));
  if (!(state.block_reason === null || nonEmptyString(state.block_reason))) problems.push(problem("block_reason", "tasks/STATE.json", "block_reason must be null or a non-empty string."));
  if (!(state.started_at === null || isoDate(state.started_at)) || !(state.updated_at === null || isoDate(state.updated_at))) problems.push(problem("timestamps", "tasks/STATE.json", "started_at and updated_at must be null or ISO-8601 timestamps."));

  if (state.status === "complete") {
    if (state.final_closeout === null) problems.push(problem("complete_without_closeout", "tasks/STATE.json", "A complete run requires final_closeout."));
    if (!Array.isArray(state.promises) || state.promises.some((entry) => entry?.status !== "verified")) problems.push(problem("complete_with_unverified_promises", "tasks/STATE.json", "A complete run requires every promise to be verified."));
  } else if (state.final_closeout !== null) {
    problems.push(problem("closeout_before_complete", "tasks/STATE.json", "final_closeout must remain null until the run is complete."));
  }
  if (state.final_closeout !== null) validateCloseout(root, state.tier, state.final_closeout, problems);
  if (state.status === "hard_blocked" && !nonEmptyString(state.block_reason)) problems.push(problem("hard_block_without_reason", "tasks/STATE.json", "A hard-blocked run requires block_reason."));
}

function validateLedger(item, name, tier, problems) {
  const reference = `tasks/ledger/${name}`;
  if (!isObject(item)) {
    if (item !== null) problems.push(problem("ledger_shape", reference, "Ledger item must be a JSON object."));
    return;
  }
  if (!nonEmptyString(item.id) || `${item.id}.json` !== name) problems.push(problem("ledger_id", reference, "Ledger id must match its filename."));
  if (!nonEmptyString(item.title)) problems.push(problem("ledger_title", reference, "Ledger title must be a non-empty string."));
  if (!Array.isArray(item.promises) || item.promises.length === 0 || item.promises.some((entry) => !Number.isInteger(entry) || entry < 1)) problems.push(problem("ledger_promises", reference, "Ledger promises must be a non-empty array of positive integers."));
  if (!["production-transferable", "dogfood-disposable", "spike"].includes(item.rigor_class)) problems.push(problem("ledger_rigor", reference, "Ledger rigor_class is invalid."));
  if (!stringArray(item.risk_tags)) problems.push(problem("ledger_risk_tags", reference, "Ledger risk_tags must be an array of strings."));
  const validSize = tier === "T1" ? item.size === null : ["S", "M", "L"].includes(item.size);
  if (!validSize) problems.push(problem("ledger_size", reference, tier === "T1" ? "T1 ledger size must be null." : "T2+ ledger size must be S, M, or L."));
  if (!LEDGER_STATUSES.includes(item.status)) problems.push(problem("ledger_status", reference, "Ledger status is invalid."));
  if (!stringArray(item.blockedBy)) problems.push(problem("ledger_dependencies", reference, "blockedBy must be an array of item ids."));
  if (!stringArray(item.files)) problems.push(problem("ledger_files", reference, "files must be an array of paths."));
  if (!nonEmptyString(item.acceptance)) problems.push(problem("ledger_acceptance", reference, "acceptance must be a non-empty string."));
  if (!nonEmptyString(item.check)) problems.push(problem("ledger_check", reference, "check must be a non-empty string."));
  if (!Array.isArray(item.evidence)) problems.push(problem("ledger_evidence", reference, "evidence must be an array."));
  if (!(item.github === null || Number.isInteger(item.github))) problems.push(problem("ledger_github", reference, "github must be null or an integer."));
  if (typeof item.notes !== "string") problems.push(problem("ledger_notes", reference, "notes must be a string."));
}

function validateRunArtifacts(root, problems) {
  const state = readJson(root, "tasks/STATE.json", problems);
  readText(root, "tasks/INTENT.md", problems);
  const execplans = findExecplans(root);
  if (execplans.length === 0) problems.push(problem("artifact_missing", "tasks/*-execplan.md", "A Longflow execplan is required."));
  else if (execplans.length > 1) problems.push(problem("execplan_ambiguous", "tasks/", "Exactly one active Longflow execplan is required."));
  const ledgers = loadLedgers(root, problems);

  validateState(root, state, problems);
  for (const { name, value } of ledgers) validateLedger(value, name, state?.tier, problems);
  if (state?.tier === "T2" || state?.tier === "T3") {
    if (!nonEmptyString(state.prd)) problems.push(problem("prd_required", "tasks/STATE.json", `${state.tier} runs require a PRD path.`));
    else if (!repoPath(state.prd) || state.prd.endsWith("/")) problems.push(problem("prd_path", "tasks/STATE.json", "PRD path must be an exact repo-relative file."));
    else readText(root, state.prd, problems);
  } else if (state?.tier === "T1" && state.prd !== null) {
    problems.push(problem("prd_unexpected", "tasks/STATE.json", "T1 state must keep prd null."));
  }
  return { state, ledgers, execplans };
}

function parseIntentPromises(text, problems) {
  if (text === null) return [];
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const start = lines.findIndex((line) => /^##\s+Promises\s*$/i.test(line));
  if (start === -1) {
    problems.push(problem("intent_promises_missing", "tasks/INTENT.md", "INTENT.md needs a ## Promises section."));
    return [];
  }
  const promises = [];
  const seen = new Set();
  for (let index = start + 1; index < lines.length && !/^##\s+/.test(lines[index]); index += 1) {
    const match = lines[index].match(/^\s*(\d+)\.\s+(.+?)\s*$/);
    if (!match) continue;
    const number = Number(match[1]);
    if (seen.has(number)) problems.push(problem("intent_promise_duplicate", "tasks/INTENT.md", `Promise ${number} is numbered more than once.`));
    else promises.push({ number, summary: match[2], funded_by: [] });
    seen.add(number);
  }
  if (promises.length === 0) problems.push(problem("intent_promises_missing", "tasks/INTENT.md", "The ## Promises section has no numbered promises."));
  return promises.sort((left, right) => left.number - right.number);
}

function git(root, args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8" });
}

function nulPaths(result) {
  return result.stdout.split("\0").filter(Boolean).map((entry) => entry.replaceAll("\\", "/"));
}

function inScope(changedPath, scopes) {
  return scopes.some((scope) => scope.endsWith("/") ? changedPath.startsWith(scope) : changedPath === scope);
}

function inspectRevision(root, sha) {
  const available = git(root, ["cat-file", "-e", `${sha}^{commit}`]);
  if (available.status !== 0) return { kind: "unavailable" };
  const ancestor = git(root, ["merge-base", "--is-ancestor", sha, "HEAD"]);
  if (ancestor.status === 1) return { kind: "non_ancestor" };
  if (ancestor.status !== 0) return { kind: "unavailable" };

  const head = git(root, ["rev-parse", "HEAD"]);
  const committed = git(root, ["diff", "--name-only", "-z", "--no-renames", `${sha}..HEAD`, "--"]);
  const staged = git(root, ["diff", "--cached", "--name-only", "-z", "--no-renames", "--"]);
  const unstaged = git(root, ["diff", "--name-only", "-z", "--no-renames", "--"]);
  const untracked = git(root, ["ls-files", "--others", "--exclude-standard", "-z"]);
  if ([head, committed, staged, unstaged, untracked].some((result) => result.status !== 0)) return { kind: "unavailable" };

  return {
    kind: "available",
    head: head.stdout.trim(),
    committed: new Set(nulPaths(committed)),
    changed: [...new Set([...nulPaths(committed), ...nulPaths(staged), ...nulPaths(unstaged), ...nulPaths(untracked)])].sort()
  };
}

function scanFreshness(root, state, problems) {
  const verified = Array.isArray(state?.promises) ? state.promises.filter((entry) => entry?.status === "verified") : [];
  const results = [];
  const cache = new Map();
  for (const promiseValue of verified) {
    const sha = promiseValue.evidence?.verified_at_sha;
    if (sha === null) {
      problems.push(problem("verification_revision_missing", `tasks/STATE.json#promises/${promiseValue.number}`, "Verified promise has no revision, so freshness is indeterminate."));
      results.push({ number: promiseValue.number, status: "verified", freshness: "indeterminate", changed_paths: [], recommendation: { status: "needs_recheck", dirty_since_sha: null } });
      continue;
    }
    if (typeof sha !== "string" || !SHA_PATTERN.test(sha)) {
      problems.push(problem("verification_revision_unavailable", `tasks/STATE.json#promises/${promiseValue.number}`, "Verification revision is invalid or unavailable."));
      results.push({ number: promiseValue.number, status: "verified", freshness: "indeterminate", changed_paths: [], recommendation: { status: "needs_recheck", dirty_since_sha: null } });
      continue;
    }
    if (!cache.has(sha)) cache.set(sha, inspectRevision(root, sha));
    const revision = cache.get(sha);
    if (revision.kind !== "available") {
      const code = revision.kind === "non_ancestor" ? "verification_revision_non_ancestor" : "verification_revision_unavailable";
      problems.push(problem(code, `tasks/STATE.json#promises/${promiseValue.number}`, "Verification revision cannot establish freshness against HEAD."));
      results.push({ number: promiseValue.number, status: "verified", freshness: "indeterminate", changed_paths: [], recommendation: { status: "needs_recheck", dirty_since_sha: null } });
      continue;
    }
    const scopes = Array.isArray(promiseValue.evidence?.scope) ? promiseValue.evidence.scope : [];
    const changed = revision.changed.filter((changedPath) => inScope(changedPath, scopes));
    if (changed.length === 0) {
      results.push({ number: promiseValue.number, status: "verified", freshness: "fresh", changed_paths: [], recommendation: null });
      continue;
    }
    const hasCommittedChange = changed.some((changedPath) => revision.committed.has(changedPath));
    results.push({
      number: promiseValue.number,
      status: "verified",
      freshness: "stale",
      changed_paths: changed,
      recommendation: { status: "needs_recheck", dirty_since_sha: hasCommittedChange ? sha : revision.head }
    });
  }
  return results;
}

export function validate(root = process.cwd()) {
  const inspected = inspectRoot(root, "validate");
  if (inspected.result) return inspected.result;
  const problems = [];
  validateRunArtifacts(inspected.root, problems);
  return { command: "validate", ok: problems.length === 0, problems };
}

export function coverage(root = process.cwd()) {
  const inspected = inspectRoot(root, "coverage");
  if (inspected.result) return inspected.result;
  const problems = [];
  const promises = parseIntentPromises(readText(inspected.root, "tasks/INTENT.md", problems), problems);
  const ledgers = loadLedgers(inspected.root, problems);
  const known = new Map(promises.map((entry) => [entry.number, entry]));
  const itemsMissingPromises = [];
  const itemsUnknownPromises = [];

  for (const { name, value } of ledgers) {
    if (!isObject(value)) continue;
    const id = nonEmptyString(value.id) ? value.id : name.slice(0, -5);
    if (!Array.isArray(value.promises) || value.promises.length === 0) {
      itemsMissingPromises.push(id);
      continue;
    }
    const cited = value.promises.filter((entry) => Number.isInteger(entry) && entry > 0);
    if (cited.length !== value.promises.length) problems.push(problem("ledger_promises", `tasks/ledger/${name}`, "Promise citations must be positive integers."));
    const unknown = cited.filter((number) => !known.has(number));
    if (unknown.length > 0) itemsUnknownPromises.push({ id, promises: [...new Set(unknown)].sort((left, right) => left - right) });
    if (value.status !== "cancelled") {
      for (const number of cited) if (known.has(number)) known.get(number).funded_by.push(id);
    }
  }
  for (const promiseValue of promises) promiseValue.funded_by.sort();
  itemsMissingPromises.sort();
  itemsUnknownPromises.sort((left, right) => left.id.localeCompare(right.id));
  const uncoveredPromises = promises.filter((entry) => entry.funded_by.length === 0).map((entry) => entry.number);
  const ok = problems.length === 0 && uncoveredPromises.length === 0 && itemsMissingPromises.length === 0 && itemsUnknownPromises.length === 0;
  return {
    command: "coverage",
    ok,
    promises,
    uncovered_promises: uncoveredPromises,
    items_missing_promises: itemsMissingPromises,
    items_unknown_promises: itemsUnknownPromises,
    problems
  };
}

export function staleScan(root = process.cwd()) {
  const inspected = inspectRoot(root, "stale-scan");
  if (inspected.result) return inspected.result;
  const problems = [];
  const state = readJson(inspected.root, "tasks/STATE.json", problems);
  validateState(inspected.root, state, problems);
  if (problems.length > 0) return { command: "stale-scan", ok: false, promises: [], problems };
  const promises = isObject(state) ? scanFreshness(inspected.root, state, problems) : [];
  const ok = problems.length === 0 && promises.every((entry) => entry.freshness === "fresh");
  return { command: "stale-scan", ok, promises, problems };
}

export function resumeContext(root = process.cwd(), options = {}) {
  const inspected = inspectRoot(root, "resume-context");
  if (inspected.result) return inspected.result;
  const tail = options.tail ?? 100;
  if (!Number.isInteger(tail) || tail < 1) {
    return {
      command: "resume-context",
      ok: false,
      boundary: true,
      problems: [problem("usage", null, "tail must be a positive integer.")]
    };
  }

  const problems = [];
  const state = readJson(inspected.root, "tasks/STATE.json", problems);
  validateState(inspected.root, state, problems);
  if (isObject(state) && state.intent_authority === "tasks/INTENT.md") {
    readText(inspected.root, state.intent_authority, problems);
  }
  const execplans = findExecplans(inspected.root);
  if (execplans.length === 0) problems.push(problem("artifact_missing", "tasks/*-execplan.md", "A Longflow execplan is required."));
  else if (execplans.length > 1) problems.push(problem("execplan_ambiguous", "tasks/", "Exactly one active Longflow execplan is required."));
  if (!isObject(state) || execplans.length !== 1 || problems.length > 0) {
    return { command: "resume-context", ok: false, context: null, problems };
  }

  const scanned = scanFreshness(inspected.root, state, problems);
  const freshness = new Map(scanned.map((entry) => [entry.number, entry.freshness]));
  const promiseFreshness = state.promises.map((entry) => ({
    number: entry.number,
    summary: entry.summary,
    status: entry.status,
    freshness: entry.status === "verified" ? freshness.get(entry.number) : entry.status === "needs_recheck" ? "stale" : "not_applicable"
  }));
  const execplanText = readText(inspected.root, execplans[0], problems);
  const lines = execplanText === null ? [] : execplanText.replaceAll("\r\n", "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  const context = {
    checkpoint_id: state.checkpoint_id,
    state_version: state.state_version,
    last_managed_commit: state.last_managed_commit,
    mode: state.mode,
    status: state.status,
    tier: state.tier,
    directive: state.directive,
    intent_authority: state.intent_authority,
    prd: state.prd,
    next_action: state.next_action,
    promise_freshness: promiseFreshness,
    active_decisions: state.active_decisions,
    open_assumptions: state.open_assumptions,
    open_binding_actions: state.binding_actions.filter((entry) => entry.status === "open"),
    residual_risks: state.residual_risks,
    final_closeout: state.final_closeout,
    block_reason: state.block_reason,
    execplan_tail: { path: execplans[0], lines: lines.slice(-tail) }
  };
  const ok = problems.length === 0 && promiseFreshness.every((entry) => entry.freshness !== "stale" && entry.freshness !== "indeterminate");
  return { command: "resume-context", ok, context, problems };
}
