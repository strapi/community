---
name: n8n-stop
description: Stop the local n8n automation stack. Use when the user asks to stop, shut down, halt, or bring down n8n. Data in the n8n_data volume persists across stops.
---

# n8n-stop

Stops and removes the automation containers. The named volume `n8n_data` (workflows, credentials, settings) is preserved.

## Steps

1. **Run `down` from the workspace root:**
   ```bash
   pnpm --filter automation n8n:down
   ```

2. **Confirm nothing is running:**
   ```bash
   pnpm --filter automation n8n:ps
   ```

## Safety notes

- **Never pass `-v`** here. `down -v` deletes the `n8n_data` volume and all workflows/credentials would be lost. The `n8n:down` package script deliberately omits it.
- If the user asks to wipe state, confirm explicitly before running `./scripts/compose.sh down -v` from `apps/automation/`.
