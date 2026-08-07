import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import * as longflow from "../scripts/longflow-core.mjs";
import { repoRoot } from "../scripts/workflow-paths.mjs";

const cliPath = path.join(repoRoot, "scripts", "longflow.mjs");

function makeRun(t) {
  const prefix = path.join(os.tmpdir(), "metawatch-longflow-");
  const root = fs.mkdtempSync(prefix);
  t.after(() => {
    assert.ok(root.startsWith(prefix), `refusing to remove unexpected path: ${root}`);
    fs.rmSync(root, { recursive: true, force: true });
  });

  fs.mkdirSync(path.join(root, "tasks", "ledger"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "tasks", "INTENT.md"),
    "# Intent\n\n## Promises\n\n1. The first promised outcome works.\n",
    "utf8"
  );
  fs.writeFileSync(path.join(root, "tasks", "run-prd.md"), "# PRD\n", "utf8");
  fs.writeFileSync(path.join(root, "tasks", "2026-08-07-run-execplan.md"), "# Execplan\n\nStarted.\n", "utf8");
  fs.writeFileSync(
    path.join(root, "tasks", "ledger", "LF-001.json"),
    `${JSON.stringify(validLedger())}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(root, "tasks", "STATE.json"),
    `${JSON.stringify(validState(), null, 2)}\n`,
    "utf8"
  );
  return root;
}

function validLedger(overrides = {}) {
  return {
    id: "LF-001",
    title: "Deliver the first promise",
    promises: [1],
    rigor_class: "production-transferable",
    risk_tags: ["runtime"],
    size: "M",
    status: "in_progress",
    blockedBy: [],
    files: ["src/first.mjs"],
    acceptance: "The first promised outcome works.",
    check: "node --test",
    evidence: [],
    github: null,
    notes: "",
    ...overrides
  };
}

function validState(overrides = {}) {
  return {
    schema_version: "metawatch-longflow-4.0",
    state_version: 2,
    checkpoint_id: "lf-001-started",
    last_managed_commit: null,
    mode: "interactive",
    status: "in_progress",
    directive: null,
    tier: "T2",
    intent_authority: "tasks/INTENT.md",
    prd: "tasks/run-prd.md",
    promises: [
      {
        number: 1,
        summary: "The first promised outcome works.",
        status: "in_progress",
        evidence: {
          verified_at: null,
          verified_at_sha: null,
          references: [],
          scope: ["src/"]
        },
        dirty_since_sha: null,
        gate: {
          walkthrough: "pending",
          intent_audit: "pending",
          review_cycles: 0,
          review_outcome: "pending",
          raw_reviewer_verdicts: [],
          applied_dispositions: []
        }
      }
    ],
    active_decisions: [],
    open_assumptions: [],
    binding_actions: [],
    residual_risks: [],
    final_closeout: null,
    budget: { estimate: "one item", spent_note: null, items_over_2x: [] },
    breakglass_log: [],
    next_action: "Finish LF-001.",
    agent_pool: {
      max_threads: 3,
      reserved_slots: 2,
      last_reconciled_at: null,
      threads: []
    },
    commits: [],
    block_reason: null,
    started_at: "2026-08-07T09:00:00.000Z",
    updated_at: "2026-08-07T09:01:00.000Z",
    ...overrides
  };
}

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8"
  });
}

function runNpmLongflow(args) {
  const npmArgs = ["run", "--silent", "longflow", "--", ...args];
  if (process.env.npm_execpath) {
    return spawnSync(process.execPath, [process.env.npm_execpath, ...npmArgs], {
      cwd: repoRoot,
      encoding: "utf8"
    });
  }
  return spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", npmArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32"
  });
}

function writeState(root, state) {
  fs.writeFileSync(path.join(root, "tasks", "STATE.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function writeIntent(root, promises) {
  const lines = promises.map((summary, index) => `${index + 1}. ${summary}`).join("\n");
  fs.writeFileSync(path.join(root, "tasks", "INTENT.md"), `# Intent\n\n## Promises\n\n${lines}\n\n## Non-goals\n\nNone.\n`, "utf8");
}

function writeLedger(root, name, item) {
  fs.writeFileSync(path.join(root, "tasks", "ledger", name), `${JSON.stringify(item, null, 2)}\n`, "utf8");
}

function git(root, ...args) {
  const invocation = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(invocation.status, 0, invocation.stderr || invocation.stdout);
  return invocation.stdout.trim();
}

function initialiseGit(root) {
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.email", "longflow@example.test");
  git(root, "config", "user.name", "Longflow Test");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "first.mjs"), "export const first = 1;\n", "utf8");
  fs.writeFileSync(path.join(root, "src", "staged.mjs"), "export const staged = 1;\n", "utf8");
  git(root, "add", ".");
  git(root, "commit", "-m", "baseline");
  return git(root, "rev-parse", "HEAD");
}

