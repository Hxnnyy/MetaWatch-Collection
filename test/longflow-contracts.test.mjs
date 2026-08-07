import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import test from "node:test";
import { repoRoot } from "../scripts/workflow-paths.mjs";

const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));

function tableRow(markdown, label) {
  const row = markdown.split(/\r?\n/).find((line) => line.startsWith("|") && line.includes(`| ${label} |`));
  assert.ok(row, `missing ${label} table row`);
  return row.split("|").slice(1, -1).map((cell) => cell.trim());
}

function embeddedJson(markdown) {
  return JSON.parse(markdown.slice(markdown.indexOf("{"), markdown.lastIndexOf("}") + 1));
}

test("tier policy is a complete machine-readable contract", () => {
  const policy = readJson("shared/orchestration/tier-policy.json");
  assert.equal(policy.version, 1);
  assert.deepEqual(Object.keys(policy.tiers), ["T0", "T1", "T2", "T3"]);
  assert.deepEqual(policy.tiers.T0.artifacts, []);
  assert.deepEqual(policy.tiers.T1.artifacts, ["INTENT.md", "STATE.json", "execplan", "ledger"]);
  assert.equal(policy.tiers.T1.prd, false);
  assert.equal(policy.tiers.T1.council, "never");
  assert.deepEqual(policy.tiers.T1.gates, ["walkthrough"]);
  assert.equal(policy.tiers.T2.council, "genuine-disagreement-only");
  assert.deepEqual(policy.tiers.T2.gates, ["walkthrough", "intent-audit", "risk-routed-reviewers"]);
  assert.equal(policy.tiers.T3.ownerApproval, "required-before-start");
  assert.equal(policy.tiers.T3.council, "one-round-default; second-round-shape-changing-exception");
  for (const tier of ["T1", "T2"]) assert.equal(policy.tiers[tier].ownerAbsence, "drafted-unconfirmed");
  assert.deepEqual(policy.promiseStatusVocabulary, ["open", "in_progress", "verifying", "verified", "needs_recheck"]);
});

