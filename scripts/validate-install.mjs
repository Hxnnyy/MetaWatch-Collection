import fs from "node:fs";
import path from "node:path";
import { homeDir, installedSkillRoot, publicSkills, staleSkillNames } from "./workflow-paths.mjs";
import { compareInstalledSkill } from "./skill-export-content.mjs";

const installedRoot = process.argv[2] ? path.resolve(process.argv[2]) : installedSkillRoot;
const failures = [];

function fail(message) {
  failures.push(message);
}

function realpathIfExists(targetPath) {
  try {
    return fs.realpathSync.native(targetPath);
  } catch {
    return "";
  }
}

for (const skill of publicSkills) {
  const skillDir = path.join(installedRoot, skill.name);
  if (!fs.existsSync(path.join(skillDir, "SKILL.md"))) fail(`installed skill missing: ${skillDir}`);
  if (skill.workflow === "longflow" && !fs.existsSync(path.join(skillDir, "_shared", "reviewer-protocol.md"))) {
    fail(`installed longflow skill missing generated _shared bundle: ${skill.name}`);
  }
  for (const mismatch of compareInstalledSkill(installedRoot, skill)) fail(mismatch);
}

for (const stale of staleSkillNames) {
  if (fs.existsSync(path.join(installedRoot, stale, "SKILL.md"))) {
    fail(`stale installed skill still discoverable: ${stale}`);
  }
}

for (const harness of [".codex", ".claude"]) {
  const harnessRoot = path.join(homeDir, harness, "skills");
  for (const skill of publicSkills) {
    const linkPath = path.join(harnessRoot, skill.name);
    const expected = path.join(installedRoot, skill.name);
    const actual = realpathIfExists(linkPath);
    const expectedReal = realpathIfExists(expected);
    if (!actual || !expectedReal || actual.toLowerCase() !== expectedReal.toLowerCase()) {
      fail(`${harness} link for ${skill.name} points to ${actual || "<missing>"}; expected ${expectedReal || expected}`);
    }
  }
}

if (failures.length) {
  console.error("INSTALL VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("INSTALL VALID");
