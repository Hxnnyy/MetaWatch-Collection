// Run-ledger predicate suite: mechanical bookkeeping checks over a run's
// durable record. Contract: run-ledger-predicates.md (shipped alongside).
// Asserts existence, structure, and run-records only — never quality.
//
// Usage:
//   node run-ledger-predicates.mjs --run-dir tasks          # full suite (RL1–RL10)
//   node run-ledger-predicates.mjs --scan FILE [FILE...]    # RL8 deferral scan only
//
// Exit 0: all applicable predicates passed. Exit 1: at least one FAIL.
// Zero dependencies; Node 18+.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const VERDICT_ENUM = new Set(["PASS", "PASS_WITH_NOTES", "BLOCKED", "NOT_APPLICABLE"]);
const DISPOSITION_ENUM = new Set(["fix-now", "follow-up", "residual-risk", "rebutted"]);
const TICKET_REF = /\b[A-Z][A-Z0-9]{1,9}-\d+\b|#\d+\b|\bledger:\s*\S+|\b[BR]-\d{3}\b/;
const WAIVER = /no-ticket:\s*\S+/i;
// Committal deferral phrases only: bare mentions of "deferred" or "follow-ups"
// (retro headings, "nothing deferred") must not fire — the scan targets promises
// of future work, not the vocabulary.
const DEFERRAL = new RegExp(
  [
    "outside\\s+(?:this|the)\\s+(?:ticket|run|scope)",
    "deferr?ed\\s+to\\s+(?:a\\s+|the\\s+)?(?:later|future|separate|follow[- ]?up)",
    "left\\s+for\\s+later",
    "(?:as|in)\\s+a\\s+(?:separate\\s+)?follow[- ]?up",
    "(?:requires?|needs?|warrants?)\\s+a\\s+follow[- ]?up"
  ].join("|"),
  "i"
);
const PATHISH = /^[\w\-./\\]+\.(md|json|txt|log|html|ps1|sh|mjs|js|ts|py)$/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function lineCarriesReference(line) {
  return TICKET_REF.test(line) || WAIVER.test(line);
}

// Scan text for deferral language lacking a same-line ticket reference or waiver.
function scanDeferrals(text, label) {
  const failures = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!DEFERRAL.test(line)) continue;
    if (lineCarriesReference(line)) continue;
    failures.push(`${label}:${i + 1}: deferral language without a ticket reference or 'no-ticket:' waiver: ${line.trim().slice(0, 120)}`);
  }
  return failures;
}

