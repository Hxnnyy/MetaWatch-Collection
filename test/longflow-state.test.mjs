import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { repoRoot } from "../scripts/workflow-paths.mjs";

const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));

test("the v4 snapshot carries evidence-relative truth and operative judgement", () => {
  const state = readJson("shared/templates/STATE.json");

  assert.equal(state.schema_version, "metawatch-longflow-4.0");
  assert.equal(state.state_version, 1);
  assert.equal(state.checkpoint_id, null);
  assert.equal(state.last_managed_commit, null);
  assert.equal(state.mode, null);
  assert.equal(state.directive, null);
  assert.equal(state.tier, null);
  for (const field of [
    "active_decisions",
    "open_assumptions",
    "binding_actions",
    "residual_risks"
  ]) assert.deepEqual(state[field], [], `${field} must be durable state`);
  assert.equal(state.final_closeout, null);

  const contract = read("shared/orchestration/state-files.md");
  assert.match(contract, /"schema_version": "metawatch-longflow-4\.0"/);
  assert.match(contract, /"state_version": 1/);
  assert.match(contract, /"checkpoint_id":/);
  assert.match(contract, /"last_managed_commit":/);
  assert.match(contract, /"status": "open \| in_progress \| verifying \| verified \| needs_recheck"/);
  for (const field of [
    "verified_at",
    "verified_at_sha",
    "references",
    "scope",
    "dirty_since_sha",
    "raw_reviewer_verdicts",
    "applied_dispositions",
    "active_decisions",
    "open_assumptions",
    "binding_actions",
    "residual_risks",
    "final_closeout"
  ]) assert.match(contract, new RegExp(`"${field}"`), `missing ${field} from canonical schema`);
  assert.match(contract, /directory prefix.*trailing `\/`/i);
  assert.match(contract, /globs? (?:are|is) (?:invalid|not allowed)/i);
  assert.match(contract, /T0.*(?:creates|has) no durable state/is);
  assert.match(contract, /"tier": "T1 \| T2 \| T3"/);
  assert.doesNotMatch(contract, /"tier": "T0 \|/);
});

test("recovery trusts durable judgement while checking evidence freshness", () => {
  const stateFiles = read("shared/orchestration/state-files.md");
  assert.match(stateFiles, /adopt.*active_decisions.*open_assumptions.*binding_actions.*residual_risks/is);
  assert.match(stateFiles, /do(?:es)? not re-derive (?:those|operative) judgements? from (?:the )?ledger or `git log`/i);
  assert.match(stateFiles, /in-scope.*`needs_recheck`/is);
  assert.match(stateFiles, /outside.*scope.*remain(?:s)? `verified`/is);

  const audit = read("shared/review/intent-audit.md");
  assert.match(audit, /active decisions.*open assumptions.*binding actions.*residual risks/is);
  assert.match(audit, /raw.*verdict.*append-only/is);
  assert.match(audit, /applied dispositions.*separate/is);

  const execution = read("workflows/longflow/skills/issues-execution/SKILL.md");
  assert.match(execution, /operative judgement.*STATE\.json/is);
  assert.match(execution, /evidence freshness.*needs_recheck/is);
  assert.doesNotMatch(execution, /re-deriv(?:e|ing) (?:operative )?judgement.*(?:ledger|git)/is);
});

test("activation, tier qualification, and gate closure have one durable meaning", () => {
  const continuous = read("shared/orchestration/continuous-mode.md");
  assert.match(continuous, /latest message takes precedence/is);
  assert.match(continuous, /mode: interactive_override.*status: in_progress.*directive.*unchanged/is);
  assert.match(continuous, /Bare `go` is not a continuous directive/);

  const gates = read("shared/orchestration/promise-gates.md");
  assert.match(gates, /normal closure.*`review_outcome: passed`/is);
  assert.match(gates, /budget-exhaustion.*`review_outcome: closed_with_residuals`/is);
  assert.match(gates, /raw reviewer verdict.*append-only/is);
  assert.match(gates, /applied dispositions.*separate/is);

  const tierPolicy = readJson("shared/orchestration/tier-policy.json");
  assert.deepEqual(tierPolicy.tiers.T0.artifacts, []);
  assert.deepEqual(tierPolicy.tiers.T1.artifacts, ["INTENT.md", "STATE.json", "execplan", "ledger"]);
});

test("ledger risk tags are the canonical reviewer-routing input", () => {
  const ledgerTemplate = readJson("shared/templates/ledger-item.json");
  assert.deepEqual(ledgerTemplate.risk_tags, []);

  const ledger = read("shared/orchestration/ledger.md");
  assert.match(ledger, /"risk_tags": \[\]/);
  assert.match(ledger, /risk_tags.*reviewer routing/is);
});
