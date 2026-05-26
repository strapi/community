#!/usr/bin/env node
// Import workflows from apps/automation/workflows/<slug>/workflow.json into the local n8n instance.
// Creates new workflows or updates existing ones in place (matched by name). Always imports as inactive.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AUTOMATION_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOWS_DIR = join(AUTOMATION_ROOT, 'workflows');

loadDotEnv(join(AUTOMATION_ROOT, '.env'));

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY;

if (!API_KEY) {
  console.error('Error: N8N_API_KEY is not set in apps/automation/.env');
  console.error(`Generate a key in the n8n UI: ${N8N_URL}/settings/api`);
  process.exit(1);
}

const headers = {
  'X-N8N-API-KEY': API_KEY,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// n8n's workflow API accepts this whitelist. Tag associations are managed separately and skipped here.
const ALLOWED_FIELDS = ['name', 'nodes', 'connections', 'settings', 'staticData'];

function sanitizePayload(wf) {
  const out = {};
  for (const f of ALLOWED_FIELDS) {
    if (wf[f] !== undefined) out[f] = wf[f];
  }
  // n8n requires a settings object even if empty.
  if (!out.settings || typeof out.settings !== 'object') out.settings = {};
  return out;
}

async function listWorkflows() {
  const all = [];
  let cursor;
  do {
    const url = new URL(`${N8N_URL}/api/v1/workflows`);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const r = await fetch(url, { headers });
    if (!r.ok) {
      throw new Error(`List workflows failed: ${r.status} ${await r.text()}`);
    }
    const body = await r.json();
    all.push(...(body.data ?? []));
    cursor = body.nextCursor;
  } while (cursor);
  return all;
}

async function createWorkflow(payload) {
  const r = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Create failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function updateWorkflow(id, payload) {
  const r = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Update ${id} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

function warnAboutCredentials(wf) {
  for (const node of wf.nodes ?? []) {
    if (!node.credentials) continue;
    for (const [type, ref] of Object.entries(node.credentials)) {
      const label = ref?.name || ref?.id || '(unknown)';
      console.warn(
        `    note: node "${node.name}" references credential "${label}" (${type}) — verify it exists in the instance`
      );
    }
  }
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

async function main() {
  if (!existsSync(WORKFLOWS_DIR)) {
    console.log(`No workflows/ directory at ${WORKFLOWS_DIR}. Nothing to import.`);
    return;
  }

  const dirs = readdirSync(WORKFLOWS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (dirs.length === 0) {
    console.log('No workflow directories to import.');
    return;
  }

  console.log(`Looking up existing workflows at ${N8N_URL}...`);
  const existing = await listWorkflows();
  const byName = new Map(existing.map((wf) => [wf.name, wf]));

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const entry of dirs) {
    const path = join(WORKFLOWS_DIR, entry.name, 'workflow.json');
    if (!existsSync(path)) continue;

    let wf;
    try {
      wf = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      console.error(`  failed   ${entry.name}/: parse error — ${e.message}`);
      failed++;
      continue;
    }

    const payload = sanitizePayload(wf);
    if (!payload.name) {
      console.error(`  failed   ${entry.name}/: workflow.json missing "name"`);
      failed++;
      continue;
    }

    try {
      const match = byName.get(payload.name);
      if (match) {
        await updateWorkflow(match.id, payload);
        console.log(`  updated  ${payload.name}`);
        updated++;
      } else {
        await createWorkflow(payload);
        console.log(`  created  ${payload.name}`);
        created++;
      }
      warnAboutCredentials(wf);
    } catch (e) {
      console.error(`  failed   ${payload.name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nSummary: ${created} created, ${updated} updated, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e.stack ?? e.message);
  process.exit(1);
});
