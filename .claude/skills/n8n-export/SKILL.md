---
name: n8n-export
description: Export all workflows from the local n8n instance into version-controlled JSON under apps/automation/workflows/. Use when the user asks to export, pull, snapshot, or sync workflows from the local n8n.
---

# n8n-export

Fetches every workflow from the local n8n instance via the REST API and writes each one to `apps/automation/workflows/<slug>/workflow.json` with instance-specific fields stripped for clean diffs.

## Preconditions

- n8n is running locally (`pnpm --filter automation n8n:ps` shows it).
- `apps/automation/.env` has `N8N_API_KEY` set. If missing, stop and direct the user to create one at <http://localhost:5678/settings/api> and paste into `.env`.

## Steps

1. **Pre-flight checks:**
   ```bash
   grep -E '^N8N_API_KEY=.+' apps/automation/.env >/dev/null || echo 'MISSING N8N_API_KEY'
   curl -sf http://localhost:5678/healthz >/dev/null || echo 'n8n not reachable'
   ```

2. **Run the export:**
   ```bash
   pnpm --filter automation workflows:export
   ```

3. **Report the summary** to the user (added / updated / removed / skipped-with-notes counts printed by the script).

## What's stripped

Instance-specific fields (`id`, `versionId`, `createdAt`, `updatedAt`, `triggerCount`, `active`, `shared`, `meta`, `pinData`) are removed before writing. Tag IDs/timestamps are stripped too; tag names are kept.

## Preserved across exports

If `apps/automation/workflows/<slug>/README.md` exists and is non-empty, the script will NOT delete that directory even if the workflow has been removed from n8n. It warns instead, so you notice the dangling directory and can resolve it intentionally.

## Credentials

Credentials are never exported. Only the reference (name + id) appears in the JSON; secrets stay in n8n's encrypted store.
