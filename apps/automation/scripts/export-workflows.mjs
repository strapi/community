#!/usr/bin/env node
// Export workflows from the local n8n instance into apps/automation/workflows/<slug>/workflow.json.
// Strips instance-specific fields so diffs are clean. Preserves <slug>/README.md across re-exports.

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  existsSync,
  statSync,
} from 'node:fs';
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
};

const STRIP_WORKFLOW_FIELDS = [
  'id',
  'versionId',
  'createdAt',
  'updatedAt',
  'triggerCount',
  'active',
  'shared',
  'meta',
  'pinData',
  'homeProject',
  'scopes',
  'isArchived',
];
const STRIP_TAG_FIELDS = ['id', 'createdAt', 'updatedAt'];

function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

function stripWorkflow(wf) {
  const out = { ...wf };
  for (const f of STRIP_WORKFLOW_FIELDS) delete out[f];
  if (Array.isArray(out.tags)) {
    out.tags = out.tags.map((t) => {
      const copy = { ...t };
      for (const f of STRIP_TAG_FIELDS) delete copy[f];
      return copy;
    });
  }
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

async function getWorkflow(id) {
  const r = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, { headers });
  if (!r.ok) {
    throw new Error(`Get workflow ${id} failed: ${r.status} ${await r.text()}`);
  }
  return r.json();
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
  mkdirSync(WORKFLOWS_DIR, { recursive: true });

  console.log(`Fetching workflows from ${N8N_URL}...`);
  const summaries = await listWorkflows();
  console.log(`Found ${summaries.length} workflow(s).`);

  const seenSlugs = new Set();
  const livingSlugs = new Set();
  let added = 0;
  let updated = 0;

  for (const summary of summaries) {
    const wf = await getWorkflow(summary.id);
    let slug = slugify(wf.name);
    const base = slug;
    let suffix = 1;
    while (seenSlugs.has(slug)) slug = `${base}-${++suffix}`;
    seenSlugs.add(slug);
    livingSlugs.add(slug);

    const dir = join(WORKFLOWS_DIR, slug);
    mkdirSync(dir, { recursive: true });
    const out = join(dir, 'workflow.json');
    const existed = existsSync(out);
    writeFileSync(out, `${JSON.stringify(stripWorkflow(wf), null, 2)}\n`);
    if (existed) updated++;
    else added++;
    console.log(`  ${existed ? 'updated' : 'added  '}  ${slug}/workflow.json`);
  }

  let removed = 0;
  let skippedWithNotes = 0;
  if (existsSync(WORKFLOWS_DIR)) {
    for (const entry of readdirSync(WORKFLOWS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (livingSlugs.has(entry.name)) continue;
      const dir = join(WORKFLOWS_DIR, entry.name);
      const readmePath = join(dir, 'README.md');
      if (existsSync(readmePath) && statSync(readmePath).size > 0) {
        console.log(`  skipped  ${entry.name}/ (has README.md)`);
        skippedWithNotes++;
        continue;
      }
      rmSync(dir, { recursive: true, force: true });
      console.log(`  removed  ${entry.name}/`);
      removed++;
    }
  }

  console.log(
    `\nSummary: ${added} added, ${updated} updated, ${removed} removed, ${skippedWithNotes} skipped-with-notes.`
  );
}

main().catch((e) => {
  console.error(e.stack ?? e.message);
  process.exit(1);
});
