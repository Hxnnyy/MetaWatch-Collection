import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { publicSkills, repoRoot } from "../scripts/workflow-paths.mjs";

const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "registry.json"), "utf8"));

test("every standalone skill bundle is self-describing", () => {
  for (const bundle of registry.bundles.filter(({ kind }) => kind === "skill")) {
    assert.deepEqual(bundle.entrypoints, ["SKILL.md"], `${bundle.id} must be self-contained`);
    assert.ok(fs.existsSync(path.join(repoRoot, bundle.root, "SKILL.md")), `${bundle.id} needs SKILL.md`);
    const readme = fs.readFileSync(path.join(repoRoot, bundle.readme), "utf8");
    for (const heading of ["**Problem:**", "**Why useful:**", "**Scope:**", "**Use:**"]) {
      assert.ok(readme.includes(heading), `${bundle.id} README needs ${heading}`);
    }
  }
});

test("workflow entrypoints are installed only through complete bundles", () => {
  for (const bundle of registry.bundles.filter(({ kind }) => kind === "workflow")) {
    assert.ok(bundle.entrypoints.length > 0, `${bundle.id} needs entrypoints`);
    for (const entrypoint of bundle.entrypoints) {
      assert.ok(fs.existsSync(path.join(repoRoot, bundle.root, entrypoint)), `${bundle.id} missing ${entrypoint}`);
    }
  }
  const install = fs.readFileSync(path.join(repoRoot, "INSTALL.md"), "utf8");
  assert.match(install, /root.*indivisible source tree/i);
  assert.match(install, /do not install a nested workflow skill by itself/i);
});

test("registry and export index contain the same skill entrypoints", () => {
  const registered = registry.bundles.flatMap((bundle) =>
    bundle.entrypoints.map((entrypoint) => path.posix.join(bundle.root, entrypoint))
  ).sort();
  const exported = publicSkills.map((skill) => path.posix.join(skill.source, "SKILL.md")).sort();
  assert.deepEqual(registered, exported);
});

test("public identity and installation contract are discoverable", () => {
  assert.equal(registry.name, "MetaWatch");
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /INSTALL\.md/);
  assert.match(readme, /registry\.json/);
  const install = fs.readFileSync(path.join(repoRoot, "INSTALL.md"), "utf8");
  assert.match(install, /Merge rather than overwrite/i);
  assert.match(install, /do not invent an installation location/i);
});
