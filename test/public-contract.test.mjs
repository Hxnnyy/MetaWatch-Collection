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

test("Corey Haines source contract pins paths and includes reviewed AI SEO references", () => {
  const provenancePath = path.join(repoRoot, "third_party/corey-haines/provenance.json");
  const provenance = JSON.parse(fs.readFileSync(provenancePath, "utf8"));
  assert.equal(provenance.revision, "c21a984a56da10fb6085e6334f6f60929220a4da");
  assert.deepEqual(provenance.sourceContract.upstreamPathsAtRevision, {
    "ai-seo": "skills/ai-seo",
    "cold-email": "skills/cold-email",
    "copywriting": "skills/copywriting",
    "pricing-strategy": "skills/pricing",
    "product-marketing-context": "skills/product-marketing",
    "programmatic-seo": "skills/programmatic-seo"
  });
  assert.deepEqual(provenance.sourceContract.requiredIncludedFiles["ai-seo"], [
    "references/citations-vs-recommendations.md",
    "references/content-types.md",
    "references/okf.md"
  ]);
  assert.deepEqual(provenance.sourceContract.declaredOmissions, []);
  const aiSeo = provenance.assets.find(({ name }) => name === "ai-seo");
  for (const file of provenance.sourceContract.requiredIncludedFiles["ai-seo"]) {
    assert.ok(fs.existsSync(path.join(path.dirname(provenancePath), aiSeo.path, file)), file);
  }
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

test("pragmatic-longflow contracts are present and coherent", () => {
  const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");

  // New shared contracts exist with their load-bearing sections.
  assert.match(read("shared/orchestration/intent-contract.md"), /intent contract > PRD > issues > code/);
  const calibration = read("shared/orchestration/process-calibration.md");
  for (const tier of ["T0 — just build", "T1 — lite", "T2 — standard", "T3 — fortress"]) assert.ok(calibration.includes(tier), tier);
  for (const rigor of ["production-transferable", "dogfood-disposable", "spike"]) assert.ok(calibration.includes(rigor), rigor);
  assert.match(calibration, /err toward under-engineering/i);
  assert.match(read("shared/orchestration/promise-gates.md"), /Waves schedule\. Promises gate\./);
  const audit = read("shared/review/intent-audit.md");
  assert.match(audit, /impressive machinery around promises that are still hollow/);
  assert.match(audit, /binding/i);
  assert.match(read("shared/verification/walkthrough-verification.md"), /cannot walk/);

  // Course-correction symmetry.
  const ccp = JSON.parse(read("shared/templates/COURSE_CORRECTION_PROPOSAL.json"));
  assert.match(ccp.recommended_action, /descope/);
  assert.match(ccp.recommended_action, /de_escalate/);
  assert.ok("serves_promise" in ccp);

  // Heartbeat machinery is fully retired.
  for (const gone of [
    "shared/orchestration/heartbeat-protocol.md",
    "shared/templates/HEARTBEAT.md",
    "shared/templates/CONTINUOUS_DIRECTIVE.md",
    "scripts/heartbeat-watch.mjs"
  ]) assert.ok(!fs.existsSync(path.join(repoRoot, gone)), `${gone} should be deleted`);

  // STATE template carries the directive and promise structure.
  const state = JSON.parse(read("shared/templates/STATE.json"));
  assert.ok(state.directive && state.directive.length > 50);
  assert.ok(Array.isArray(state.promises));
  assert.equal(state.intent_authority, "tasks/INTENT.md");
});

test("persona roster is consistent everywhere it is named", async () => {
  const { reviewerPersonas } = await import("../scripts/workflow-paths.mjs");
  assert.deepEqual([...reviewerPersonas].sort(), [
    "implementation-reviewer", "intent-auditor", "operations-reviewer", "product-reviewer", "security-reviewer"
  ]);
  const personasDoc = fs.readFileSync(path.join(repoRoot, "shared/review/reviewer-personas.md"), "utf8");
  for (const persona of reviewerPersonas) assert.ok(personasDoc.includes(`\`${persona}\``), `${persona} missing from reviewer-personas.md`);

  const longflow = JSON.parse(fs.readFileSync(path.join(repoRoot, "workflows/longflow/longflow.config.example.json"), "utf8"));
  for (const persona of longflow.routing.finalCloseoutPersonas) {
    assert.ok(reviewerPersonas.includes(persona), `longflow config references unknown persona ${persona}`);
  }
  const mergeTrain = JSON.parse(fs.readFileSync(path.join(repoRoot, "workflows/merge-train/merge-train.config.example.json"), "utf8"));
  for (const persona of mergeTrain.parentReviewerPersonas) {
    assert.ok(reviewerPersonas.includes(persona), `merge-train config references unknown persona ${persona}`);
  }
});
