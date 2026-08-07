import fs from "node:fs";
import path from "node:path";
import { repoPath } from "./workflow-paths.mjs";

function addTree(files, root, prefix, transform) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const source = path.join(root, entry.name);
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      addTree(files, source, relativePath, transform);
    } else if (entry.isFile()) {
      const contents = fs.readFileSync(source, "utf8");
      files.set(relativePath, transform ? transform(source, contents) : contents);
    }
  }
}

export function rewriteSkillSource(sourcePath, contents, workflow) {
  if (workflow === "longflow" && sourcePath.endsWith("SKILL.md")) {
    return contents.replaceAll("../_shared/", "_shared/");
  }
  return contents;
}

export function expectedSkillFiles(skill) {
  const files = new Map();
  addTree(files, repoPath(skill.source), "", (source, contents) =>
    rewriteSkillSource(source, contents, skill.workflow)
  );
  if (skill.workflow === "longflow") {
    addTree(files, repoPath("workflows/longflow/skills/_shared"), "_shared");
  }
  return files;
}

export function compareInstalledSkill(installedRoot, skill) {
  const expected = expectedSkillFiles(skill);
  const actual = new Map();
  const installedSkill = path.join(installedRoot, skill.name);
  if (fs.existsSync(installedSkill)) addTree(actual, installedSkill, "");

  const failures = [];
  for (const [relativePath, contents] of expected) {
    if (!actual.has(relativePath)) {
      failures.push(`${skill.name}: missing exported file ${relativePath}`);
    } else if (actual.get(relativePath) !== contents) {
      failures.push(`${skill.name}: content drift in ${relativePath}`);
    }
  }
  for (const relativePath of actual.keys()) {
    if (!expected.has(relativePath)) failures.push(`${skill.name}: unexpected exported file ${relativePath}`);
  }
  return failures;
}
