import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runPredicates } from "../shared/templates/run-ledger-predicates.mjs";

function healthyRun() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-ledger-"));
  const runDir = path.join(repoRoot, "tasks");
  fs.mkdirSync(path.join(runDir, "ledger"), { recursive: true });

  const verdict = {
    reviewer: "implementation-reviewer",
    scope: "promise gate",
    verdict: "PASS_WITH_NOTES",
    blocking_count: 0,
    findings: [
      {
        severity: "low",
        blocking: false,
        title: "note",
        evidence: ["file:1"],
        explanation: "minor",
        required_resolution: "none",
        disposition: "follow-up"
      }
    ],
    predicate_adequacy: "adequate",
    test_adequacy: "adequate",
    governance_flags: [],
    residual_risks: [],
    recommended_next_action: "continue"
  };

  const state = {
    schema_version: "metawatch-longflow-4.1",
    state_version: 3,
    mode: "complete",
    status: "complete",
    tier: "T2",
    promises: [
      {
        number: 1,
        summary: "the promise",
        status: "verified",
        evidence: {
          verified_at: "2026-08-28T12:00:00Z",
          verified_at_sha: "a".repeat(40),
          references: ["walkthrough narrative", "docs/evidence.md"],
          scope: ["src/"]
        },
        gate: {
          walkthrough: "holds",
          intent_audit: "aligned",
          review_cycles: 1,
          review_outcome: "passed",
          raw_reviewer_verdicts: [
            { id: "RV-001", cycle: 1, recorded_at: "2026-08-28T11:00:00Z", verdict }
          ],
          applied_dispositions: [
            {
              verdict_id: "RV-001",
              finding_index: 0,
              action: "follow-up",
              rationale: "tracked as ABC-123",
              applied_at: "2026-08-28T11:30:00Z"
            }
          ]
        }
      }
    ],
    residual_risks: [
      { id: "R-001", risk: "minor", serves_promise: 1, disposition: "accepted boundary", recorded_at: "2026-08-28T11:00:00Z" }
    ],
    final_closeout: {
      completed_at: "2026-08-28T13:00:00Z",
      walkthrough: "holds",
      intent_audit: "aligned",
      review_outcome: "passed",
      trail_audit: "passed",
      attention_scan: "passed",
      evidence_references: ["docs/evidence.md", "full test suite run"],
      retro_reference: "RUNS.md"
    },
    next_action: "none"
  };

  fs.writeFileSync(path.join(runDir, "STATE.json"), JSON.stringify(state, null, 2));
  fs.writeFileSync(path.join(runDir, "INTENT.md"), "# Intent\n\nPromise 1: the promise.\n");
  fs.writeFileSync(
    path.join(runDir, "2026-08-28-fixture-execplan.md"),
    "## Calibration\n\nRetro reviewed: RUNS.md (2026-08-27 entry)\n\n## Promise log\n\nClean run, nothing deferred.\n"
  );
  fs.writeFileSync(
    path.join(runDir, "ledger", "LF-001.json"),
    JSON.stringify({
      id: "LF-001",
      title: "do the thing",
      promises: [1],
      rigor_class: "production-transferable",
      status: "closed",
      check: "scripts/verify-issue-LF-001.sh",
      evidence: ["check passed 2026-08-28"],
      notes: ""
    }, null, 2)
  );
  fs.mkdirSync(path.join(repoRoot, "docs"));
  fs.writeFileSync(path.join(repoRoot, "docs", "evidence.md"), "walkthrough transcript\n");
  fs.writeFileSync(path.join(repoRoot, "RUNS.md"), `# Run retrospectives\n\n## 2026-08-28 — fixture (tier T2)\n\n${"Outcome: fine. ".repeat(20)}\n`);
  return { repoRoot, runDir, statePath: path.join(runDir, "STATE.json") };
}

function resultById(results, id) {
  return results.find((r) => r.id === id);
}