export function runPredicates({ runDir, scanPaths = [] }) {
  const results = [];
  const record = (id, name, status, reasons = []) => results.push({ id, name, status, reasons });

  // ---- scan-only mode -------------------------------------------------------
  const collectScanFiles = (target) => {
    if (!fs.existsSync(target)) return [];
    if (fs.statSync(target).isDirectory()) {
      return fs.readdirSync(target)
        .map((f) => path.join(target, f))
        .flatMap(collectScanFiles);
    }
    return /\.(md|json|txt)$/i.test(target) ? [target] : [];
  };

  if (scanPaths.length > 0) {
    const failures = [];
    for (const target of scanPaths) {
      const files = collectScanFiles(target);
      if (files.length === 0) failures.push(`${target}: no scannable files found`);
      for (const file of files) failures.push(...scanDeferrals(fs.readFileSync(file, "utf8"), file));
    }
    record("RL8", "deferral-language-has-ticket-or-waiver", failures.length ? "FAIL" : "PASS", failures);
    if (!runDir) return results;
  }

  if (!runDir) return results;
  const repoRoot = path.dirname(path.resolve(runDir));
  const statePath = path.join(runDir, "STATE.json");

  // ---- RL1: state parses ----------------------------------------------------
  let state = null;
  if (!fs.existsSync(statePath)) {
    record("RL1", "state-exists-and-parses", "FAIL", [`${statePath} does not exist`]);
  } else {
    try {
      state = readJson(statePath);
      if (typeof state.schema_version !== "string" || !state.schema_version.includes("longflow")) {
        record("RL1", "state-exists-and-parses", "FAIL", [`unrecognised schema_version: ${state.schema_version}`]);
      } else {
        record("RL1", "state-exists-and-parses", "PASS");
      }
    } catch (error) {
      record("RL1", "state-exists-and-parses", "FAIL", [`STATE.json does not parse: ${error.message}`]);
    }
  }
  if (!state) return results;

  const promises = Array.isArray(state.promises) ? state.promises : [];

  // ---- RL2: verdict integrity ----------------------------------------------
  {
    const failures = [];
    for (const promise of promises) {
      const verdicts = promise.gate?.raw_reviewer_verdicts ?? [];
      for (const entry of verdicts) {
        const where = `promise ${promise.number} verdict ${entry.id ?? "<no id>"}`;
        if (!entry.id) failures.push(`${where}: missing id`);
        const v = entry.verdict;
        if (!v || typeof v !== "object") { failures.push(`${where}: verdict object missing`); continue; }
        if (typeof v.reviewer !== "string" || v.reviewer.trim() === "") failures.push(`${where}: missing reviewer`);
        if (typeof v.scope !== "string" || v.scope.trim() === "") failures.push(`${where}: missing scope`);
        if (!VERDICT_ENUM.has(v.verdict)) failures.push(`${where}: verdict not in enum (${v.verdict})`);
        if (!Array.isArray(v.findings)) failures.push(`${where}: findings is not an array`);
      }
    }
    record("RL2", "raw-verdicts-are-complete-records", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL3: disposition references -----------------------------------------
  {
    const failures = [];
    for (const promise of promises) {
      const gate = promise.gate ?? {};
      const verdictById = new Map((gate.raw_reviewer_verdicts ?? []).map((v) => [v.id, v]));
      for (const disposition of gate.applied_dispositions ?? []) {
        const where = `promise ${promise.number} disposition on ${disposition.verdict_id ?? "<no id>"}`;
        const verdict = verdictById.get(disposition.verdict_id);
        if (!verdict) { failures.push(`${where}: references a verdict id that does not exist`); continue; }
        const findings = verdict.verdict?.findings ?? [];
        if (!Number.isInteger(disposition.finding_index) || disposition.finding_index < 0 || disposition.finding_index >= findings.length) {
          failures.push(`${where}: finding_index ${disposition.finding_index} does not exist (verdict has ${findings.length} findings)`);
        }
        if (!DISPOSITION_ENUM.has(disposition.action)) failures.push(`${where}: action not in enum (${disposition.action})`);
      }
    }
    record("RL3", "dispositions-reference-real-findings", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL4: verified promises carry evidence --------------------------------
  {
    const failures = [];
    for (const promise of promises) {
      if (promise.status !== "verified") continue;
      const evidence = promise.evidence ?? {};
      if (!evidence.verified_at) failures.push(`promise ${promise.number}: verified without verified_at`);
      if (!Array.isArray(evidence.references) || evidence.references.length === 0) failures.push(`promise ${promise.number}: verified with empty evidence references`);
      if (!Array.isArray(evidence.scope) || evidence.scope.length === 0) failures.push(`promise ${promise.number}: verified with empty scope`);
    }
    record("RL4", "verified-promises-have-evidence", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL5: closed items have run records ------------------------------------
  {
    const failures = [];
    const ledgerDir = path.join(runDir, "ledger");
    const items = fs.existsSync(ledgerDir)
      ? fs.readdirSync(ledgerDir).filter((f) => f.endsWith(".json"))
      : [];
    for (const file of items) {
      let item;
      try { item = readJson(path.join(ledgerDir, file)); } catch (error) { failures.push(`${file}: does not parse: ${error.message}`); continue; }
      if (item.status === "closed") {
        if (typeof item.check !== "string" || item.check.trim() === "") failures.push(`${file}: closed with empty check`);
        if (!Array.isArray(item.evidence) || item.evidence.length === 0) failures.push(`${file}: closed with empty evidence`);
      }
      if (item.status === "cancelled" && (typeof item.notes !== "string" || item.notes.trim() === "")) {
        failures.push(`${file}: cancelled without a reason in notes`);
      }
    }
    record("RL5", "closed-items-have-check-and-evidence", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL6: closeout integrity ----------------------------------------------
  const complete = state.status === "complete";
  {
    if (!complete) {
      record("RL6", "complete-run-has-durable-closeout", "SKIP", ["run is not complete"]);
    } else {
      const failures = [];
      const closeout = state.final_closeout;
      if (!closeout || typeof closeout !== "object") {
        failures.push("final_closeout missing on a complete run");
      } else {
        if (closeout.walkthrough !== "holds") failures.push(`final walkthrough is '${closeout.walkthrough}', not 'holds'`);
        if (!["passed", "not_executable"].includes(closeout.trail_audit)) failures.push(`trail_audit is '${closeout.trail_audit}'`);
        if (!Array.isArray(closeout.evidence_references) || closeout.evidence_references.length === 0) failures.push("evidence_references is empty");
        const retro = closeout.retro_reference;
        if (typeof retro !== "string" || retro.trim() === "") {
          failures.push("retro_reference missing");
        } else {
          const retroFile = retro.split("#")[0].trim();
          const resolved = path.join(repoRoot, retroFile);
          if (!fs.existsSync(resolved)) failures.push(`retro file does not exist: ${retroFile}`);
          else if (fs.statSync(resolved).size < 200) failures.push(`retro file is trivially small: ${retroFile}`);
        }
      }
      record("RL6", "complete-run-has-durable-closeout", failures.length ? "FAIL" : "PASS", failures);
    }
  }

  // ---- RL7: path-like references resolve -------------------------------------
  {
    const failures = [];
    const candidates = [];
    for (const promise of promises) {
      if (promise.status === "verified") candidates.push(...(promise.evidence?.references ?? []));
    }
    if (complete && state.final_closeout) candidates.push(...(state.final_closeout.evidence_references ?? []));
    for (const reference of candidates) {
      if (typeof reference !== "string") continue;
      const bare = reference.replace(/^[a-z-]+:\s*/i, "").trim(); // strip tags like 'production-readback: '
      if (!PATHISH.test(bare)) continue;
      const resolved = path.join(repoRoot, bare.split("#")[0]);
      if (!fs.existsSync(resolved)) failures.push(`evidence reference does not resolve: ${bare}`);
      else if (fs.statSync(resolved).size === 0) failures.push(`evidence reference is an empty file: ${bare}`);
    }
    record("RL7", "pathlike-evidence-resolves", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL8: deferral language carries tickets --------------------------------
  {
    const failures = [];
    const execplans = fs.readdirSync(runDir).filter((f) => f.endsWith("-execplan.md"));
    for (const file of execplans) {
      failures.push(...scanDeferrals(fs.readFileSync(path.join(runDir, file), "utf8"), file));
    }
    for (const promise of promises) {
      for (const disposition of promise.gate?.applied_dispositions ?? []) {
        if (!["follow-up", "residual-risk"].includes(disposition.action)) continue;
        const rationale = disposition.rationale ?? "";
        if (!lineCarriesReference(rationale)) {
          failures.push(`promise ${promise.number}: '${disposition.action}' disposition on ${disposition.verdict_id} has no ticket reference or waiver in its rationale`);
        }
      }
    }
    for (const risk of state.residual_risks ?? []) {
      const disposition = risk.disposition ?? "";
      if (DEFERRAL.test(disposition) && !lineCarriesReference(disposition)) {
        failures.push(`residual risk ${risk.id}: follow-up disposition without a ticket reference or waiver`);
      }
    }
    const ledgerDir = path.join(runDir, "ledger");
    if (fs.existsSync(ledgerDir)) {
      for (const file of fs.readdirSync(ledgerDir).filter((f) => f.endsWith(".json"))) {
        try {
          const item = readJson(path.join(ledgerDir, file));
          if (typeof item.notes === "string") failures.push(...scanDeferrals(item.notes, `ledger/${file} notes`));
        } catch { /* RL5 reports parse failures */ }
      }
    }
    record("RL8", "deferral-language-has-ticket-or-waiver", failures.length ? "FAIL" : "PASS", failures);
  }

  // ---- RL9: calibration recorded its retro read ------------------------------
  {
    const execplans = fs.readdirSync(runDir).filter((f) => f.endsWith("-execplan.md"));
    if (execplans.length === 0) {
      record("RL9", "calibration-recorded-retro-read", "FAIL", ["no execplan found in run dir"]);
    } else {
      const found = execplans.some((f) => /Retro reviewed:\s*\S+/.test(fs.readFileSync(path.join(runDir, f), "utf8")));
      record("RL9", "calibration-recorded-retro-read", found ? "PASS" : "FAIL",
        found ? [] : ["no 'Retro reviewed: <ref | first-run>' line in any execplan calibration section"]);
    }
  }

  // ---- RL10: live-defect runs record a production readback --------------------
  {
    const intentPath = path.join(runDir, "INTENT.md");
    const intent = fs.existsSync(intentPath) ? fs.readFileSync(intentPath, "utf8") : "";
    if (!/^Live-defect:\s*yes/im.test(intent)) {
      record("RL10", "live-defect-closes-with-production-readback", "SKIP", ["intent contract carries no 'Live-defect: yes' marker"]);
    } else if (!complete) {
      record("RL10", "live-defect-closes-with-production-readback", "SKIP", ["run is not complete"]);
    } else {
      const references = state.final_closeout?.evidence_references ?? [];
      const found = references.some((r) => typeof r === "string" && /^production-readback:/i.test(r.trim()));
      record("RL10", "live-defect-closes-with-production-readback", found ? "PASS" : "FAIL",
        found ? [] : ["no 'production-readback:' evidence reference on a live-defect run"]);
    }
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);
  let runDir = null;
  const scanPaths = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--run-dir") runDir = args[++i];
    else if (args[i] === "--scan") { while (args[i + 1] && !args[i + 1].startsWith("--")) scanPaths.push(args[++i]); }
    else { console.error(`unknown argument: ${args[i]}`); process.exit(2); }
  }
  if (!runDir && scanPaths.length === 0) {
    console.error("usage: node run-ledger-predicates.mjs [--run-dir <dir>] [--scan <file-or-dir>...]");
    process.exit(2);
  }
  const results = runPredicates({ runDir, scanPaths });
  let failed = 0;
  for (const result of results) {
    console.log(`${result.status} ${result.id} ${result.name}`);
    for (const reason of result.reasons) console.log(`  - ${reason}`);
    if (result.status === "FAIL") failed += 1;
  }
  console.log(`${results.length - failed}/${results.length} predicates passed (SKIPs count as applicable-not-run)`);
  process.exit(failed === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
