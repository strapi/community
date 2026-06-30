#!/usr/bin/env node
// Deploy the workflows to a target n8n instance for ONE environment.
//
// Does three things the plain import does not:
//   1. Rewrites the Strapi base URL in every HTTP node from the committed
//      placeholder (http://localhost:1337) to this environment's Strapi.
//   2. Rewrites the webhook node paths to this environment's namespace
//      (strapi/<event> -> <namespace>/<event>) so duplicate sets on one n8n
//      instance never collide. Must match Strapi's N8N_WEBHOOK_NAMESPACE.
//   3. Re-links the by-id references (executeWorkflow -> render-email and
//      settings.errorWorkflow -> error-handler) to the target instance's ids.
//
// Workflows are imported INACTIVE. Credentials are bound once in the n8n UI
// (see README); on re-deploy this script re-attaches existing credential bindings
// by node name, so re-running does not wipe them. It never reads secret values.
//
// Required env:
//   N8N_URL          target n8n base URL (e.g. https://n8n.tools.strapi.team)
//   N8N_API_KEY      target n8n API key
//   STRAPI_BASE_URL  Strapi base URL for this environment (e.g. https://cms.example)
// Optional env:
//   N8N_WEBHOOK_NAMESPACE  webhook path prefix (default "strapi"; e.g. "staging")
//
// Example:
//   N8N_URL=https://n8n.tools.strapi.team N8N_API_KEY=*** \
//   STRAPI_BASE_URL=https://staging-cms.example N8N_WEBHOOK_NAMESPACE=staging \
//   pnpm --filter automation run workflows:deploy

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AUTOMATION_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOWS_DIR = join(AUTOMATION_ROOT, 'workflows');
const PLACEHOLDER_BASE = 'http://localhost:1337';
const RENDER_EMAIL_NAME = 'render-email (shared sub-workflow)';
const ERROR_HANDLER_NAME = 'error-handler';
// settings keys the n8n public API accepts on write (others -> 400 on 2.27+)
const ALLOWED_SETTINGS = [
  'executionOrder', 'saveDataErrorExecution', 'saveDataSuccessExecution',
  'saveManualExecutions', 'saveExecutionProgress', 'errorWorkflow',
  'executionTimeout', 'timezone', 'callerPolicy', 'callerIds',
];

loadDotEnv(join(AUTOMATION_ROOT, '.env'));

const N8N_URL = (process.env.N8N_URL || 'http://localhost:5678').replace(/\/$/, '');
const API_KEY = process.env.N8N_API_KEY;
const STRAPI_BASE_URL = (process.env.STRAPI_BASE_URL || '').replace(/\/$/, '');
const NAMESPACE = process.env.N8N_WEBHOOK_NAMESPACE || 'strapi';
// The environment tag identifies this deploy's workflow set on the shared instance.
// Matching is scoped to it so staging and production sets (same names, different tags)
// never collide: a production deploy only ever updates production-tagged workflows.
const ENV_TAG = NAMESPACE === 'strapi' ? 'production' : NAMESPACE;

if (!API_KEY) {
  console.error('Error: N8N_API_KEY is not set (target instance key).');
  process.exit(1);
}
if (!STRAPI_BASE_URL) {
  console.error('Error: STRAPI_BASE_URL is not set (the Strapi URL for this environment).');
  process.exit(1);
}