test("Longflow configs name the canonical policy and keep Google independent as chair", () => {
  for (const relativePath of [
    "workflows/longflow/longflow.config.json",
    "workflows/longflow/longflow.config.example.json",
    "workflows/longflow/examples/longflow.config.opinionated.json"
  ]) {
    const config = readJson(relativePath);
    assert.equal(config.version, "3.0");
    assert.equal(config.tier.policyFixture, "shared/orchestration/tier-policy.json");
    assert.equal(config.models.councilChair.alias, "frontier-google");
    assert.ok(!config.models.council.includes("frontier-google"));
    assert.ok(!("frontier-oss" in config.modelAliases));
    assert.ok(!("autonomyEnvelope" in config));
    assert.ok(!("closurePolicy" in config));
    assert.ok(!("continuousModeDefault" in config.workflow));
    assert.ok(!("pauseOnlyOnHardBlocks" in config.workflow));
    execFileSync(process.execPath, ["scripts/validate-config.mjs", relativePath], { cwd: repoRoot, stdio: "pipe" });
  }

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "longflow-config-"));
  try {
    const portable = readJson("workflows/longflow/longflow.config.example.json");
    portable.models.councilChair.alias = "frontier-xai";
    portable.models.council = portable.models.council.filter((alias) => alias !== "frontier-xai");
    const configPath = path.join(fixtureRoot, "portable.config.json");
    fs.writeFileSync(configPath, `${JSON.stringify(portable, null, 2)}\n`, "utf8");
    execFileSync(process.execPath, ["scripts/validate-config.mjs", configPath], { cwd: repoRoot, stdio: "pipe" });
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("Longflow config validation rejects mutations of fixed policy knobs", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "longflow-policy-config-"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const baseline = readJson("workflows/longflow/longflow.config.example.json");
  const mutations = [
    ["tier.default", (config) => { config.tier.default = "T1"; }],
    ["tier.blockForApprovalAt", (config) => { config.tier.blockForApprovalAt = ["T2", "T3"]; }],
    ["council.maxRounds", (config) => { config.council.maxRounds = 2; }],
    ["council.t3MaxRounds", (config) => { config.council.t3MaxRounds = 1; }],
    ["guardrails.reviewCycleBudgetPerGate", (config) => { config.guardrails.reviewCycleBudgetPerGate = 2; }],
    ["guardrails.maxImplementerRetryPerIssue", (config) => { config.guardrails.maxImplementerRetryPerIssue = 2; }]
  ];

  for (const [key, mutate] of mutations) {
    const config = structuredClone(baseline);
    mutate(config);
    const configPath = path.join(fixtureRoot, `${key.replaceAll(".", "-")}.json`);
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    const result = spawnSync(process.execPath, ["scripts/validate-config.mjs", configPath], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    assert.equal(result.status, 1, `${key} mutation was accepted:\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, new RegExp(key.replaceAll(".", "\\.")));
  }

  execFileSync(process.execPath, ["scripts/validate-config.mjs", "workflows/merge-train/merge-train.config.example.json"], {
    cwd: repoRoot,
    stdio: "pipe"
  });
});

test("policy boundaries keep state recovery, predicate changes, and breakglass unambiguous", () => {
  const hardBlocks = read("shared/orchestration/hard-block-conditions.md");
  assert.match(hardBlocks, /missing or malformed mid-run.*categorical.*never reconstruct/is);
  assert.doesNotMatch(hardBlocks, /cannot be reconstructed safely/i);

  const predicateReview = read("shared/verification/predicate-adequacy-review.md");
  assert.match(predicateReview, /T1.*change the check or reslice.*one recorded line.*green/is);
  assert.match(predicateReview, /T2\+.*production-transferable.*independent concurrence/is);

  const execution = read("workflows/longflow/skills/issues-execution/SKILL.md");
  assert.match(execution, /explicit logged below-default breakglass.*waives.*predicate/is);
  assert.match(execution, /only an unwaived missing T2\+ production predicate is a configuration bug/is);
});

test("portable fallback prompts require canonical reviewer verdicts", () => {
  const baseFields = [
    "reviewer",
    "scope",
    "verdict",
    "blocking_count",
    "findings",
    "predicate_adequacy",
    "test_adequacy",
    "governance_flags",
    "residual_risks",
    "recommended_next_action"
  ];
  const findingFields = [
    "severity",
    "blocking",
    "title",
    "evidence",
    "explanation",
    "required_resolution",
    "disposition"
  ];

  const finalPrompt = read("workflows/longflow/examples/prompts/final-closeout-review.txt");
  const finalSchema = embeddedJson(finalPrompt);
  assert.deepEqual(Object.keys(finalSchema), baseFields);
  assert.deepEqual(Object.keys(finalSchema.findings[0]), findingFields);
  assert.doesNotMatch(finalSchema.verdict, /PASS_WITH_NOTES/);

  const intentPrompt = read("workflows/longflow/examples/prompts/intent-audit.txt");
  assert.match(intentPrompt, /STATE\.json.*active decisions.*open assumptions.*binding actions.*residual risks/is);
  const intentSchema = embeddedJson(intentPrompt);
  assert.deepEqual(Object.keys(intentSchema), [
    ...baseFields,
    "intent_alignment",
    "proportionality",
    "hollow_promises",
    "unfunded_work",
    "descope_recommendations"
  ]);
  assert.deepEqual(Object.keys(intentSchema.findings[0]), findingFields);
});

test("named and fallback intent auditors keep notes non-final and final verdicts decisive", () => {
  const named = read("workflows/longflow/agents/intent-auditor.md");
  const fallback = read("workflows/longflow/examples/prompts/intent-audit.txt");
  const namedSchema = embeddedJson(named);
  const fallbackSchema = embeddedJson(fallback);

  for (const auditor of [named, fallback]) {
    assert.match(auditor, /PASS_WITH_NOTES.*non-final.*disposition/is);
    assert.match(auditor, /final closeout.*normal.*only.*PASS.*BLOCKED.*NOT_APPLICABLE/is);
  }
  assert.deepEqual(Object.keys(namedSchema), Object.keys(fallbackSchema));
  assert.deepEqual(Object.keys(namedSchema.findings[0]), Object.keys(fallbackSchema.findings[0]));
  assert.equal(namedSchema.verdict, "PASS | PASS_WITH_NOTES | BLOCKED | NOT_APPLICABLE");
  assert.equal(fallbackSchema.verdict, namedSchema.verdict);
});

test("operator docs distinguish reviewer authority, closure paths, and owner absence", () => {
  const routing = read("shared/orchestration/model-routing.md");
  assert.match(routing, /issue-level reviews.*`routing\.reviewersByIssueType`/is);
  assert.match(routing, /promise-gate panels.*`routing\.promiseGateReviewers`/is);

  for (const relativePath of [
    "workflows/longflow/docs/FLOW_STEPS.md",
    "workflows/longflow/docs/MODEL_AND_PERSONA_ROUTING.md"
  ]) {
    const doc = read(relativePath);
    assert.match(doc, /normal.*no blocking.*budget-exhausted.*non-material.*closed_with_residuals/is);
    assert.match(doc, /raw blocking verdicts.*unchanged/is);
  }

  for (const relativePath of ["workflows/longflow/README.md", "workflows/longflow/docs/FLOW_STEPS.md"]) {
    const doc = read(relativePath);
    assert.match(doc, /seek.*owner.*sign-?off/is);
    assert.match(doc, /owner absent.*T1.*T2.*drafted-unconfirmed.*T3.*block/is);
  }
});

test("canonical prose applies the tier, gate, verdict, and recovery contracts", () => {
  const calibration = read("shared/orchestration/process-calibration.md");
  const slicing = tableRow(calibration, "Slicing");
  assert.match(slicing[2], /local ledger \+ coverage audit/);
  assert.match(tableRow(calibration, "Council")[4], /second only after a shape-changing exception/);
  assert.match(calibration, /`S` is one bounded vertical change/);

  const continuous = read("shared/orchestration/continuous-mode.md");
  assert.match(continuous, /Bare `go` is not a continuous directive/);
  assert.match(continuous, /explicit interactive.*takes precedence.*STATE\.json.*continuous/is);
  assert.match(continuous, /final closeout \| Not a normal pass.*budget-exhaustion residual path/);
  assert.match(continuous, /T1.*end-to-end walkthrough.*T2\+.*final intent audit.*final reviewer/is);
  const neutralStateTemplate = readJson("shared/templates/STATE.json");
  assert.equal(neutralStateTemplate.mode, null);
  assert.equal(neutralStateTemplate.directive, null);

  const gates = read("shared/orchestration/promise-gates.md");
  assert.match(gates, /eligible as soon as a credible runnable path/);
  assert.match(gates, /forced.*last mapped item/is);
  assert.match(gates, /Mark the promise `verified`/);
  assert.match(gates, /intent auditor \(T2\+\) is `aligned` when required/);
  assert.match(gates, /challenge every remaining mapped item/);

  const reviewer = read("shared/review/reviewer-protocol.md");
  assert.match(reviewer, /`fix-now`, `follow-up`.*`residual-risk`.*`rebutted`/s);
  assert.match(reviewer, /complete required-reviewer pass/);
  assert.match(reviewer, /intent audit \(T2\+\) is `aligned`/);
  assert.match(reviewer, /final panel runs; that panel accepts only `PASS` or `NOT_APPLICABLE`/);
  assert.match(reviewer, /normal final closure.*PASS.*NOT_APPLICABLE.*exceptional.*closed_with_residuals/is);
  const modelRouting = read("shared/orchestration/model-routing.md");
  assert.match(modelRouting, /initial final-closeout cycle.*exactly once/is);
  assert.doesNotMatch(modelRouting, /^At final closeout, each required persona runs \*\*exactly once\*\*/m);
  assert.match(modelRouting, /no backup.*hard-block 7/is);

  const execution = read("workflows/longflow/skills/issues-execution/SKILL.md");
  assert.match(execution, /reused when they exist/);
  assert.match(execution, /never overwrite an existing `STATE\.json` or execplan/);
  assert.match(execution, /credible runnable path.*forced.*last mapped item/is);
  assert.doesNotMatch(execution, /When the last item serving a promise completes/);
  assert.match(execution, /hard-block 3.*three corrective dispatches/is);
  assert.match(execution, /Final intent audit\*\* \(T2\+\)/);
  assert.match(execution, /Final reviewer panel\*\* \(T2\+\)/);
  assert.match(execution, /continuous mode.*suppress.*interactive.*surface/is);
  assert.ok(execution.indexOf("## T0 boundary") > -1);
  assert.ok(execution.indexOf("## T0 boundary") < execution.indexOf("## Phase 0"));
  assert.match(execution, /T0.*do not create or require.*INTENT.*STATE.*execplan.*ledger/is);
  assert.ok(execution.indexOf("Append the retro") < execution.indexOf("Set `STATE.json` to `complete`"));
  const execplanTemplate = read("shared/templates/EXECPLAN.md");
  assert.match(execplanTemplate, /continuous mode.*CHECKIN-SUPPRESSED.*interactive.*surface/is);
  const governance = read("shared/templates/delivery-governance.md");
  assert.match(
    governance,
    /explicit continuous directive.*persisted.*mode: continuous.*bare `go`.*never newly activates.*not an interactive override.*survives/is,
  );
  assert.doesNotMatch(governance, /bare `go` is interactive/i);
  assert.doesNotMatch(governance, /Continuous mode is the default/);
  const slicer = read("workflows/longflow/skills/prd-to-issues/SKILL.md");
  assert.match(slicer, /downstream.*explicit continuous directive/is);
  assert.doesNotMatch(slicer, /Continuous mode is the downstream default/);
  const qualitySweep = read("workflows/longflow/skills/codebase-quality-sweep/SKILL.md");
  assert.doesNotMatch(qualitySweep, /continuous(?:ly)? by default/i);
  assert.match(
    qualitySweep,
    /explicit continuous directive.*persisted `mode: continuous`.*latest explicit interactive override.*bare `go`.*never newly activates/is,
  );
  const orchestrator = read("workflows/longflow/skills/longflow-orchestrator/SKILL.md");
  assert.match(orchestrator, /Read the latest relevant `RUNS\.md` retro before calibrating/);
  assert.match(orchestrator, /capture.*in conversation.*persist.*T1\+/is);
  assert.match(continuous, /T0.*outside.*durable.*no `STATE\.json`/is);
  assert.match(read("shared/templates/council-round.md"), /frozen proposal version.*promise list.*non-goals.*decision questions/s);
  const executionPolicy = read("workflows/longflow/docs/EXECUTION_POLICY.md");
  assert.match(executionPolicy, /final intent audit is `aligned`/);
  assert.match(executionPolicy, /Required final persona audits.*PASS.*NOT_APPLICABLE.*closed_with_residuals/is);
  const stateFiles = read("shared/orchestration/state-files.md");
  assert.match(stateFiles, /One file per work item.*T1\+/);
  assert.match(stateFiles, /"status": "open \| in_progress \| verifying \| verified \| needs_recheck"/);
  assert.doesNotMatch(stateFiles, /gated \| true/);
  assert.match(executionPolicy, /tasks\/ledger\/\*\.json \(T1\+\)/);
  const longflowReadme = read("workflows/longflow/README.md");
  assert.match(longflowReadme, /`write-a-prd`\*\* \(T2\+\)/);
  assert.match(longflowReadme, /`prd-to-issues`\*\* \(T1\+\)/);
  assert.match(longflowReadme, /`issues-execution`\*\* \(T1\+.*mode.*activation/is);
  assert.match(longflowReadme, /continuous mode.*check-ins are suppressed.*interactive mode.*surfaced/is);
  assert.match(gates, /review_outcome: closed_with_residuals/);
  assert.match(reviewer, /raw reviewer verdicts remain unchanged.*closed_with_residuals/is);
});

test("T1 slicing stays lite while T2+ keeps sized, classed predicates", () => {
  const calibration = read("shared/orchestration/process-calibration.md");
  assert.match(tableRow(calibration, "Slicing")[2], /no sizing/);
  assert.match(tableRow(calibration, "Item verification")[2], /one honest check per item/);
  assert.match(calibration, /At T1.*`size: null`.*At T2\+.*`S`.*`M`.*`L`/is);

  const slicer = read("workflows/longflow/skills/prd-to-issues/SKILL.md");
  assert.match(slicer, /T1.*`tasks\/INTENT\.md`.*short execplan.*no PRD/is);
  assert.match(slicer, /T1.*`size: null`.*one honest check.*no predicate script/is);
  assert.match(slicer, /T2\+.*S\/M\/L.*production.*predicate script/is);

  const ledger = read("shared/orchestration/ledger.md");
  assert.match(ledger, /"size": "null at T1 \| S \| M \| L at T2\+"/);
  assert.equal(readJson("shared/templates/ledger-item.json").size, null);
  assert.match(read("shared/templates/child-issue.md"), /T1: `null`; T2\+: S \| M \| L/);

  const predicates = read("shared/verification/acceptance-predicates.md");
  assert.match(predicates, /T1.*one honest check per item.*no frozen predicate scripts/is);
  assert.match(predicates, /production predicate roll-up.*T2\+ only/is);

  const execution = read("workflows/longflow/skills/issues-execution/SKILL.md");
  assert.match(execution, /T1.*one honest check per item.*T2\+.*predicate script/is);
  assert.match(execution, /production predicate roll-up \(T2\+ only\)/);

  const readme = read("workflows/longflow/README.md");
  assert.match(readme, /At T1.*`size: null`.*one honest check.*no PRD.*no predicate scripts/is);
});

test("operator entry points agree on activation, council, gates, and state recovery", () => {
  const orchestrator = read("workflows/longflow/skills/longflow-orchestrator/SKILL.md");
  const executor = read("workflows/longflow/skills/issues-execution/SKILL.md");
  for (const entryPoint of [orchestrator, executor]) {
    assert.match(entryPoint, /explicit continuous directive.*persisted `mode: continuous`.*latest explicit interactive override.*bare `go`.*never newly activates/is);
    assert.doesNotMatch(entryPoint, /(?:activates only on|requires) an explicit continuous directive/i);
  }

  const councilSources = [
    read("shared/orchestration/council-protocol.md"),
    read("workflows/longflow/skills/council/SKILL.md"),
    read("workflows/longflow/docs/COUNCIL_RUNBOOK.md"),
    orchestrator
  ];
  for (const council of councilSources) {
    assert.match(council, /T2.*genuine plan-level disagreement/is);
    assert.match(council, /architecture risk.*broad.*may surface.*disagreement.*not independent triggers/is);
  }

  const flow = read("workflows/longflow/docs/FLOW_STEPS.md");
  assert.match(flow, /eligible.*credible runnable path.*forced.*last mapped item/is);
  assert.doesNotMatch(flow, /judge each promise when its items complete/i);

  assert.match(executor, /initial calibrated preparation.*create.*missing.*STATE\.json/is);
  assert.match(executor, /resume.*mid-run.*missing or malformed.*hard-block 8/is);
});

test("portable council chair adjudicates normative conflicts once and spikes empirical disputes", () => {
  const chair = read("workflows/longflow/examples/prompts/chair-tiebreak.txt");
  assert.match(chair, /one time-boxed round/i);
  assert.match(chair, /lab-independent.*nonvoting/is);
  assert.match(chair, /classify.*empirical.*normative/is);
  assert.match(chair, /empirical.*spike/is);
  assert.match(chair, /normative.*disposition.*once/is);
  assert.match(chair, /never.*empirical.*(?:debate|tie-break)/is);
  assert.doesNotMatch(chair, /council loop|resolve split decisions with tie-break/i);
});

test("the optional stop guard counts every promise not yet verified", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "longflow-stop-guard-"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  fs.mkdirSync(path.join(fixtureRoot, "tasks"), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, "tasks", "STATE.json"), JSON.stringify({
    mode: "continuous",
    status: "in_progress",
    next_action: "Continue.",
    promises: [{ status: "verified" }, { status: "verified" }, { status: "true" }]
  }), "utf8");

  const guard = spawnSync(process.execPath, [path.join(repoRoot, "shared/hooks/continuous-stop-guard/continuous-stop-guard.mjs")], {
    input: JSON.stringify({ cwd: fixtureRoot }),
    encoding: "utf8"
  });
  assert.equal(guard.status, 2);
  assert.match(guard.stderr, /open promises: 1/);
});

test("stop-guard wiring is automatic only through repository-local harness config", () => {
  const hook = read("shared/hooks/continuous-stop-guard/HOOK.md");
  assert.match(hook, /default.*skip the hook/is);
  assert.match(hook, /automatic wiring.*repo-local.*only where.*supports repository-local hooks/is);
  assert.match(hook, /Codex CLI.*user-global.*skip automatic.*deliberate owner.*manual opt-in/is);
  assert.match(hook, /Gemini CLI.*user-global.*skip automatic.*deliberate owner.*manual opt-in/is);
  assert.doesNotMatch(hook, /issues-execution.*wires.*target project's settings/is);
});

test("kickoff output derives its contract from the canonical kickoff template", () => {
  const output = execFileSync(process.execPath, ["scripts/generate-kickoff-prompt.mjs", "workflows/longflow/longflow.config.example.json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  const contract = read("shared/templates/orchestrator-kickoff.md");
  assert.ok(output.startsWith(contract));
  for (const heading of ["## Mission", "## Guardrails", "## Final Closure"]) {
    assert.ok(contract.includes(heading));
    assert.ok(output.includes(heading.replace("## ", "")));
  }
  assert.match(output, /verified|needs_recheck/);
  assert.match(output, /explicit continuous directive/);
  assert.match(output, /existing `tasks\/STATE\.json`.*`mode: continuous`/s);
  assert.match(output, /explicit interactive override.*takes precedence.*persisted continuous/is);
  assert.match(output, /credible runnable path/);
  assert.match(output, /T2\+.*intent audit.*risk-routed reviewers/s);
  assert.match(output, /note.*explicit disposition/s);
  assert.match(output, /T0.*no Longflow artifacts.*T1\+/s);
  assert.match(output, /closed_with_residuals/);
  assert.match(output, /T1.*end-to-end walkthrough.*T2\+.*final intent audit.*final reviewers/is);
  assert.doesNotMatch(output, /continuous mode default|configurable\/default activation/i);
  assert.doesNotMatch(output, /canonical kickoff contract above governs/i);
  assert.doesNotMatch(output, /every promise is true/i);
});

test("generated kickoff can prepare a rough-intent run and safely resume it", () => {
  const output = execFileSync(process.execPath, ["scripts/generate-kickoff-prompt.mjs", "workflows/longflow/longflow.config.example.json"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.match(output, /rough intent.*calibrate.*capture.*before.*(?:creat(?:e|ing)|writ(?:e|ing)).*run files/is);
  assert.match(output, /owner absent.*T1.*T2.*drafted-unconfirmed.*T3.*block/is);
  assert.match(output, /T1.*no PRD.*no council.*no sizing.*no (?:frozen )?predicate scripts.*local ledger.*blocking coverage.*honest check/is);
  assert.match(output, /T2.*council.*genuine disagreement only.*T2\+.*PRD.*sizing.*predicate/is);
  assert.match(output, /logged below-default breakglass/is);
  assert.match(output, /only.*initial calibrated preparation.*create.*STATE\.json/is);
  assert.match(output, /resume.*missing or malformed.*STATE\.json.*hard-block 8/is);
  assert.match(output, /bare `go`.*never newly activates.*not an interactive override/is);
  assert.match(output, /persisted continuous.*survives.*bare `go`/is);
});

test("the PRD entry point preserves the T2 owner-absence branch and T3 block", () => {
  const skill = read("workflows/longflow/skills/write-a-prd/SKILL.md");
  assert.match(skill, /owner absent.*T2.*drafted-unconfirmed.*smallest defensible.*provisional.*proceed/is);
  assert.match(skill, /owner absent.*T3.*block/is);
  assert.match(skill, /owner (?:is )?available.*confirm.*promise-level acceptance/is);
});

test("reviewer personas are repository sources and the roster remains five people", () => {
  const roster = ["implementation-reviewer", "security-reviewer", "product-reviewer", "operations-reviewer", "intent-auditor"];
  for (const persona of roster) {
    const prompt = read(`workflows/longflow/agents/${persona}.md`);
    assert.match(prompt, new RegExp(`name: ${persona}`));
    assert.match(prompt, /"verdict"/);
  }
  execFileSync(process.execPath, ["scripts/validate-agents.mjs"], { cwd: repoRoot, stdio: "pipe" });
});

test("Markdown validation rejects broken inline code paths and accepts canonical references", () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "longflow-links-"));
  try {
    fs.writeFileSync(path.join(fixtureRoot, "broken.md"), "See `./missing.md`.\n", "utf8");
    const broken = spawnSync(process.execPath, [path.join(repoRoot, "scripts/validate-markdown-links.mjs"), fixtureRoot], { encoding: "utf8" });
    assert.equal(broken.status, 1);
    assert.match(broken.stderr, /broken\.md -> \.\/missing\.md/);

    fs.writeFileSync(path.join(fixtureRoot, "target.md"), "ok\n", "utf8");
    fs.writeFileSync(path.join(fixtureRoot, "broken.md"), "See `./target.md`.\n", "utf8");
    const fixed = spawnSync(process.execPath, [path.join(repoRoot, "scripts/validate-markdown-links.mjs"), fixtureRoot], { encoding: "utf8" });
    assert.equal(fixed.status, 0, fixed.stderr);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("installed skill parity detects stale export-transformed content", async () => {
  const { compareInstalledSkill, expectedSkillFiles } = await import("../scripts/skill-export-content.mjs");
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "metawatch-installed-skills-"));
  const skill = {
    name: "issues-execution",
    source: "workflows/longflow/skills/issues-execution",
    workflow: "longflow"
  };

  try {
    for (const [relativePath, contents] of expectedSkillFiles(skill)) {
      const target = path.join(fixtureRoot, skill.name, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents, "utf8");
    }
    assert.deepEqual(compareInstalledSkill(fixtureRoot, skill), []);

    fs.appendFileSync(path.join(fixtureRoot, skill.name, "SKILL.md"), "\nSTALE\n", "utf8");
    assert.match(compareInstalledSkill(fixtureRoot, skill).join("\n"), /content drift.*SKILL\.md/);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
