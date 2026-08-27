// Generates workflows/longflow/skills/_shared/ from the canonical shared/ tree.
// shared/ is the single authoring source; the flattened _shared/ copy ships with
// exported skills. Run after editing shared/: `npm run sync:shared`.
// `--check` verifies the generated tree matches without writing (used by npm test).

import fs from "node:fs";
import path from "node:path";
import { repoPath } from "./workflow-paths.mjs";

const checkMode = process.argv.includes("--check");
const targetRoot = repoPath("workflows/longflow/skills/_shared");

const sourceDirs = ["shared/orchestration", "shared/review", "shared/verification"];

// The poteto bundle links two shared contracts as `../_shared/`; a bundle-root
// install has no Longflow tree beside it, so those files are generated into the
// bundle too (same authoring source, same drift check).
const potetoSharedRoot = repoPath("third_party/poteto/_shared");
const potetoSharedSources = ["shared/review/epistemics.md", "shared/review/prose-tells.md"];

// Flattening moves every doc into one directory, so cross-category relative
// references collapse to siblings and template references keep their subdir.
function rewriteReferences(contents) {
  return contents
    .replaceAll("../orchestration/", "")
    .replaceAll("../review/", "")
    .replaceAll("../verification/", "")
    .replaceAll("../templates/", "templates/")
    .replaceAll("../hooks/", "hooks/");
}

function collectFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else out.push(full);
  }
  return out;
}

const generated = new Map(); // target relative path -> contents

for (const sourceDir of sourceDirs) {
  const abs = repoPath(sourceDir);
  for (const file of fs.readdirSync(abs)) {
    const full = path.join(abs, file);
    if (!fs.statSync(full).isFile()) continue;
    if (generated.has(file)) {
      console.error(`SYNC FAILED: name collision across shared/ categories: ${file}`);
      process.exit(1);
    }
    generated.set(file, rewriteReferences(fs.readFileSync(full, "utf8")));
  }
}

for (const subdir of ["shared/templates", "shared/hooks"]) {
  const abs = repoPath(subdir);
  const base = path.basename(subdir);
  for (const file of collectFiles(abs)) {
    const rel = path.join(base, path.relative(abs, file));
    generated.set(rel, rewriteReferences(fs.readFileSync(file, "utf8")));
  }
}

const potetoGenerated = new Map();
for (const sourceFile of potetoSharedSources) {
  potetoGenerated.set(path.basename(sourceFile), rewriteReferences(fs.readFileSync(repoPath(sourceFile), "utf8")));
}

function checkTree(root, files, failures) {
  const seen = new Set();
  for (const [rel, contents] of files) {
    const target = path.join(root, rel);
    seen.add(path.normalize(target));
    if (!fs.existsSync(target)) failures.push(`missing: ${rel}`);
    else if (fs.readFileSync(target, "utf8") !== contents) failures.push(`stale: ${rel}`);
  }
  if (!fs.existsSync(root)) return;
  for (const file of collectFiles(root)) {
    if (!seen.has(path.normalize(file))) failures.push(`orphan (not in shared/): ${path.relative(root, file)}`);
  }
}

function writeTree(root, files) {
  fs.rmSync(root, { recursive: true, force: true });
  for (const [rel, contents] of files) {
    const target = path.join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, "utf8");
  }
}

if (checkMode) {
  const failures = [];
  checkTree(targetRoot, generated, failures);
  checkTree(potetoSharedRoot, potetoGenerated, failures);
  if (failures.length > 0) {
    console.error("SHARED TREE OUT OF SYNC (run `npm run sync:shared`):");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log("SHARED TREE IN SYNC");
} else {
  writeTree(targetRoot, generated);
  writeTree(potetoSharedRoot, potetoGenerated);
  console.log(`SHARED TREE SYNCED: ${targetRoot} (${generated.size} files) + ${potetoSharedRoot} (${potetoGenerated.size} files)`);
}
