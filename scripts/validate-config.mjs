import fs from "node:fs";
import path from "node:path";

const configPath = process.argv[2] || "./workflows/longflow/longflow.config.json";

function fail(message) {
  console.error(`CONFIG INVALID: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Cannot read or parse JSON at ${filePath}: ${error.message}`);
  }
}

function getAt(obj, keyPath) {
  return keyPath.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function requireString(config, keyPath) {
  const value = getAt(config, keyPath);
  if (typeof value !== "string" || value.trim() === "") fail(`Expected non-empty string at ${keyPath}`);
}

function requireBoolean(config, keyPath) {
  if (typeof getAt(config, keyPath) !== "boolean") fail(`Expected boolean at ${keyPath}`);
}

function requireArray(config, keyPath) {
  const value = getAt(config, keyPath);
  if (!Array.isArray(value) || value.length === 0) fail(`Expected non-empty array at ${keyPath}`);
}

function requireInteger(config, keyPath, min) {
  const value = getAt(config, keyPath);
  if (!Number.isInteger(value) || value < min) fail(`Expected integer >= ${min} at ${keyPath}`);
}

function aliasNames(config) {
  const aliases = config.modelAliases;
  if (!aliases || typeof aliases !== "object" || Array.isArray(aliases)) {
    fail("modelAliases must be an object mapping alias name to physical model name");
  }
  const names = Object.keys(aliases);
  if (names.length === 0) fail("modelAliases must contain at least one entry");
  for (const [aliasName, physicalName] of Object.entries(aliases)) {
    if (typeof physicalName !== "string" || physicalName.trim() === "") {
      fail(`modelAliases.${aliasName} must resolve to a non-empty string model name`);
    }
  }
  return names;
}

function requireAlias(config, names, keyPath) {
  const value = getAt(config, keyPath);
  if (typeof value !== "string" || value.trim() === "") fail(`Expected alias string at ${keyPath}`);
  if (!names.includes(value)) fail(`${keyPath} references unknown alias "${value}". Add it to modelAliases.`);
}

function requireAliasArray(config, names, keyPath) {
  const value = getAt(config, keyPath);
  if (!Array.isArray(value) || value.length === 0) fail(`Expected non-empty array at ${keyPath}`);
  value.forEach((alias, index) => {
    if (!names.includes(alias)) fail(`${keyPath}[${index}] references unknown alias "${alias}". Add it to modelAliases.`);
  });
}

function aliasLab(alias) {
  const match = alias.match(/^frontier-([^-]+)/);
  return match ? match[1] : alias;
}

function validateCommon(config) {
  requireString(config, "version");
  requireString(config, "workflow.name");
  requireString(config, "harness.orchestrator");
  requireString(config, "harness.subagentDispatchStyle");
  requireBoolean(config, "harness.supportsParallelSubagents");
  return aliasNames(config);
}

function validateLongflow(config, names) {
  const tierDefault = getAt(config, "tier.default");
  if (tierDefault !== "propose") {
    fail('tier.default must be exactly "propose"');
  }
  const blockAt = getAt(config, "tier.blockForApprovalAt");
  if (!Array.isArray(blockAt) || blockAt.length !== 1 || blockAt[0] !== "T3") {
    fail('tier.blockForApprovalAt must be exactly ["T3"]');
  }
  if (getAt(config, "tier.policyFixture") !== "shared/orchestration/tier-policy.json") {
    fail("tier.policyFixture must name shared/orchestration/tier-policy.json");
  }
  if (!fs.existsSync(path.resolve(getAt(config, "tier.policyFixture")))) {
    fail(`tier.policyFixture does not exist: ${getAt(config, "tier.policyFixture")}`);
  }
  for (const obsolete of ["autonomyEnvelope", "closurePolicy"]) {
    if (obsolete in config) fail(`${obsolete} is documentation, not executable config; remove it`);
  }
  for (const obsolete of ["continuousModeDefault", "pauseOnlyOnHardBlocks"]) {
    if (obsolete in config.workflow) fail(`workflow.${obsolete} is canonical continuous-mode policy, not Longflow config`);
  }

  requireAlias(config, names, "models.councilChair.alias");
  requireString(config, "models.councilChair.reasoning");
  requireAliasArray(config, names, "models.council");
  const chair = getAt(config, "models.councilChair.alias");
  const members = getAt(config, "models.council");
  if (members.includes(chair)) {
    fail("models.councilChair.alias must not also be a council member");
  }
  if (members.some((member) => aliasLab(member) === aliasLab(chair))) {
    fail("models.councilChair.alias must be from a lab not represented among council members");
  }

  requireAlias(config, names, "routing.intentAuditor");
  requireAlias(config, names, "routing.leadByIssueType.frontend");
  requireAlias(config, names, "routing.leadByIssueType.backend");
  requireAlias(config, names, "routing.leadByIssueType.security");
  requireAlias(config, names, "routing.leadByIssueType.docs");
  requireAliasArray(config, names, "routing.reviewersByIssueType.frontend");
  requireAliasArray(config, names, "routing.reviewersByIssueType.backend");
  requireAliasArray(config, names, "routing.reviewersByIssueType.security");
  requireAliasArray(config, names, "routing.reviewersByIssueType.docs");
  requireAliasArray(config, names, "routing.promiseGateReviewers");
  requireAliasArray(config, names, "routing.finalCloseoutModels");
  requireArray(config, "routing.finalCloseoutPersonas");

  requireArray(config, "adjudication.providers");
  requireString(config, "adjudication.fallback");

  for (const [keyPath, expected] of [
    ["council.maxRounds", 1],
    ["council.t3MaxRounds", 2],
    ["guardrails.maxImplementerRetryPerIssue", 3],
    ["guardrails.reviewCycleBudgetPerGate", 3]
  ]) {
    if (getAt(config, keyPath) !== expected) fail(`${keyPath} must be exactly ${expected}`);
  }
  requireBoolean(config, "council.severityDowngradeRequiresChairSignoff");

  requireBoolean(config, "guardrails.requireFreshBranch");
  requireBoolean(config, "guardrails.requireFreshWorktree");
  requireArray(config, "guardrails.protectedEnvironment");
  requireBoolean(config, "guardrails.orchestratorDelegationDefault");
}

function validateMergeTrain(config, names) {
  requireString(config, "workflow.type");
  requireBoolean(config, "workflow.continuousModeDefault");
  requireBoolean(config, "workflow.pauseOnlyOnHardBlocks");
  for (const key of [
    "models.childAuditModel",
    "models.childRemediationModel",
    "models.childVerifierModel"
  ]) {
    requireAlias(config, names, key);
  }
  requireAliasArray(config, names, "models.parentCheckpointModels");
  requireAliasArray(config, names, "models.finalReviewerModels");
  requireArray(config, "parentReviewerPersonas");
  requireInteger(config, "checkpointPolicy.everyNChildMerges", 1);
  requireArray(config, "checkpointPolicy.highRiskTriggers");
  requireInteger(config, "retryCaps.childAuditRemediationCycles", 1);
  requireInteger(config, "retryCaps.parentCheckpointRemediationCycles", 1);
  requireInteger(config, "retryCaps.finalCloseoutCycles", 1);
  requireBoolean(config, "hardBlockPolicy.criticalRiskRequiresHumanSignoff");
  requireBoolean(config, "hardBlockPolicy.irreversibleActionsRequireHumanSignoff");
  requireBoolean(config, "hardBlockPolicy.allowPassWithNotesAtFinalCloseout");
  requireString(config, "statePolicy.stateFile");
  requireBoolean(config, "statePolicy.rereadAtBatchBoundaries");
  requireString(config, "branchConventions.parentBranchPattern");
  requireString(config, "branchConventions.childBranchPattern");
  requireString(config, "branchConventions.mergePolicy");
  requireBoolean(config, "branchConventions.allowFeatureBranchPushes");
  requireBoolean(config, "branchConventions.requireProtectedBranchSafety");
  requireString(config, "prConventions.parentPrLabel");
  requireString(config, "prConventions.childPrLabel");
  requireArray(config, "testCommands");
  requireArray(config, "predicateCommands");
}

const absolutePath = path.resolve(configPath);
const config = readJson(absolutePath);
const names = validateCommon(config);
const workflowName = config.workflow.name.toLowerCase();

if (workflowName.includes("merge train") || config.workflow.type === "merge-train") {
  validateMergeTrain(config, names);
} else if (workflowName.includes("longflow")) {
  validateLongflow(config, names);
} else {
  fail(`Unknown workflow type for ${config.workflow.name}`);
}

console.log(`CONFIG VALID: ${absolutePath}`);
