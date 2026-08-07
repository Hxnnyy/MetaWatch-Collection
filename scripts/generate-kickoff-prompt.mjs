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

  const canonicalKickoff = fs.readFileSync(path.resolve("shared/templates/orchestrator-kickoff.md"), "utf8").trim();
  return [
    canonicalKickoff,
    "",
    "## Resolved routing",
    `Workflow: ${config.workflow.name}. Tier default: ${tier.default || "propose"}; owner approval blocks at ${(tier.blockForApprovalAt || ["T3"]).join(", ")}.`,
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
    "Final closeout panel (T2+):",
    `Models: ${config.routing.finalCloseoutModels.map(resolve).join(", ")}`,
    `Personas: ${config.routing.finalCloseoutPersonas.join(", ")}`,
    "",
    "This section resolves routing only. The shared contracts and durable run state govern activation, gates, and closure."
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