function verifiedPromise(sha, scope = ["src/"]) {
  return {
    number: 1,
    summary: "The first promised outcome works.",
    status: "verified",
    evidence: {
      verified_at: "2026-08-07T09:02:00.000Z",
      verified_at_sha: sha,
      references: ["node --test"],
      scope
    },
    dirty_since_sha: null,
    gate: {
      walkthrough: "holds",
      intent_audit: "aligned",
      review_cycles: 1,
      review_outcome: "passed",
      raw_reviewer_verdicts: [],
      applied_dispositions: []
    }
  };
}

function validCloseout(overrides = {}) {
  return {
    completed_at: "2026-08-07T09:03:00.000Z",
    walkthrough: "holds",
    intent_audit: "aligned",
    review_outcome: "passed",
    evidence_references: ["node --test"],
    retro_reference: "RUNS.md",
    ...overrides
  };
}

function completeState(tier = "T2", overrides = {}) {
  return validState({
    mode: "complete",
    status: "complete",
    tier,
    prd: tier === "T1" ? null : "tasks/run-prd.md",
    promises: [verifiedPromise(null)],
    final_closeout: validCloseout(tier === "T1" ? { intent_audit: "n/a", review_outcome: "n/a" } : {}),
    next_action: "Report the completed run.",
    ...overrides
  });
}

function snapshotInputs(root) {
  const snapshot = {};
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else snapshot[path.relative(root, absolute).replaceAll("\\", "/")] = fs.readFileSync(absolute).toString("base64");
    }
  }
  visit(root);
  return snapshot;
}

function problemCodes(result) {
  return result.problems.map(({ code }) => code);
}

test("the importable core and CLI validate a readable v4 run", async (t) => {
  assert.deepEqual(Object.keys(longflow).sort(), ["coverage", "resumeContext", "staleScan", "validate"]);
  const root = makeRun(t);

  assert.deepEqual(await longflow.validate(root), {
    command: "validate",
    ok: true,
    problems: []
  });

  const invocation = runCli(["validate", "--root", root]);
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.equal(invocation.stderr, "");
  assert.deepEqual(JSON.parse(invocation.stdout), {
    command: "validate",
    ok: true,
    problems: []
  });
});