const headers = {
  'X-N8N-API-KEY': API_KEY,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function sanitize(wf) {
  const out = {};
  for (const f of ['name', 'nodes', 'connections', 'staticData']) {
    if (wf[f] !== undefined) out[f] = wf[f];
  }
  const settings = {};
  for (const k of ALLOWED_SETTINGS) {
    if (wf.settings && wf.settings[k] !== undefined) settings[k] = wf.settings[k];
  }
  out.settings = settings;
  return out;
}

// Rewrite base URL + webhook namespace for this environment (mutates wf).
function applyEnvConfig(wf) {
  for (const node of wf.nodes ?? []) {
    if (node.type === 'n8n-nodes-base.webhook') {
      const p = node.parameters?.path;
      if (typeof p === 'string' && p.startsWith('strapi/')) {
        node.parameters.path = `${NAMESPACE}/${p.slice('strapi/'.length)}`;
      }
    }
    if (node.type === 'n8n-nodes-base.httpRequest') {
      const u = node.parameters?.url;
      if (typeof u === 'string' && u.includes(PLACEHOLDER_BASE)) {
        node.parameters.url = u.replaceAll(PLACEHOLDER_BASE, STRAPI_BASE_URL);
      }
    }
  }
}

// Re-point intra-set references to the target instance's ids (mutates wf).
function relink(wf, renderId, errorId) {
  let changed = false;
  for (const node of wf.nodes ?? []) {
    if (node.type === 'n8n-nodes-base.executeWorkflow' && renderId) {
      const ref = node.parameters?.workflowId;
      if (ref && typeof ref === 'object' && ref.value !== renderId) {
        ref.value = renderId;
        ref.cachedResultName = RENDER_EMAIL_NAME;
        changed = true;
      }
    }
  }
  if (errorId && wf.settings?.errorWorkflow && wf.settings.errorWorkflow !== errorId) {
    wf.settings.errorWorkflow = errorId;
    changed = true;
  }
  return changed;
}

async function api(method, path, body) {
  const r = await fetch(`${N8N_URL}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

async function listWorkflows() {
  const all = [];
  let cursor;
  do {
    const url = new URL(`${N8N_URL}/api/v1/workflows`);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`List failed: ${r.status} ${await r.text()}`);
    const body = await r.json();
    all.push(...(body.data ?? []));
    cursor = body.nextCursor;
  } while (cursor);
  return all;
}

// Resolve tag names to ids on the target instance, creating any that are missing.
async function resolveTags(names) {
  const all = [];
  let cursor;
  do {
    const url = new URL(`${N8N_URL}/api/v1/tags`);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`list tags failed: ${r.status} ${await r.text()}`);
    const b = await r.json();
    all.push(...(b.data ?? []));
    cursor = b.nextCursor;
  } while (cursor);
  const byName = new Map(all.map((t) => [t.name, t.id]));
  const out = new Map();
  for (const n of names) {
    if (byName.has(n)) out.set(n, byName.get(n));
    else {
      const res = await api('POST', '/api/v1/tags', { name: n });
      out.set(n, res.id);
      console.log(`  created tag ${n}`);
    }
  }
  return out;
}

function loadLocal() {
  const out = [];
  for (const entry of readdirSync(WORKFLOWS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const p = join(WORKFLOWS_DIR, entry.name, 'workflow.json');
    if (existsSync(p)) out.push(JSON.parse(readFileSync(p, 'utf8')));
  }
  return out;
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
  console.log(`Deploying to ${N8N_URL}`);
  console.log(`  Strapi base URL : ${STRAPI_BASE_URL}`);
  console.log(`  webhook namespace: ${NAMESPACE}  (paths -> /webhook/${NAMESPACE}/<event>)\n`);

  const local = loadLocal().filter((wf) => wf.name);
  local.forEach(applyEnvConfig);

  // Re-attach UI-bound credentials from an existing workflow onto the repo nodes
  // (matched by node name), so a re-deploy never wipes credential bindings.
  function preserveCreds(wf, existing) {
    const byName = new Map();
    for (const n of existing.nodes ?? []) if (n.credentials) byName.set(n.name, n.credentials);
    for (const n of wf.nodes ?? []) if (byName.has(n.name)) n.credentials = byName.get(n.name);
  }

  // Create/update each workflow, re-linking by-id references to the target's ids
  // BEFORE the PUT. n8n refuses to publish an active workflow whose executeWorkflow
  // target isn't published, so the reference must already be the target's id at write
  // time. Push referenced sub-workflows first (error-handler, render-email) so their
  // ids are known; seed `ids` from existing so re-deploys resolve every ref up front.
  // Scope existing-workflow matching to THIS environment's tag, so duplicate sets on
  // one instance (same names, different env tag) stay independent. On a first deploy to
  // a new environment this is empty -> every workflow is created fresh; on a re-deploy it
  // matches only this env's set -> updates in place and leaves the other set untouched.
  const remote = await listWorkflows();
  const inEnv = remote.filter((w) => (w.tags ?? []).some((t) => t.name === ENV_TAG));
  console.log(
    `  found ${inEnv.length} existing '${ENV_TAG}'-tagged workflow(s) on target ` +
    `(${remote.length} total on instance)\n`,
  );
  const existing = new Map(inEnv.map((w) => [w.name, w.id]));
  const ids = new Map(existing);
  const byName = new Map(local.map((w) => [w.name, w]));
  let created = 0, updated = 0, failed = 0;

  const order = [];
  for (const nm of [ERROR_HANDLER_NAME, RENDER_EMAIL_NAME]) {
    if (byName.has(nm)) order.push(byName.get(nm));
  }
  for (const wf of local) {
    if (wf.name !== ERROR_HANDLER_NAME && wf.name !== RENDER_EMAIL_NAME) order.push(wf);
  }

  for (const wf of order) {
    try {
      relink(wf, ids.get(RENDER_EMAIL_NAME), ids.get(ERROR_HANDLER_NAME));
      if (existing.has(wf.name)) {
        const id = ids.get(wf.name);
        const current = await api('GET', `/api/v1/workflows/${id}`);
        preserveCreds(wf, current);
        await api('PUT', `/api/v1/workflows/${id}`, sanitize(wf));
        updated++; console.log(`  updated  ${wf.name}`);
      } else {
        const res = await api('POST', '/api/v1/workflows', sanitize(wf));
        ids.set(wf.name, res.id);
        created++; console.log(`  created  ${wf.name}`);
      }
    } catch (e) {
      failed++; console.error(`  failed   ${wf.name}: ${e.message}`);
    }
  }

  // Pass 3: tag every deployed workflow with community-hub + the environment tag.
  let tagged = 0;
  try {
    const tagIds = await resolveTags(['community-hub', ENV_TAG]);
    const body = [{ id: tagIds.get('community-hub') }, { id: tagIds.get(ENV_TAG) }];
    for (const wf of order) {            // only the workflows we deployed, never pre-existing ones
      const id = ids.get(wf.name);
      if (!id) continue;
      try {
        await api('PUT', `/api/v1/workflows/${id}/tags`, body);
        tagged++;
      } catch (e) {
        console.error(`  tag failed   ${wf.name}: ${e.message}`);
      }
    }
    console.log(`  tagged ${tagged} workflows: community-hub + ${ENV_TAG}`);
  } catch (e) {
    console.error(`  tagging skipped: ${e.message}`);
  }

  console.log(`\nSummary: ${created} created, ${updated} updated, ${tagged} tagged, ${failed} failed.`);
  console.log('Imported INACTIVE. Next: bind credentials in the n8n UI (see README), then activate.');
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
