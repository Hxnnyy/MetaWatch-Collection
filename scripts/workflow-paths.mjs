import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const homeDir = os.homedir();

export const skillGroupName = "metawatch";
export const installedSkillRoot = path.join(homeDir, ".agents", "skills", skillGroupName);
export const canonicalAgentRoot = path.join(homeDir, ".agents", "agents");

export const publicSkills = [
  {
    name: "longflow-orchestrator",
    source: "workflows/longflow/skills/longflow-orchestrator",
    workflow: "longflow"
  },
  {
    name: "council",
    source: "workflows/longflow/skills/council",
    workflow: "longflow"
  },
  {
    name: "write-a-prd",
    source: "workflows/longflow/skills/write-a-prd",
    workflow: "longflow"
  },
  {
    name: "prd-to-issues",
    source: "workflows/longflow/skills/prd-to-issues",
    workflow: "longflow"
  },
  {
    name: "issues-execution",
    source: "workflows/longflow/skills/issues-execution",
    workflow: "longflow"
  },
  {
    name: "codebase-quality-sweep",
    source: "workflows/longflow/skills/codebase-quality-sweep",
    workflow: "longflow"
  },
  {
    name: "merge-train",
    source: "workflows/merge-train/skills/merge-train",
    workflow: "merge-train"
  },
  {
    name: "code-economy",
    source: "skills/code-economy",
    workflow: "standalone"
  },
  {
    name: "frontend-design",
    source: "skills/frontend-design",
    workflow: "standalone"
  },
  {
    name: "codebase-design",
    source: "third_party/matt-pocock/codebase-design",
    workflow: "standalone"
  },
  {
    name: "domain-modeling",
    source: "third_party/matt-pocock/domain-modeling",
    workflow: "standalone"
  },
  {
    name: "writing-great-skills",
    source: "third_party/matt-pocock/writing-great-skills",
    workflow: "standalone"
  },
  {
    name: "improve-codebase-architecture",
    source: "third_party/matt-pocock/improve-codebase-architecture",
    workflow: "standalone"
  },
  {
    name: "tdd",
    source: "third_party/matt-pocock/tdd",
    workflow: "standalone"
  },
  {
    name: "wayfinder",
    source: "third_party/matt-pocock/wayfinder",
    workflow: "standalone"
  },
  {
    name: "grilling",
    source: "third_party/matt-pocock/grilling",
    workflow: "standalone"
  },
  {
    name: "frontend-design-plus",
    source: "third_party/emil-kowalski/frontend-design-plus",
    workflow: "standalone"
  },
  {
    name: "marketing",
    source: "third_party/corey-haines/marketing",
    workflow: "standalone"
  },
  {
    name: "context7-cli",
    source: "third_party/context7/context7-cli",
    workflow: "standalone"
  }
];

export const staleSkillNames = [
  "stabilisation",
  "merge-train-orchestrator",
  "child-pr-audit-remediate",
  "parent-integration-checkpoint",
  "final-parent-closeout",
  "merge-train-stabilisation"
];

export const reviewerPersonas = [
  "implementation-reviewer",
  "security-reviewer",
  "product-reviewer",
  "operations-reviewer",
  "intent-auditor"
];

// Retired 2026-08 consolidation: 8 narrow personas -> 4 lenses + intent-auditor.
export const staleAgentNames = [
  "implementation-quality-reviewer",
  "documentation-reviewer",
  "performance-reviewer",
  "product-design-reviewer",
  "architecture-coherence-reviewer",
  "runtime-integration-reviewer",
  "regression-test-reviewer"
];

export function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function normalizeForCompare(value) {
  return path.resolve(value).toLowerCase();
}
