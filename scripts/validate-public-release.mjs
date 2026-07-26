import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./workflow-paths.mjs";

const ignored = new Set([".git", "node_modules"]);
const textExtensions = new Set([".json", ".md", ".mjs", ".js", ".yaml", ".yml", ".ps1", ".sh"]);
const hazards = [
  ["Windows user path", /[A-Za-z]:\\Users\\[^\\\s]+/],
  ["Unix user path", /\/(?:Users|home)\/[^/\s]+/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["token assignment", /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["'][^"'<{][^"']{7,}["']/i],
  ["GitHub token", /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/],
  ["OpenAI token", /\bsk-[A-Za-z0-9_-]{20,}\b/]
];
const allowPlatformExamples = new Set([
  "README.md",
  "scripts/validate-public-release.mjs",
  "scripts/README.md",
  "workflows/longflow/docs/HARNESS_SETUP.md",
  "workflows/longflow/docs/NON_TECHNICAL_OPERATOR_GUIDE.md"
]);
const failures = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (textExtensions.has(path.extname(entry.name))) inspect(fullPath);
  }
}

function inspect(filePath) {
  const relative = path.relative(repoRoot, filePath).replaceAll("\\", "/");
  const text = fs.readFileSync(filePath, "utf8");
  for (const [label, pattern] of hazards) {
    if (pattern.test(text)) failures.push(`${relative}: ${label}`);
  }
  if (!allowPlatformExamples.has(relative) && /\b(?:PowerShell users?|Windows users?|requires PowerShell|Windows only)\b/i.test(text)) {
    failures.push(`${relative}: platform-only public assumption`);
  }
}

const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "registry.json"), "utf8"));
if (registry.name !== "MetaWatch" || registry.schemaVersion !== 1) failures.push("registry.json: invalid public identity or schema");
for (const primitive of registry.primitives ?? []) {
  for (const field of ["id", "kind", "path", "readme"]) {
    if (!primitive[field]) failures.push(`registry.json: ${primitive.id ?? "<unknown>"} missing ${field}`);
  }
  if (primitive.path && !fs.existsSync(path.join(repoRoot, primitive.path))) failures.push(`registry.json: missing ${primitive.path}`);
  if (primitive.readme && !fs.existsSync(path.join(repoRoot, primitive.readme))) failures.push(`registry.json: missing ${primitive.readme}`);
}

walk(repoRoot);

if (failures.length) {
  console.error("PUBLIC RELEASE VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`PUBLIC RELEASE VALID: ${registry.primitives.length} registered primitives`);
