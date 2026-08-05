import fs from "node:fs";
import path from "node:path";
import { canonicalAgentRoot, homeDir, reviewerPersonas, staleAgentNames } from "./workflow-paths.mjs";

const claudeAgentRoot = path.join(homeDir, ".claude", "agents");

fs.mkdirSync(claudeAgentRoot, { recursive: true });

for (const persona of reviewerPersonas) {
  const source = path.join(canonicalAgentRoot, `${persona}.md`);
  const target = path.join(claudeAgentRoot, `${persona}.md`);
  if (!fs.existsSync(source)) {
    console.error(`AGENT EXPORT FAILED: missing ${source}`);
    process.exit(1);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.symlinkSync(source, target, "file");
}

for (const stale of staleAgentNames) {
  fs.rmSync(path.join(claudeAgentRoot, `${stale}.md`), { force: true });
  fs.rmSync(path.join(canonicalAgentRoot, `${stale}.md`), { force: true });
}

console.log(`AGENTS EXPORTED: ${claudeAgentRoot}`);