test("documented npm invocations preserve the compact JSON stdout contract", (t) => {
  const documentedInvocations = ["README.md", "scripts/README.md", "workflows/longflow/README.md"]
    .flatMap((relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8")
      .split(/\r?\n/)
      .filter((line) => line.includes("npm run") && line.includes("longflow --"))
      .map((line) => ({ relativePath, line })));
  assert.ok(documentedInvocations.length > 0);
  for (const invocation of documentedInvocations) {
    assert.match(invocation.line, /^npm run --silent longflow -- /, invocation.relativePath);
  }

  const root = makeRun(t);
  const invocation = runNpmLongflow(["validate", "--root", root]);
  const expected = { command: "validate", ok: true, problems: [] };
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.equal(invocation.stderr, "");
  assert.equal(invocation.stdout, `${JSON.stringify(expected)}\n`);
});

test("validation reports malformed state, invalid lifecycle, scope, gate, judgement, and ledger shapes", (t) => {
  const root = makeRun(t);
  const state = validState({
    state_version: 0,
    checkpoint_id: 7,
    last_managed_commit: "short",
    mode: "interactive_override",
    status: "complete",
    directive: null,
    tier: "T0",
    promises: [
      {
        ...validState().promises[0],
        status: "completed",
        evidence: {
          verified_at: "not-a-date",
          verified_at_sha: "short",
          references: "node --test",
          scope: ["C:/absolute.mjs", "../escape.mjs", "src/*.mjs", "src/!negated.mjs", "src\\wrong.mjs"]
        },
        gate: {
          walkthrough: "yes",
          intent_audit: "maybe",
          review_cycles: 4,
          review_outcome: "done",
          raw_reviewer_verdicts: {},
          applied_dispositions: {}
        }
      }
    ],
    active_decisions: {},
    open_assumptions: {},
    binding_actions: {},
    residual_risks: {},
    final_closeout: null
  });
  writeState(root, state);
  writeLedger(root, "LF-001.json", validLedger({ id: "WRONG", promises: [], size: "XL", status: "done" }));

  const result = longflow.validate(root);
  assert.equal(result.ok, false);
  const codes = problemCodes(result);
  for (const code of [
    "state_version",
    "checkpoint_id",
    "last_managed_commit",
    "tier",
    "mode_status",
    "promise_status",
    "evidence_shape",
    "scope",
    "gate_shape",
    "judgement_shape",
    "complete_without_closeout",
    "complete_with_unverified_promises",
    "ledger_id",
    "ledger_promises",
    "ledger_size",
    "ledger_status"
  ]) assert.ok(codes.includes(code), `missing ${code}: ${codes.join(", ")}`);
});

test("validation accepts unsized T1 ledger items and requires S/M/L at T2+", (t) => {
  const root = makeRun(t);
  writeState(root, validState({ tier: "T1", prd: null }));
  writeLedger(root, "LF-001.json", validLedger({ size: null, check: "node --test" }));
  assert.deepEqual(longflow.validate(root).problems, []);

  writeState(root, validState());
  assert.ok(problemCodes(longflow.validate(root)).includes("ledger_size"));
});

test("complete-run validation accepts tier-scaled valid fixtures", (t) => {
  const root = makeRun(t);
  fs.writeFileSync(path.join(root, "RUNS.md"), "# Runs\n\nClosed.\n", "utf8");

  writeState(root, completeState());
  assert.deepEqual(longflow.validate(root).problems, []);

  writeState(root, completeState("T1"));
  writeLedger(root, "LF-001.json", validLedger({ size: null }));
  assert.deepEqual(longflow.validate(root).problems, []);
});

test("T2+ complete runs require aligned audit and a closed reviewer outcome", (t) => {
  const root = makeRun(t);
  fs.writeFileSync(path.join(root, "RUNS.md"), "# Runs\n\nClosed.\n", "utf8");

  writeState(root, completeState("T2", {
    final_closeout: validCloseout({ intent_audit: "n/a", review_outcome: "n/a" })
  }));
  const codes = problemCodes(longflow.validate(root));
  assert.ok(codes.includes("final_closeout_intent_audit"));
  assert.ok(codes.includes("final_closeout_review_outcome"));
});

test("complete-run evidence is non-empty and its safe retro file exists", (t) => {
  const root = makeRun(t);
  fs.writeFileSync(path.join(root, "RUNS.md"), "# Runs\n\nClosed.\n", "utf8");

  writeState(root, completeState("T2", {
    final_closeout: validCloseout({ evidence_references: [] })
  }));
  const emptyEvidence = problemCodes(longflow.validate(root));

  writeState(root, completeState("T2", {
    final_closeout: validCloseout({ retro_reference: "../RUNS.md" })
  }));
  const unsafeRetro = problemCodes(longflow.validate(root));

  writeState(root, completeState("T2", {
    final_closeout: validCloseout({ retro_reference: "notes/RUNS.md" })
  }));
  const missingRetro = longflow.validate(root).problems;
  assert.deepEqual({
    empty_evidence: emptyEvidence.includes("final_closeout_evidence"),
    unsafe_retro: unsafeRetro.includes("retro_reference"),
    missing_retro: missingRetro.some((entry) => entry.code === "artifact_missing" && entry.file === "notes/RUNS.md")
  }, {
    empty_evidence: true,
    unsafe_retro: true,
    missing_retro: true
  });
});

test("gate dispositions reference unique verdict ids and existing findings", (t) => {
  const root = makeRun(t);
  const verdict = {
    id: "RV-001",
    cycle: 1,
    recorded_at: "2026-08-07T09:02:00.000Z",
    verdict: { findings: [{ severity: "blocking", message: "Fix the seam." }] }
  };
  const disposition = {
    verdict_id: "RV-001",
    finding_index: 0,
    action: "fix-now",
    rationale: "The seam was corrected.",
    applied_at: "2026-08-07T09:03:00.000Z"
  };
  const withGate = (gate) => validState({
    promises: [{ ...validState().promises[0], gate }]
  });
  const validGate = {
    ...validState().promises[0].gate,
    review_cycles: 1,
    raw_reviewer_verdicts: [verdict],
    applied_dispositions: [disposition]
  };

  writeState(root, withGate(validGate));
  assert.deepEqual(longflow.validate(root).problems, []);

  writeState(root, withGate({ ...validGate, raw_reviewer_verdicts: [verdict, { ...verdict }] }));
  const duplicate = problemCodes(longflow.validate(root));

  writeState(root, withGate({
    ...validGate,
    applied_dispositions: [{ ...disposition, verdict_id: "RV-404" }]
  }));
  const danglingVerdict = problemCodes(longflow.validate(root));

  writeState(root, withGate({
    ...validGate,
    applied_dispositions: [{ ...disposition, finding_index: 1 }]
  }));
  const danglingFinding = problemCodes(longflow.validate(root));
  assert.deepEqual({
    duplicate: duplicate.includes("gate_verdict_id_duplicate"),
    dangling_verdict: danglingVerdict.includes("gate_disposition_reference"),
    dangling_finding: danglingFinding.includes("gate_disposition_reference")
  }, {
    duplicate: true,
    dangling_verdict: true,
    dangling_finding: true
  });
});

test("readable missing or malformed artifacts are semantic failures, while misuse and unreadable roots exit 2", (t) => {
  const root = makeRun(t);
  fs.writeFileSync(path.join(root, "tasks", "STATE.json"), "{\n", "utf8");

  const malformed = runCli(["validate", "--root", root]);
  assert.equal(malformed.status, 1);
  assert.ok(problemCodes(JSON.parse(malformed.stdout)).includes("json_malformed"));

  fs.rmSync(path.join(root, "tasks", "STATE.json"));
  const missing = runCli(["validate", "--root", root]);
  assert.equal(missing.status, 1);
  assert.ok(problemCodes(JSON.parse(missing.stdout)).includes("artifact_missing"));

  const unknown = runCli(["mutate", "--root", root]);
  assert.equal(unknown.status, 2);
  assert.equal(JSON.parse(unknown.stdout).problems[0].code, "usage");

  const unreadable = runCli(["validate", "--root", path.join(root, "absent")]);
  assert.equal(unreadable.status, 2);
  assert.equal(JSON.parse(unreadable.stdout).problems[0].code, "root_unreadable");
});

test("validation rejects scope negation as glob syntax", (t) => {
  const root = makeRun(t);
  const state = validState();
  state.promises[0].evidence.scope = ["src/!generated.mjs"];
  writeState(root, state);

  assert.ok(problemCodes(longflow.validate(root)).includes("scope"));
});

test("coverage is bidirectional and cancelled items do not fund promises", (t) => {
  const root = makeRun(t);
  writeIntent(root, ["One works.", "Two works.", "Three works."]);
  writeLedger(root, "LF-001.json", validLedger({ promises: [1] }));
  writeLedger(root, "LF-002.json", validLedger({ id: "LF-002", promises: [2], status: "cancelled", notes: "No longer needed." }));
  writeLedger(root, "LF-003.json", validLedger({ id: "LF-003", promises: [] }));
  writeLedger(root, "LF-004.json", validLedger({ id: "LF-004", promises: [99] }));

  const result = longflow.coverage(root);
  assert.deepEqual(result, {
    command: "coverage",
    ok: false,
    promises: [
      { number: 1, summary: "One works.", funded_by: ["LF-001"] },
      { number: 2, summary: "Two works.", funded_by: [] },
      { number: 3, summary: "Three works.", funded_by: [] }
    ],
    uncovered_promises: [2, 3],
    items_missing_promises: ["LF-003"],
    items_unknown_promises: [{ id: "LF-004", promises: [99] }],
    problems: []
  });

  const invocation = runCli(["coverage", "--root", root]);
  assert.equal(invocation.status, 1);
  assert.deepEqual(JSON.parse(invocation.stdout), result);
});

test("coverage succeeds from the default working-directory root", (t) => {
  const root = makeRun(t);
  const invocation = runCli(["coverage"], { cwd: root });
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.deepEqual(JSON.parse(invocation.stdout), {
    command: "coverage",
    ok: true,
    promises: [{ number: 1, summary: "The first promised outcome works.", funded_by: ["LF-001"] }],
    uncovered_promises: [],
    items_missing_promises: [],
    items_unknown_promises: [],
    problems: []
  });
});

test("stale-scan stops at semantic validation for invalid verified evidence", (t) => {
  const root = makeRun(t);
  const verificationSha = initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(verificationSha, [123])] }));

  const result = longflow.staleScan(root);
  assert.equal(result.command, "stale-scan");
  assert.equal(result.ok, false);
  assert.deepEqual(result.promises, []);
  assert.ok(problemCodes(result).includes("scope"));

  const invocation = runCli(["stale-scan", "--root", root]);
  assert.equal(invocation.status, 1);
  assert.equal(invocation.stderr, "");
  assert.deepEqual(JSON.parse(invocation.stdout), result);
});

