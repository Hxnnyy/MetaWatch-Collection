#!/usr/bin/env node
// continuous-stop-guard
// Rejects Stop events while a continuous-mode execplan is in progress.
// See HOOK.md for the full contract and wiring instructions.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch {}

let payload = {};
try { payload = JSON.parse(input || '{}'); } catch {}

const cwd = payload.cwd || process.cwd();
const stopHookActive = payload.stop_hook_active === true;

if (stopHookActive) {
  process.exit(0);
}

const directivePath = join(cwd, 'tasks', 'CONTINUOUS_DIRECTIVE.md');
const statePath = join(cwd, 'tasks', 'STATE.json');

if (!existsSync(directivePath)) {
  process.exit(0);
}

let directive = '';
try {
  directive = readFileSync(directivePath, 'utf8');
} catch {
  process.exit(0);
}

const modeMatch = directive.match(/^mode:\s*(\S+)/m);
const mode = modeMatch ? modeMatch[1] : null;

if (mode !== 'continuous') {
  process.exit(0);
}

if (!existsSync(statePath)) {
  process.stderr.write(
    'continuous-stop-guard: CONTINUOUS_DIRECTIVE.md is present (mode: continuous) but tasks/STATE.json is missing. ' +
    'This is hard-block condition 8 (state corruption). Surface to the user.\n'
  );
  process.exit(0);
}

let state = {};
try {
  state = JSON.parse(readFileSync(statePath, 'utf8'));
} catch {
  process.stderr.write(
    'continuous-stop-guard: tasks/STATE.json is malformed. Hard-block condition 8 (state corruption). Surface to the user.\n'
  );
  process.exit(0);
}

if (state.status === 'complete' || state.status === 'hard_blocked') {
  process.exit(0);
}

if (state.status === 'in_progress') {
  const prd = state.parent_prd ?? '<unknown>';
  const next = state.next_action ?? '<unknown>';
  process.stderr.write(
    `continuous-stop-guard: continuous execplan for parent PRD #${prd} is in progress (next_action: ${next}). ` +
    `Hard-block conditions are not met. Re-read tasks/CONTINUOUS_DIRECTIVE.md and continue working ` +
    `until parent PRD is closed or a hard-block from _shared/hard-block-conditions.md fires.\n`
  );
  process.exit(2);
}

process.exit(0);
