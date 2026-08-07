import fs from "node:fs";
import path from "node:path";
import {
  homeDir,
  installedSkillRoot,
  normalizeForCompare,
  publicSkills,
  repoPath,
  repoRoot,
  staleSkillNames
} from "./workflow-paths.mjs";
import { rewriteSkillSource } from "./skill-export-content.mjs";

const installedRoot = process.argv[2] ? path.resolve(process.argv[2]) : installedSkillRoot;
const safeRoot = normalizeForCompare(path.join(homeDir, ".agents", "skills"));

function fail(message) {
  console.error(`EXPORT FAILED: ${message}`);
  process.exit(1);
}

function assertInsideSkillsRoot(targetPath) {
  const resolved = normalizeForCompare(targetPath);
  if (resolved !== safeRoot && !resolved.startsWith(`${safeRoot}${path.sep}`)) {
    fail(`Refusing to write outside ~/.agents/skills: ${targetPath}`);
  }
}

function rmInside(targetPath) {
  assertInsideSkillsRoot(targetPath);
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyDir(source, target, transformFile) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to, transformFile);
    } else if (entry.isFile()) {
      let contents = fs.readFileSync(from, "utf8");
      if (transformFile) contents = transformFile(from, contents);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, contents, "utf8");
    }
  }
}

function createHarnessLink(harnessRoot, skillName) {
  const linkPath = path.join(harnessRoot, skillName);
  const targetPath = path.join(installedRoot, skillName);
  fs.mkdirSync(harnessRoot, { recursive: true });
  fs.rmSync(linkPath, { recursive: true, force: true });
  fs.symlinkSync(targetPath, linkPath, "junction");
}

function writeGroupReadme() {
  const body = [
    "# MetaWatch",
    "",
    "Generated installed skill group. Canonical source lives in:",
    "",
    `- ${repoRoot}`,
    "",
    "Run `npm run export:skills` from that repo to refresh this folder.",
    "",
    "Public skills:",
    ...publicSkills.map((skill) => `- \`${skill.name}\``),
    ""
  ].join("\n");
  fs.writeFileSync(path.join(installedRoot, "README.md"), body, "utf8");
}

fs.mkdirSync(installedRoot, { recursive: true });
assertInsideSkillsRoot(installedRoot);

for (const skill of publicSkills) {
  const source = repoPath(skill.source);
  const target = path.join(installedRoot, skill.name);
  if (!fs.existsSync(path.join(source, "SKILL.md"))) {
    fail(`Missing SKILL.md for ${skill.name} at ${source}`);
  }
  rmInside(target);
  copyDir(source, target, (from, contents) => rewriteSkillSource(from, contents, skill.workflow));

  if (skill.workflow === "longflow") {
    copyDir(repoPath("workflows/longflow/skills/_shared"), path.join(target, "_shared"));
  }
}

for (const stale of staleSkillNames) {
  rmInside(path.join(installedRoot, stale));
}

rmInside(path.join(installedRoot, "_shared"));
copyDir(repoPath("workflows/longflow/skills/_shared"), path.join(installedRoot, "_shared"));
writeGroupReadme();

for (const harness of [".codex", ".claude"]) {
  const harnessRoot = path.join(homeDir, harness, "skills");
  for (const skill of publicSkills) createHarnessLink(harnessRoot, skill.name);
  for (const stale of staleSkillNames) {
    fs.rmSync(path.join(harnessRoot, stale), { recursive: true, force: true });
  }
}

console.log(`SKILLS EXPORTED: ${installedRoot}`);