test("stale-scan keeps unrelated committed changes fresh and flags an in-scope commit", (t) => {
  const root = makeRun(t);
  const verificationSha = initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(verificationSha)] }));
  fs.writeFileSync(path.join(root, "notes.md"), "Unrelated.\n", "utf8");
  git(root, "add", ".");
  git(root, "commit", "-m", "unrelated state and note");

  assert.deepEqual(longflow.staleScan(root), {
    command: "stale-scan",
    ok: true,
    promises: [{ number: 1, status: "verified", freshness: "fresh", changed_paths: [], recommendation: null }],
    problems: []
  });

  fs.writeFileSync(path.join(root, "src", "first.mjs"), "export const first = 2;\n", "utf8");
  git(root, "add", "src/first.mjs");
  git(root, "commit", "-m", "change first");
  const stale = longflow.staleScan(root);
  assert.equal(stale.ok, false);
  assert.deepEqual(stale.promises, [
    {
      number: 1,
      status: "verified",
      freshness: "stale",
      changed_paths: ["src/first.mjs"],
      recommendation: { status: "needs_recheck", dirty_since_sha: verificationSha }
    }
  ]);
  assert.deepEqual(stale.problems, []);

  const invocation = runCli(["stale-scan", "--root", root]);
  assert.equal(invocation.status, 1);
  assert.deepEqual(JSON.parse(invocation.stdout), stale);
});

