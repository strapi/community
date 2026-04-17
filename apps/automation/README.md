# Automation (n8n)

Local n8n instance for authoring and testing workflows used by the Strapi community hub. Optionally runs [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) alongside n8n so Claude Code (or any MCP client) can build and validate workflows programmatically.

Engine-agnostic: works with either Docker or Podman. All scripts detect your installed engine automatically.

## Prerequisites

One of:

- **Docker Desktop** (includes the `docker compose` v2 plugin), or
- **Podman + podman-compose** — `pip install --user podman-compose`

Node.js 20+ is required for the workflow export/import scripts (uses built-in `fetch`).

## Ports

| Service   | Port  | URL                            |
| --------- | ----- | ------------------------------ |
| n8n       | 5678  | http://localhost:5678          |
| n8n-mcp   | 3000  | http://localhost:3000/mcp      |

## First-time setup

```bash
cd apps/automation
cp .env.example .env
```

For n8n alone, the defaults in `.env` are fine. For **n8n-mcp** you'll also need:

1. Generate an MCP auth token:
   ```bash
   openssl rand -hex 32
   ```
   Paste it into `.env` as `MCP_AUTH_TOKEN`.

2. Start n8n first so you can create an n8n API key:
   ```bash
   pnpm --filter automation n8n:up
   ```
   Visit <http://localhost:5678>, create the owner account, then Settings → n8n API → create a new API key. Paste the value into `.env` as `N8N_API_KEY`.

3. Bring up n8n-mcp:
   ```bash
   pnpm --filter automation n8n:up:mcp
   ```

## Daily use

All commands run from the repo root:

```bash
pnpm --filter automation n8n:up          # n8n only
pnpm --filter automation n8n:up:mcp      # n8n + n8n-mcp
pnpm --filter automation n8n:down        # stop everything (data persists)
pnpm --filter automation n8n:restart     # restart running services
pnpm --filter automation n8n:ps          # container status
pnpm --filter automation n8n:logs        # tail service logs
```

Data persists in the `n8n_data` named volume across `down` / `up`. Volumes are only removed if you explicitly run `docker compose down -v` or `podman-compose down -v`.

## Workflow version control

Workflows live under `workflows/<slug>/`:

```
workflows/
└── my-workflow/
    ├── workflow.json   # Auto-managed by export/import
    └── README.md       # Optional human context; preserved across re-exports
```

### Export local workflows to the repo

```bash
pnpm --filter automation workflows:export
```

Fetches all workflows from <http://localhost:5678>, strips instance-specific fields (ids, timestamps, runtime state, pin data), and writes them to `workflows/<slug>/workflow.json`. Slug is derived from the workflow name.

If you deleted a workflow in n8n, its `<slug>/` directory is removed on the next export — **unless** it contains a non-empty `README.md`, in which case it's skipped with a warning so human notes aren't silently lost.

### Import workflows from the repo

```bash
pnpm --filter automation workflows:import
```

Reads every `workflows/*/workflow.json` and creates or updates the matching workflow on the local n8n instance (matched by `name`). Workflows are always imported as **inactive** — activate them manually in the n8n UI.

Credentials are never exported (only the reference by name/id is kept in the JSON). When importing to a fresh instance, recreate the credentials in the n8n UI first; dangling credential refs will be flagged by n8n at runtime.

### Team self-hosted instance

The export/import scripts target `http://localhost:5678` only. Deploying workflows to the team self-hosted n8n is a separate manual process and not covered by this tooling.

## Using with Claude Code

Several skills under `.claude/skills/` wrap this stack:

- `n8n-start`, `n8n-stop`, `n8n-restart`, `n8n-status` — lifecycle
- `n8n-export`, `n8n-import` — workflow sync
- `n8n-workflow-builder` — domain-expertise prompt for building workflows via n8n-mcp tools

### Connecting Claude Code to the local n8n-mcp

Once `n8n-mcp` is running (the `mcp` profile is up), Claude Code can connect to it at:

- **URL:** `http://localhost:3000/mcp`
- **Auth:** `Authorization: Bearer <MCP_AUTH_TOKEN>` (the same value in `apps/automation/.env`)

You only need to register the server **once** per scope. Pick one of the two approaches below.

#### Option A — Register at the project scope (committed `.mcp.json`)

Run this from the repo root:

```bash
claude mcp add --scope project --transport http n8n-mcp \
  http://localhost:3000/mcp \
  --header "Authorization: Bearer \${MCP_AUTH_TOKEN}"
```

This writes a `.mcp.json` file at the repo root that the whole team can share:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer ${MCP_AUTH_TOKEN}"
      }
    }
  }
}
```

The `${MCP_AUTH_TOKEN}` placeholder is resolved from your shell environment at launch time, so no secret is committed. **Before starting Claude Code**, export the token:

```bash
export MCP_AUTH_TOKEN="$(grep '^MCP_AUTH_TOKEN=' apps/automation/.env | cut -d= -f2-)"
claude
```

Gotchas:

- If `MCP_AUTH_TOKEN` is unset when Claude Code parses `.mcp.json`, the config fails — there's no fallback. Export it (or use direnv / a shell alias) before launching `claude`.
- Project-scoped servers require workspace-trust approval on first use; Claude Code will prompt.

#### Option B — Register at the user scope (not in the repo)

If you'd rather not commit `.mcp.json`, register the server for your user account only:

```bash
claude mcp add --transport http n8n-mcp \
  http://localhost:3000/mcp \
  --header "Authorization: Bearer $(grep '^MCP_AUTH_TOKEN=' apps/automation/.env | cut -d= -f2-)"
```

This stores the server (including the literal token) in your user config, available across all projects. Nothing is written to the repo.

#### Verify the connection

From inside Claude Code, the `n8n-mcp` server should appear in `/mcp` status. You can also probe the endpoint directly:

```bash
curl -sf -H "Authorization: Bearer $MCP_AUTH_TOKEN" http://localhost:3000/health
# → HTTP 200
```

## Troubleshooting

- **Port 5678 or 3000 already in use** — another container or process is bound. Stop it or edit the port mapping in `docker-compose.yml`.
- **n8n-mcp refuses to start** — check `MCP_AUTH_TOKEN` is at least 32 chars and `N8N_API_KEY` is set. Both are required for the `mcp` profile.
- **`podman-compose` not found** — `pip install --user podman-compose`, then ensure `~/.local/bin` is on your `PATH`.
- **Can't reach n8n from n8n-mcp** — n8n-mcp uses `http://n8n:5678` (service DNS inside the compose network). Don't set `N8N_API_URL` to `localhost` in `.env`; it's overridden in the compose file.
