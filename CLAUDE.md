# Claude Code Guide — Strapi Community

pnpm + turbo monorepo for the Strapi community hub.

## Layout

- `apps/automation/` — Local n8n instance and version-controlled workflows
- `apps/cms/` — Strapi application
- `apps/search/` — Search service
- `apps/web/` — Web app
- `packages/biome-config/` — Shared Biome (lint/format) config
- `packages/strapi-client/` — Strapi client SDK
- `packages/typescript-config/` — Shared TypeScript configs

## Common commands

- `pnpm install` — install all workspace deps
- `pnpm dev` — run all app `dev` scripts via turbo
- `pnpm build` / `pnpm lint` / `pnpm test` / `pnpm check-types` — turbo tasks

## Automation stack (n8n)

Local n8n plus optional `n8n-mcp` managed by an engine-agnostic compose setup under `apps/automation/`. Works with either Docker or Podman — the wrapper script picks whichever is installed.

See [`apps/automation/README.md`](apps/automation/README.md) for full setup.

### Skills (under `.claude/skills/`)

| Skill | Purpose |
| --- | --- |
| `n8n-start` | Start n8n (pass `--mcp` to also start n8n-mcp). |
| `n8n-stop` | Stop the automation stack. The `n8n_data` volume is preserved. |
| `n8n-restart` | Restart the running services, preserving the active profile. |
| `n8n-status` | Show container state, ports, and health probes. |
| `n8n-export` | Pull workflows from the local n8n instance into `apps/automation/workflows/<slug>/workflow.json`. |
| `n8n-import` | Push every `workflows/<slug>/workflow.json` back into the local n8n instance. |
| `n8n-workflow-builder` | Domain-expertise prompt for designing, building, and validating n8n workflows via `n8n-mcp` tools. Invoke whenever the user asks to build or modify a workflow. |

### Connecting to n8n-mcp

The `n8n-workflow-builder` skill assumes Claude Code is already connected to the local `n8n-mcp` server. If its tools are unavailable:

1. Ensure the `mcp` profile is running: `pnpm --filter automation n8n:ps` should show `n8n-mcp` healthy.
2. Register the MCP server with Claude Code. See **"Connecting Claude Code to the local n8n-mcp"** in [`apps/automation/README.md`](apps/automation/README.md) for the exact `claude mcp add` command and `.mcp.json` shape.
3. Remember to `export MCP_AUTH_TOKEN=...` (from `apps/automation/.env`) in the shell that launches `claude`.

## Conventions

- **`tmp/`** is gitignored local scratch (specs, plans, ad-hoc notes). Do not commit any content placed under `tmp/`.
- **`.claude/settings.json`** and **`.claude/settings.local.json`** are gitignored — they hold personal permissions, env vars, and hooks. Do not commit them.
- **`.claude/skills/**`** is committed and shared with the team.
- The team self-hosted n8n instance is **not** reachable from this repo's tooling. `n8n-export` / `n8n-import` target `http://localhost:5678` only. Team deployments are manual and out of scope for the scripts in this repo.
