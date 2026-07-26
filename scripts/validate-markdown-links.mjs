import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "outputs"]);
const failures = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith(".md")) {
      validateFile(path.join(dir, entry.name));
    }
  }
}

function stripAnchor(link) {
  const index = link.indexOf("#");
  return index >= 0 ? link.slice(0, index) : link;
}

function validateFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/```[\s\S]*?```/g, "");
  const regex = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of text.matchAll(regex)) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("http:") || raw.startsWith("https:") || raw.startsWith("mailto:")) continue;
    const withoutAnchor = stripAnchor(raw);
    if (!withoutAnchor) continue;
    const target = path.resolve(path.dirname(filePath), withoutAnchor);
    if (!fs.existsSync(target)) {
      failures.push(`${path.relative(root, filePath)} -> ${raw}`);
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error("MARKDOWN LINK VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("MARKDOWN LINKS VALID");
