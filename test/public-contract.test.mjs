import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { repoRoot } from "../scripts/workflow-paths.mjs";

const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "registry.json"), "utf8"));

test("every registered skill is self-describing", () => {
  for (const primitive of registry.primitives.filter(({ kind }) => kind === "skill")) {
    assert.ok(fs.existsSync(path.join(repoRoot, primitive.path, "SKILL.md")), `${primitive.id} needs SKILL.md`);
    const readme = fs.readFileSync(path.join(repoRoot, primitive.readme), "utf8");
    for (const heading of ["**Problem:**", "**Why useful:**", "**Scope:**", "**Use:**"]) {
      assert.ok(readme.includes(heading), `${primitive.id} README needs ${heading}`);
    }
  }
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