function mutateState(statePath, mutate) {
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  mutate(state);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

test("healthy run passes every applicable predicate", () => {
  const { runDir } = healthyRun();
  const results = runPredicates({ runDir });
  for (const result of results) {
    assert.notEqual(result.status, "FAIL", `${result.id} failed: ${result.reasons.join("; ")}`);
  }
  assert.equal(resultById(results, "RL10").status, "SKIP");
});

test("RL2 fails on a stub verdict record", () => {
  const { runDir, statePath } = healthyRun();
  mutateState(statePath, (state) => {
    state.promises[0].gate.raw_reviewer_verdicts.push({ id: "RV-002", cycle: 1, recorded_at: "2026-08-28T11:05:00Z", verdict: {} });
  });
  assert.equal(resultById(runPredicates({ runDir }), "RL2").status, "FAIL");
});

test("RL3 fails on a disposition pointing at a missing verdict or finding", () => {
  const { runDir, statePath } = healthyRun();
  mutateState(statePath, (state) => {
    state.promises[0].gate.applied_dispositions.push({
      verdict_id: "RV-999", finding_index: 0, action: "fix-now", rationale: "x", applied_at: "2026-08-28T11:31:00Z"
    });
  });
  assert.equal(resultById(runPredicates({ runDir }), "RL3").status, "FAIL");
});

test("RL4 fails on a verified promise without evidence references", () => {
  const { runDir, statePath } = healthyRun();
  mutateState(statePath, (state) => { state.promises[0].evidence.references = []; });
  assert.equal(resultById(runPredicates({ runDir }), "RL4").status, "FAIL");
});

test("RL5 fails on a closed item with no evidence and a cancelled item with no reason", () => {
  const { runDir } = healthyRun();
  fs.writeFileSync(path.join(runDir, "ledger", "LF-002.json"), JSON.stringify({ id: "LF-002", status: "closed", check: "", evidence: [] }));
  fs.writeFileSync(path.join(runDir, "ledger", "LF-003.json"), JSON.stringify({ id: "LF-003", status: "cancelled", notes: "" }));
  const result = resultById(runPredicates({ runDir }), "RL5");
  assert.equal(result.status, "FAIL");
  assert.equal(result.reasons.length, 3);
});

test("RL6 fails when the retro file is a stub", () => {
  const { repoRoot, runDir } = healthyRun();
  fs.writeFileSync(path.join(repoRoot, "RUNS.md"), "stub");
  assert.equal(resultById(runPredicates({ runDir }), "RL6").status, "FAIL");
});

test("RL7 fails on a path-like evidence reference that does not resolve", () => {
  const { runDir, statePath } = healthyRun();
  mutateState(statePath, (state) => { state.final_closeout.evidence_references.push("docs/missing-artifact.md"); });
  assert.equal(resultById(runPredicates({ runDir }), "RL7").status, "FAIL");
});

test("RL8 fails on unticketed deferral language and accepts a waiver", () => {
  const { runDir } = healthyRun();
  const execplan = path.join(runDir, "2026-08-28-fixture-execplan.md");
  fs.appendFileSync(execplan, "\nSanitising the restore path is deferred to a follow-up outside this ticket.\n");
  const failing = resultById(runPredicates({ runDir }), "RL8");
  assert.equal(failing.status, "FAIL");
  fs.appendFileSync(execplan, "");
  const text = fs.readFileSync(execplan, "utf8").replace(
    "outside this ticket.",
    "outside this ticket (no-ticket: superseded by ABC-999 scope)."
  );
  fs.writeFileSync(execplan, text);
  assert.equal(resultById(runPredicates({ runDir }), "RL8").status, "PASS");
});

test("RL8 fails on a follow-up disposition with no reference in its rationale", () => {
  const { runDir, statePath } = healthyRun();
  mutateState(statePath, (state) => {
    state.promises[0].gate.applied_dispositions[0].rationale = "will handle later";
  });
  assert.equal(resultById(runPredicates({ runDir }), "RL8").status, "FAIL");
});

test("RL9 fails when calibration never recorded its retro read", () => {
  const { runDir } = healthyRun();
  const execplan = path.join(runDir, "2026-08-28-fixture-execplan.md");
  fs.writeFileSync(execplan, "## Calibration\n\nTier: T2.\n");
  assert.equal(resultById(runPredicates({ runDir }), "RL9").status, "FAIL");
});

test("RL10 enforces production readback only for live-defect runs", () => {
  const { runDir, statePath } = healthyRun();
  fs.appendFileSync(path.join(runDir, "INTENT.md"), "\nLive-defect: yes\n");
  assert.equal(resultById(runPredicates({ runDir }), "RL10").status, "FAIL");
  mutateState(statePath, (state) => {
    state.final_closeout.evidence_references.push("production-readback: docs/evidence.md");
  });
  assert.equal(resultById(runPredicates({ runDir }), "RL10").status, "PASS");
});

test("scan mode runs RL8 over arbitrary deliverable files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "run-ledger-scan-"));
  const packet = path.join(dir, "FINAL_PACKET.md");
  fs.writeFileSync(packet, "Everything merged. Cache invalidation deferred to a later run.\n");
  assert.equal(resultById(runPredicates({ scanPaths: [packet] }), "RL8").status, "FAIL");
  fs.writeFileSync(packet, "Everything merged. Cache invalidation deferred to a later run (PROD-1234).\n");
  assert.equal(resultById(runPredicates({ scanPaths: [packet] }), "RL8").status, "PASS");
});
