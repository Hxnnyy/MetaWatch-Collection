#!/usr/bin/env node
// continuous-stop-guard
// Rejects Stop events while a continuous-mode run is in progress.
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

const statePath = join(cwd, 'tasks', 'STATE.json');

if (!existsSync(statePath)) {
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

if (state.mode !== 'continuous') {
  process.exit(0);
}

if (state.status === 'complete' || state.status === 'hard_blocked') {
  process.exit(0);
}

if (state.status === 'in_progress') {
  const next = state.next_action ?? '<unknown>';
  const open = Array.isArray(state.promises)
    ? state.promises.filter((p) => p && p.status !== 'true').length
    : '<unknown>';
  process.stderr.write(
    `continuous-stop-guard: continuous run is in progress (open promises: ${open}, next_action: ${next}). ` +
    `Hard-block conditions are not met. Re-read tasks/STATE.json (directive field) and tasks/INTENT.md, ` +
    `then continue until every promise is true or a hard-block from _shared/hard-block-conditions.md fires.\n`
  );
  process.exit(2);
}

process.exit(0);