test("stale-scan includes staged, unstaged, and untracked in-scope paths", (t) => {
  const root = makeRun(t);
  const verificationSha = initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(verificationSha)] }));
  fs.writeFileSync(path.join(root, "src", "staged.mjs"), "export const staged = 2;\n", "utf8");
  git(root, "add", "src/staged.mjs");
  fs.writeFileSync(path.join(root, "src", "first.mjs"), "export const first = 2;\n", "utf8");
  fs.writeFileSync(path.join(root, "src", "untracked.mjs"), "export const untracked = true;\n", "utf8");

  const result = longflow.staleScan(root);
  assert.equal(result.ok, false);
  assert.deepEqual(result.promises[0], {
    number: 1,
    status: "verified",
    freshness: "stale",
    changed_paths: ["src/first.mjs", "src/staged.mjs", "src/untracked.mjs"],
    recommendation: { status: "needs_recheck", dirty_since_sha: verificationSha }
  });
});

test("stale-scan treats an exact-file scope differently from its sibling", (t) => {
  const root = makeRun(t);
  const verificationSha = initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(verificationSha, ["src/first.mjs"])] }));
  fs.writeFileSync(path.join(root, "src", "staged.mjs"), "export const staged = 2;\n", "utf8");

  assert.equal(longflow.staleScan(root).promises[0].freshness, "fresh");

  fs.writeFileSync(path.join(root, "src", "first.mjs"), "export const first = 2;\n", "utf8");
  const stale = longflow.staleScan(root).promises[0];
  assert.equal(stale.freshness, "stale");
  assert.deepEqual(stale.changed_paths, ["src/first.mjs"]);
});

test("stale-scan reports null and unavailable verification revisions as indeterminate", (t) => {
  const root = makeRun(t);
  initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(null)] }));

  const noRevision = longflow.staleScan(root);
  assert.equal(noRevision.ok, false);
  assert.deepEqual(noRevision.promises[0], {
    number: 1,
    status: "verified",
    freshness: "indeterminate",
    changed_paths: [],
    recommendation: { status: "needs_recheck", dirty_since_sha: null }
  });
  assert.equal(noRevision.problems[0].code, "verification_revision_missing");

  writeState(root, validState({ promises: [verifiedPromise("f".repeat(40))] }));
  const unavailable = longflow.staleScan(root);
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.promises[0].freshness, "indeterminate");
  assert.equal(unavailable.problems[0].code, "verification_revision_unavailable");
});

