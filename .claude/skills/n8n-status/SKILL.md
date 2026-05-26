---
name: n8n-status
description: Show the health and status of the local n8n automation stack. Use when the user asks about n8n status, health, whether it is running, or which containers are up.
---

# n8n-status

Prints container status plus health probes for n8n and (if running) n8n-mcp.

## Steps

1. **List containers:**
   ```bash
   pnpm --filter automation n8n:ps
   ```

2. **Probe n8n health:**
   ```bash
   curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:5678/healthz || echo 'unreachable'
   ```
   A `200` means healthy. Anything else means n8n isn't ready (or isn't running).

3. **Probe n8n-mcp health (only if its container is running):**
   ```bash
   curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:3100/health || echo 'unreachable'
   ```

4. **Summarize** per service in one line each:
   - engine (docker compose vs podman-compose, from `apps/automation/scripts/compose.sh`)
   - container state (running / exited / healthy)
   - local URL and probe result

## Notes

- If both probes fail but containers show as running, it usually means the service is still booting. Wait ~20s and retry, or inspect logs: `pnpm --filter automation n8n:logs`.
