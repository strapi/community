---
name: n8n-restart
description: Restart the local n8n automation stack, preserving whatever profile (plain or mcp) is currently running. Use when the user asks to restart, reload, or reboot n8n.
---

# n8n-restart

Restarts the running services in place. This is faster than `down`/`up` because volumes stay mounted. It also preserves the currently active compose profile — if `n8n-mcp` was up, it stays up.

## Steps

1. **Detect whether the mcp profile is active:**
   ```bash
   cd apps/automation
   if ./scripts/compose.sh ps --services --status running | grep -q '^n8n-mcp$'; then
     MCP_RUNNING=1
   else
     MCP_RUNNING=0
   fi
   ```

2. **Restart the appropriate set of services:**
   ```bash
   if [ "$MCP_RUNNING" = "1" ]; then
     pnpm --filter automation n8n:restart:mcp
   else
     pnpm --filter automation n8n:restart
   fi
   ```

3. **Verify:**
   ```bash
   pnpm --filter automation n8n:ps
   ```

## Notes

- If nothing is currently running, `n8n-restart` will do nothing useful. Use `n8n-start` to bring the stack up instead.
