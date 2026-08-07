import fs from "node:fs";
import path from "node:path";
import { homeDir, installedAgentRoot, repoPath, reviewerPersonas, workflowAgentRoot } from "./workflow-paths.mjs";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(repoPath(relativePath), "utf8"));
}

function frontmatterName(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";
  const name = match[1].match(/^name:\s*(.+)$/m);
  return name ? name[1].trim() : "";
}

for (const persona of reviewerPersonas) {
  const filePath = path.join(workflowAgentRoot, `${persona}.md`);
  if (!fs.existsSync(filePath)) {
    fail(`missing repository reviewer persona: ${filePath}`);
    continue;
  }
  const text = fs.readFileSync(filePath, "utf8");
  const name = frontmatterName(text);
  if (name !== persona) fail(`${persona}: frontmatter name is ${name || "<missing>"}`);
  for (const token of ['"verdict"', '"blocking_count"', '"findings"', '"recommended_next_action"']) {
    if (!text.includes(token)) fail(`${persona}: output schema missing ${token}`);
  }
}

for (const persona of reviewerPersonas) {
  const source = path.join(workflowAgentRoot, `${persona}.md`);
  const installedPath = path.join(installedAgentRoot, `${persona}.md`);
  const claudePath = path.join(homeDir, ".claude", "agents", `${persona}.md`);
  try {
    const sourceReal = fs.realpathSync.native(source);
    const installedReal = fs.realpathSync.native(installedPath);
    const claudeReal = fs.realpathSync.native(claudePath);
    if (sourceReal.toLowerCase() !== installedReal.toLowerCase()) {
      fail(`Installed agent link for ${persona} points to ${installedReal}, expected ${sourceReal}`);
    }
    if (sourceReal.toLowerCase() !== claudeReal.toLowerCase()) {
      fail(`Claude agent link for ${persona} points to ${claudeReal}, expected ${sourceReal}`);
    }
  } catch {
    fail(`Agent export missing for ${persona}`);
  }
}

const personaDoc = fs.readFileSync(repoPath("shared/review/reviewer-personas.md"), "utf8");
for (const persona of reviewerPersonas) {
  if (!personaDoc.includes(`\`${persona}\``)) fail(`shared/review/reviewer-personas.md omits ${persona}`);
}

const longflow = readJson("workflows/longflow/longflow.config.example.json");
const mergeTrain = readJson("workflows/merge-train/merge-train.config.example.json");
const known = new Set(reviewerPersonas);

for (const persona of longflow.routing.finalCloseoutPersonas || []) {
  if (!known.has(persona)) fail(`longflow finalCloseoutPersonas references unknown persona ${persona}`);
}
for (const personas of Object.values(longflow.routing.personasByPrdType || {})) {
  for (const persona of personas) {
    if (!known.has(persona)) fail(`longflow personasByPrdType references unknown persona ${persona}`);
  }
}
for (const persona of mergeTrain.parentReviewerPersonas || []) {
  if (!known.has(persona)) fail(`merge-train parentReviewerPersonas references unknown persona ${persona}`);
}

if (failures.length) {
  console.error("AGENT VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("AGENTS VALID");
