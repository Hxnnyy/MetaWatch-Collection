import fs from "node:fs";
import path from "node:path";
import { homeDir, installedAgentRoot, reviewerPersonas, staleAgentNames, workflowAgentRoot } from "./workflow-paths.mjs";

const claudeAgentRoot = path.join(homeDir, ".claude", "agents");

fs.mkdirSync(claudeAgentRoot, { recursive: true });
fs.mkdirSync(installedAgentRoot, { recursive: true });

for (const persona of reviewerPersonas) {
  const source = path.join(workflowAgentRoot, `${persona}.md`);
  const installed = path.join(installedAgentRoot, `${persona}.md`);
  const target = path.join(claudeAgentRoot, `${persona}.md`);
  if (!fs.existsSync(source)) {
    console.error(`AGENT EXPORT FAILED: missing ${source}`);
    process.exit(1);
  }
  fs.rmSync(installed, { recursive: true, force: true });
  fs.symlinkSync(source, installed, "file");
  fs.rmSync(target, { recursive: true, force: true });
  fs.symlinkSync(source, target, "file");
}

for (const stale of staleAgentNames) {
  fs.rmSync(path.join(claudeAgentRoot, `${stale}.md`), { force: true });
  fs.rmSync(path.join(installedAgentRoot, `${stale}.md`), { force: true });
}

console.log(`AGENTS EXPORTED: ${claudeAgentRoot}`);
