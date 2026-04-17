---
name: n8n-start
description: Start the local n8n instance for the Strapi community hub. Use when the user asks to start, launch, bring up, or run n8n or the automation stack. Pass --mcp to also bring up n8n-mcp (requires N8N_API_KEY and MCP_AUTH_TOKEN in .env).
---

# n8n-start

Starts the n8n container(s) defined in `apps/automation/docker-compose.yml` via the engine-agnostic `scripts/compose.sh` wrapper (autodetects Docker or Podman).

## Steps

1. **Change to the automation directory.** All commands below run from `apps/automation/`.

2. **Ensure `.env` exists:**
   ```bash
   test -f apps/automation/.env || cp apps/automation/.env.example apps/automation/.env
   ```
   If it was just created, tell the user and point them at `apps/automation/.env.example`.

3. **Decide on MCP.** If the user's request didn't specify, ask whether to include `n8n-mcp`. Default is no.

4. **If starting with MCP, pre-check required env vars:**
   ```bash
   grep -E '^(N8N_API_KEY|MCP_AUTH_TOKEN)=.+' apps/automation/.env
   ```
   Both must be non-empty. If either is missing, stop and explain:
   - `MCP_AUTH_TOKEN` — generate with `openssl rand -hex 32`.
   - `N8N_API_KEY` — chicken-and-egg: start n8n first (without `--mcp`), create the key in the UI at <http://localhost:5678/settings/api>, paste it into `.env`, then run `n8n-start --mcp`.

5. **Start the stack:**
   ```bash
   # without MCP
   pnpm --filter automation n8n:up

   # with MCP
   pnpm --filter automation n8n:up:mcp
   ```

6. **Tail startup logs briefly** to confirm health:
   ```bash
   pnpm --filter automation n8n:logs --tail=20 &
   # (stop after a few seconds)
   ```
   Or run `pnpm --filter automation n8n:ps` to confirm the containers are `running` / `healthy`.

7. **Report URLs to the user:**
   - n8n UI: <http://localhost:5678>
   - n8n-mcp endpoint (if started): <http://localhost:3000/mcp>

8. **If the `mcp` profile was started**, also remind the user that Claude Code must be registered against the MCP server to actually use it. Point them at the "Connecting Claude Code to the local n8n-mcp" section of `apps/automation/README.md`. The one-line summary:

   - Project-scoped: `claude mcp add --scope project --transport http n8n-mcp http://localhost:3000/mcp --header "Authorization: Bearer \${MCP_AUTH_TOKEN}"` (writes `.mcp.json`; export `MCP_AUTH_TOKEN` before launching `claude`).
   - User-scoped: same command without `--scope project` and with the literal token inlined.

   Skip this reminder if the user has clearly registered it already (e.g. they're invoking an `n8n-*` tool and it's responding).