test("stale-scan does not compare an existing non-ancestor verification revision", (t) => {
  const root = makeRun(t);
  initialiseGit(root);
  const unrelated = git(root, "commit-tree", git(root, "write-tree"), "-m", "unrelated verification");
  writeState(root, validState({ promises: [verifiedPromise(unrelated)] }));

  const result = longflow.staleScan(root);
  assert.equal(result.ok, false);
  assert.equal(result.promises[0].freshness, "indeterminate");
  assert.equal(result.problems[0].code, "verification_revision_non_ancestor");
});

test("resume-context projects durable judgement and a bounded execplan tail", (t) => {
  const root = makeRun(t);
  const state = validState({
    checkpoint_id: "promise-1-gate",
    mode: "continuous",
    directive: "Continue until every promise is verified.",
    active_decisions: [{ id: "D-001", decision: "Keep mechanics read-only.", serves_promise: 1, because: "Judgement stays with the agent.", recorded_at: "2026-08-07T09:00:00.000Z" }],
    open_assumptions: [{ id: "A-001", assumption: "Four commands are enough.", serves_promise: 1, validation: "Dogfood them.", recorded_at: "2026-08-07T09:00:00.000Z" }],
    binding_actions: [
      { id: "B-001", source: "owner", action: "Park PTC.", serves_promise: 1, status: "open", recorded_at: "2026-08-07T09:00:00.000Z" },
      { id: "B-002", source: "gate", action: "Old action.", serves_promise: 1, status: "completed", recorded_at: "2026-08-07T09:00:00.000Z" }
    ],
    residual_risks: [{ id: "R-001", risk: "Dogfooding may expose gaps.", serves_promise: 1, disposition: "Reopen evidence.", recorded_at: "2026-08-07T09:00:00.000Z" }]
  });
  writeState(root, state);
  fs.writeFileSync(path.join(root, "tasks", "2026-08-07-run-execplan.md"), "one\ntwo\nthree\nfour\n", "utf8");

  const result = longflow.resumeContext(root, { tail: 2 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.context, {
    checkpoint_id: "promise-1-gate",
    state_version: 2,
    last_managed_commit: null,
    mode: "continuous",
    status: "in_progress",
    tier: "T2",
    directive: "Continue until every promise is verified.",
    intent_authority: "tasks/INTENT.md",
    prd: "tasks/run-prd.md",
    next_action: "Finish LF-001.",
    promise_freshness: [{ number: 1, summary: "The first promised outcome works.", status: "in_progress", freshness: "not_applicable" }],
    active_decisions: state.active_decisions,
    open_assumptions: state.open_assumptions,
    open_binding_actions: [state.binding_actions[0]],
    residual_risks: state.residual_risks,
    final_closeout: null,
    block_reason: null,
    execplan_tail: { path: "tasks/2026-08-07-run-execplan.md", lines: ["three", "four"] }
  });
  assert.deepEqual(result.problems, []);

  const invocation = runCli(["resume-context", "--root", root, "--tail", "2"]);
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.deepEqual(JSON.parse(invocation.stdout), result);

  const badTail = runCli(["resume-context", "--root", root, "--tail", "0"]);
  assert.equal(badTail.status, 2);
});

test("resume-context requires the authoritative intent artifact", (t) => {
  const root = makeRun(t);
  fs.rmSync(path.join(root, "tasks", "INTENT.md"));

  const result = longflow.resumeContext(root);
  assert.equal(result.ok, false);
  assert.ok(problemCodes(result).includes("artifact_missing"));
});

test("resume-context returns structured problems for a malformed readable snapshot", (t) => {
  const root = makeRun(t);
  writeState(root, validState({ promises: {}, binding_actions: {} }));

  const result = longflow.resumeContext(root);
  assert.equal(result.ok, false);
  assert.equal(result.context, null);
  assert.ok(problemCodes(result).includes("promises_shape"));
  assert.ok(problemCodes(result).includes("judgement_shape"));
});

test("all core and CLI operations leave every input byte unchanged", (t) => {
  const root = makeRun(t);
  const verificationSha = initialiseGit(root);
  writeState(root, validState({ promises: [verifiedPromise(verificationSha)] }));
  const before = snapshotInputs(root);

  longflow.validate(root);
  longflow.coverage(root);
  longflow.staleScan(root);
  longflow.resumeContext(root, { tail: 5 });
  for (const command of ["validate", "coverage", "stale-scan", "resume-context"]) {
    const args = [command, "--root", root];
    if (command === "resume-context") args.push("--tail", "5");
    runCli(args);
  }

  assert.deepEqual(snapshotInputs(root), before);
});
