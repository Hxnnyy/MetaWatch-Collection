import fs from "node:fs";
import path from "node:path";
import { publicSkills, repoRoot } from "./workflow-paths.mjs";

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
if (registry.name !== "MetaWatch Collection" || registry.schemaVersion !== 3) failures.push("registry.json: invalid public identity or schema");
for (const bundle of registry.bundles ?? []) {
  for (const field of ["id", "kind", "ownership", "root", "readme", "entrypoints"]) {
    if (!bundle[field]) failures.push(`registry.json: ${bundle.id ?? "<unknown>"} missing ${field}`);
  }
  if (bundle.root && !fs.existsSync(path.join(repoRoot, bundle.root))) failures.push(`registry.json: missing ${bundle.root}`);
  if (bundle.readme && !fs.existsSync(path.join(repoRoot, bundle.readme))) failures.push(`registry.json: missing ${bundle.readme}`);
  if (!Array.isArray(bundle.entrypoints) || bundle.entrypoints.length === 0) failures.push(`registry.json: ${bundle.id} needs entrypoints`);
  for (const entrypoint of bundle.entrypoints ?? []) {
    if (!fs.existsSync(path.join(repoRoot, bundle.root, entrypoint))) failures.push(`registry.json: ${bundle.id} missing entrypoint ${entrypoint}`);
  }
  if (bundle.ownership === "third-party") {
    if (!bundle.provenanceFile) {
      failures.push(`registry.json: ${bundle.id} missing provenanceFile`);
      continue;
    }
    const provenancePath = path.join(repoRoot, bundle.provenanceFile);
    if (!fs.existsSync(provenancePath)) {
      failures.push(`registry.json: missing ${bundle.provenanceFile}`);
      continue;
    }
    const provenance = JSON.parse(fs.readFileSync(provenancePath, "utf8"));
    for (const field of ["creator", "upstreamRepository", "revision", "license", "licenseFile", "installationDisposition", "assets"]) {
      if (!provenance[field]) failures.push(`${bundle.provenanceFile}: missing ${field}`);
    }
    if (!/^[0-9a-f]{40}$/.test(provenance.revision ?? "")) failures.push(`${bundle.provenanceFile}: revision must be a pinned commit`);
    const provenanceRoot = path.dirname(provenancePath);
    const licensePath = path.join(provenanceRoot, provenance.licenseFile ?? "");
    if (!fs.existsSync(licensePath)) failures.push(`${bundle.provenanceFile}: missing retained license ${provenance.licenseFile}`);
    else if (!/MIT License|The MIT License/.test(fs.readFileSync(licensePath, "utf8"))) failures.push(`${bundle.provenanceFile}: retained license is not MIT`);
    const assetNames = new Set((provenance.assets ?? []).map((asset) => asset.name));
    const assetsByName = new Map((provenance.assets ?? []).map((asset) => [asset.name, asset]));
    for (const asset of provenance.assets ?? []) {
      for (const field of ["name", "path", "upstreamPath", "designation", "modifications", "dependencies"]) {
        if (asset[field] === undefined || asset[field] === "") failures.push(`${bundle.provenanceFile}: ${asset.name ?? "<unknown>"} missing ${field}`);
      }
      if (!Array.isArray(asset.dependencies)) failures.push(`${bundle.provenanceFile}: ${asset.name} dependencies must be an array`);
      for (const dependency of asset.dependencies ?? []) {
        if (!assetNames.has(dependency) && !dependency.startsWith("external:")) failures.push(`${bundle.provenanceFile}: ${asset.name} has undeclared dependency ${dependency}`);
      }
      if (!new Set(["exact", "adapted"]).has(asset.designation)) failures.push(`${bundle.provenanceFile}: ${asset.name} designation must be exact or adapted`);
      if (asset.path && !fs.existsSync(path.join(provenanceRoot, asset.path))) failures.push(`${bundle.provenanceFile}: missing asset ${asset.path}`);
    }
    if (provenance.sourceContract) {
      const { upstreamPathsAtRevision, requiredIncludedFiles, declaredOmissions } = provenance.sourceContract;
      if (!upstreamPathsAtRevision || !requiredIncludedFiles || !Array.isArray(declaredOmissions)) failures.push(`${bundle.provenanceFile}: invalid sourceContract`);
      for (const [assetName, upstreamPath] of Object.entries(upstreamPathsAtRevision ?? {})) {
        if (assetsByName.get(assetName)?.upstreamPath !== upstreamPath) failures.push(`${bundle.provenanceFile}: ${assetName} upstream path drifted from sourceContract`);
      }
      for (const [assetName, files] of Object.entries(requiredIncludedFiles ?? {})) {
        const asset = assetsByName.get(assetName);
        if (!asset) {
          failures.push(`${bundle.provenanceFile}: required files reference unknown asset ${assetName}`);
          continue;
        }
        for (const file of files) {
          if (!fs.existsSync(path.join(provenanceRoot, asset.path, file))) failures.push(`${bundle.provenanceFile}: ${assetName} missing required upstream file ${file}`);
        }
      }
      for (const omission of declaredOmissions ?? []) {
        if (!omission.asset || !omission.path || !omission.rationale) failures.push(`${bundle.provenanceFile}: every declared omission needs asset, path, and rationale`);
      }
    }
  } else if (bundle.provenanceFile) {
    failures.push(`registry.json: MetaWatch-owned bundle ${bundle.id} must not claim third-party provenance`);
  }
}
for (const resource of registry.resources ?? []) {
  for (const field of ["id", "path", "readme"]) {
    if (!resource[field]) failures.push(`registry.json: ${resource.id ?? "<unknown>"} missing ${field}`);
  }
  if (resource.path && !fs.existsSync(path.join(repoRoot, resource.path))) failures.push(`registry.json: missing ${resource.path}`);
  if (resource.readme && !fs.existsSync(path.join(repoRoot, resource.readme))) failures.push(`registry.json: missing ${resource.readme}`);
}
const registeredEntrypoints = new Set(
  (registry.bundles ?? []).flatMap((bundle) =>
    (bundle.entrypoints ?? []).map((entrypoint) => path.posix.join(bundle.root, entrypoint))
  )
);
const exportedEntrypoints = new Set(publicSkills.map((skill) => path.posix.join(skill.source, "SKILL.md")));
for (const entrypoint of exportedEntrypoints) {
  if (!registeredEntrypoints.has(entrypoint)) failures.push(`registry.json: exported skill is not registered: ${entrypoint}`);
}
for (const entrypoint of registeredEntrypoints) {
  if (!exportedEntrypoints.has(entrypoint)) failures.push(`registry.json: registered skill is not exported: ${entrypoint}`);
}

walk(repoRoot);

if (failures.length) {
  console.error("PUBLIC RELEASE VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`PUBLIC RELEASE VALID: ${registry.bundles.length} installable bundles`);
