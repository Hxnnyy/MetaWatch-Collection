import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { publicSkills, repoRoot } from "../scripts/workflow-paths.mjs";

const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "registry.json"), "utf8"));

test("MetaWatch-owned standalone skills are self-describing", () => {
  for (const bundle of registry.bundles.filter(({ kind, ownership }) => kind === "skill" && ownership === "metawatch")) {
    assert.deepEqual(bundle.entrypoints, ["SKILL.md"], `${bundle.id} must be self-contained`);
    const readme = fs.readFileSync(path.join(repoRoot, bundle.readme), "utf8");
    for (const heading of ["**Problem:**", "**Why useful:**", "**Scope:**", "**Use:**"]) assert.ok(readme.includes(heading), `${bundle.id} README needs ${heading}`);
  }
});

test("entrypoints are installed only through complete bundles", () => {
  for (const bundle of registry.bundles) {
    assert.ok(bundle.entrypoints.length > 0, `${bundle.id} needs entrypoints`);
    for (const entrypoint of bundle.entrypoints) {
      assert.ok(fs.existsSync(path.join(repoRoot, bundle.root, entrypoint)), `${bundle.id} missing ${entrypoint}`);
    }
  }
  const install = fs.readFileSync(path.join(repoRoot, "INSTALL.md"), "utf8");
  assert.match(install, /root.*indivisible source tree/i);
  assert.match(install, /do not install a nested workflow skill by itself/i);
});

test("third-party bundles retain complete provenance and MIT notices", () => {
  for (const bundle of registry.bundles.filter(({ ownership }) => ownership === "third-party")) {
    const provenancePath = path.join(repoRoot, bundle.provenanceFile);
    const provenance = JSON.parse(fs.readFileSync(provenancePath, "utf8"));
    assert.match(provenance.revision, /^[0-9a-f]{40}$/);
    assert.ok(provenance.creator && provenance.upstreamRepository && provenance.installationDisposition);
    const license = fs.readFileSync(path.join(path.dirname(provenancePath), provenance.licenseFile), "utf8");
    assert.match(license, /MIT License|The MIT License/);
    const assetNames = new Set(provenance.assets.map(({ name }) => name));
    for (const asset of provenance.assets) {
      assert.ok(asset.upstreamPath && asset.modifications);
      assert.ok(["exact", "adapted"].includes(asset.designation));
      assert.ok(Array.isArray(asset.dependencies));
      for (const dependency of asset.dependencies) assert.ok(assetNames.has(dependency) || dependency.startsWith("external:"), `${asset.name} has undeclared dependency ${dependency}`);
      assert.ok(fs.existsSync(path.join(path.dirname(provenancePath), asset.path)));
    }
  }
});

test("registry and export index contain the same skill entrypoints", () => {
  const registered = registry.bundles.flatMap((bundle) =>
    bundle.entrypoints.map((entrypoint) => path.posix.join(bundle.root, entrypoint))
  ).sort();
  const exported = publicSkills.map((skill) => path.posix.join(skill.source, "SKILL.md")).sort();
  assert.deepEqual(registered, exported);
});

test("catalog matches the exact curated skill set", () => {
  assert.deepEqual(publicSkills.map(({ name }) => name).sort(), [
    "code-economy", "codebase-design", "codebase-quality-sweep", "context7-cli", "council",
    "domain-modeling", "frontend-design", "frontend-design-plus", "grilling", "improve-codebase-architecture",
    "issues-execution", "longflow-orchestrator", "marketing", "merge-train", "prd-to-issues", "tdd",
    "wayfinder", "write-a-prd", "writing-great-skills"
  ]);
  const marketing = JSON.parse(fs.readFileSync(path.join(repoRoot, "third_party/corey-haines/provenance.json"), "utf8"));
  assert.deepEqual(marketing.assets.filter(({ name }) => name !== "marketing-router").map(({ name }) => name).sort(), [
    "ai-seo", "cold-email", "copywriting", "pricing-strategy", "product-marketing-context", "programmatic-seo"
  ]);
});

test("Context7 prerequisite and skill-authoring meta-skill are discoverable", () => {
  const context7 = fs.readFileSync(path.join(repoRoot, "third_party/context7/README.md"), "utf8");
  assert.match(context7, /does not install the external CLI/i);
  assert.match(context7, /npx ctx7@latest/);
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /writing-great-skills.*meta-skill/i);
});

test("public identity and installation contract are discoverable", () => {
  assert.equal(registry.name, "MetaWatch Collection");
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /INSTALL\.md/);
  assert.match(readme, /registry\.json/);
  const install = fs.readFileSync(path.join(repoRoot, "INSTALL.md"), "utf8");
  assert.match(install, /Merge rather than overwrite/i);
  assert.match(install, /do not invent an installation location/i);
});
