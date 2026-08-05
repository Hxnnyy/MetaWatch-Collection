import fs from "node:fs";
import path from "node:path";

const configPath = process.argv[2] || "./workflows/longflow/longflow.config.json";
const outputPath = process.argv[3] || "";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function list(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function makeResolver(aliases) {
  return function resolve(alias) {
    const physical = aliases[alias];
    return physical ? `${physical} [${alias}]` : `${alias} (UNRESOLVED ALIAS)`;
  };
}

function buildLongflowPrompt(config, resolve) {
  const lead = config.routing.leadByIssueType;
  const issueReview = config.routing.reviewersByIssueType;
  const tier = config.tier || {};
  const council = config.council || {};
  const adjudication = config.adjudication || {};

  return [
    `You are the implementation orchestrator for ${config.workflow.name}.`,
    "",
    "Phase 0 — intent and calibration:",
    "1. Capture the intent contract (tasks/INTENT.md): numbered promises, non-goals, product class, owner's words.",
    `2. Propose a ceremony tier with a plain-English rationale (tier.default: ${tier.default || "propose"}); block for owner approval at: ${(tier.blockForApprovalAt || ["T3"]).join(", ")}.`,
    "3. Name the riskiest assumption; spike it if a cheap experiment can answer it.",
    "4. T0 means just build it — no Longflow artifacts. That is a valid outcome.",
    "",
    "Execution constraints:",
    `1. Continuous mode default: ${config.workflow.continuousModeDefault}.`,
    `2. Pause only on hard blocks: ${config.workflow.pauseOnlyOnHardBlocks}.`,
    "3. Err toward under-engineering: flag follow-ups instead of building them.",
    "4. Gates attach to promises, not waves. Every gate opens with a walkthrough.",
    "5. Rigour follows the item: production-transferable gets the full gate; dogfood-disposable gets one honest check; a spike delivers an answer.",
    "6. Re-read STATE.json (directive field) and INTENT.md at every promise gate and on every resume.",
    "7. Every recorded decision carries: serves promise #N because <...>.",
    "",
    "Intent auditor (fresh-context, binding descope authority at T1-T2):",
    `- ${resolve(config.routing.intentAuditor)}`,
    `- Cross-provider adjudication for contested T3 verdicts: ${(adjudication.providers || []).join(", ") || "none configured"} (fallback: ${adjudication.fallback || "same-provider-skeptic"}).`,
    "",
    "Council (single time-boxed round; empirical disagreements become spikes):",
    `- Chair (lab-independent, does not vote): ${resolve(config.models.councilChair.alias)} (${config.models.councilChair.reasoning})`,
    "- Members (one carries the pragmatist seat on the strongest model):",
    list(config.models.council.map(resolve)),
    `- Max rounds: ${council.maxRounds ?? 1} (T3 exception: ${council.t3MaxRounds ?? 2}).`,
    "",
    "Lead routing by issue type:",
    `- Frontend: ${resolve(lead.frontend)}`,
    `- Backend: ${resolve(lead.backend)}`,
    `- Security: ${resolve(lead.security)}`,
    `- Docs: ${resolve(lead.docs)}`,
    "",
    "Issue reviewer routing:",
    `- Frontend reviewers: ${issueReview.frontend.map(resolve).join(", ")}`,
    `- Backend reviewers: ${issueReview.backend.map(resolve).join(", ")}`,
    `- Security reviewers: ${issueReview.security.map(resolve).join(", ")}`,
    `- Docs reviewers: ${issueReview.docs.map(resolve).join(", ")}`,
    "",
    "Promise-gate reviewers (risk-routed; disposable-only gates get walkthrough only):",
    list(config.routing.promiseGateReviewers.map(resolve)),
    "",
    "Final closeout panel:",
    `Models: ${config.routing.finalCloseoutModels.map(resolve).join(", ")}`,
    `Personas: ${config.routing.finalCloseoutPersonas.join(", ")}`,
    "",
    "Closure rules:",
    "1. A promise is true only when its walkthrough holds and required reviewers are no-blocking.",
    "2. Review-cycle budget: 3 per gate, hard, however panels are named.",
    "3. Final closeout: end-to-end walkthrough, aligned intent audit, no PASS_WITH_NOTES.",
    "4. Report plain-English first: what happened, what was decided, what it means for the product.",
    "5. Append the retro to RUNS.md before declaring the run complete.",
    "6. Do not stop for routine progress updates."
  ].join("\n");
}

function buildMergeTrainPrompt(config, resolve) {
  return [
    `You are the orchestrator for ${config.workflow.name}.`,
    "",
    "Execution constraints:",
    `1. Continuous mode default: ${config.workflow.continuousModeDefault}.`,
    `2. Pause only on hard blocks: ${config.workflow.pauseOnlyOnHardBlocks}.`,
    `3. State file: ${config.statePolicy.stateFile}.`,
    "4. Re-read state and the execplan tail at every batch boundary.",
    "",
    "Models:",
    `- Child audit: ${resolve(config.models.childAuditModel)}`,
    `- Child remediation: ${resolve(config.models.childRemediationModel)}`,
    `- Child verifier: ${resolve(config.models.childVerifierModel)}`,
    `- Parent checkpoints: ${config.models.parentCheckpointModels.map(resolve).join(", ")}`,
    `- Final reviewers: ${config.models.finalReviewerModels.map(resolve).join(", ")}`,
    "",
    "Parent reviewer personas:",
    list(config.parentReviewerPersonas),
    "",
    "Checkpoint policy:",
    `1. Every ${config.checkpointPolicy.everyNChildMerges} child merges.`,
    `2. High-risk triggers: ${config.checkpointPolicy.highRiskTriggers.join(", ")}.`,
    "",
    "Closure rules:",
    "1. No child merges without fresh no-blocking verification.",
    "2. High-risk children require a parent checkpoint after merge.",
    "3. Parent is not ready until ledger, risk register, checks, predicates, and final reviewers are current.",
    "4. Final closeout does not accept PASS_WITH_NOTES unless explicitly configured.",
    "5. Do not stop for routine progress updates."
  ].join("\n");
}

const absoluteConfigPath = path.resolve(configPath);
const config = readJson(absoluteConfigPath);
const resolve = makeResolver(config.modelAliases || {});
const isMergeTrain = config.workflow.type === "merge-train" || config.workflow.name.toLowerCase().includes("merge train");
const prompt = isMergeTrain ? buildMergeTrainPrompt(config, resolve) : buildLongflowPrompt(config, resolve);

if (outputPath) {
  const absoluteOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(absoluteOutputPath, `${prompt}\n`, "utf8");
  console.log(`KICKOFF PROMPT WRITTEN: ${absoluteOutputPath}`);
} else {
  console.log(prompt);
}
