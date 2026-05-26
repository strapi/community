---
name: n8n-import
description: Import workflows from apps/automation/workflows/ into the local n8n instance. Use when the user asks to import, push, load, or sync workflow JSON files to the local n8n.
---

# n8n-import

Reads every `apps/automation/workflows/<slug>/workflow.json` and creates or updates the matching workflow on the local n8n instance. Matching is by workflow `name`.

## Preconditions

- n8n is running locally.
- `apps/automation/.env` has `N8N_API_KEY` set.

## Steps

1. **Pre-flight checks:**
   ```bash
   grep -E '^N8N_API_KEY=.+' apps/automation/.env >/dev/null || echo 'MISSING N8N_API_KEY'
   curl -sf http://localhost:5678/healthz >/dev/null || echo 'n8n not reachable'
   ```

2. **Run the import:**
   ```bash
   pnpm --filter automation workflows:import
   ```

3. **Report the summary** to the user (created / updated / failed counts).

## Behavior

- **Match by name:** if a workflow with the same `name` already exists on the instance, it's updated in place via `PUT /api/v1/workflows/{id}`. The instance-side id and any activations are preserved.
- **Imported inactive:** the `active` field is stripped on export, so nothing is auto-activated on import. The user activates workflows manually in the UI.
- **Credentials:** dangling credential references are warned per-node. Recreate the credentials in the n8n UI to clear the warning — secrets are never in the JSON.

## Sanitization

Only whitelisted fields (`name`, `nodes`, `connections`, `settings`, `staticData`) are sent to the API. Tags aren't associated on import (n8n manages tag links via a separate endpoint; that's intentionally out of scope for now).
