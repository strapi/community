# roadmap-sync

Mirrors the public slice of the Notion **Product Roadmap** into
`api::roadmap-item`, which `apps/web` renders at `/roadmap`.

It also keeps `api::release` in step with GitHub (`ROADMAP_RELEASES_REPO`,
default `strapi/strapi`): the 12 latest published releases plus every open
milestone whose title is a version. Items join to a release through Notion's
existing **Version & date (Release)** property (`v5.61.1` → `5.61.1`). A version
that isn't on GitHub yet still shows on the item and is listed in the digest.

Nothing is inferred. The sync copies what a person wrote and ticked in Notion,
maps the internal status to a public one through a fixed table, and adds
facts it can check (Canny votes, GitHub issue/PR state).

## When it runs

- Nightly at 03:00 (server time). Monday's run also posts the needs-attention
  digest to Slack through n8n (`<namespace>/roadmap-needs-attention`).
- On demand: `POST /api/roadmap-sync/run` with header
  `X-Roadmap-Sync-Secret: $ROADMAP_SYNC_SECRET`. Send `{"report": true}` to
  get the digest too.
- A failed run, or one that trips a safety guard, always posts to Slack.

With no `NOTION_API_TOKEN` / `NOTION_DATA_SOURCE_ID` the plugin does nothing.

## Notion setup (Phase 0)

Create these properties on the Product Roadmap with exactly these names:

| Property | Type | Notes |
| --- | --- | --- |
| `Public title` | Text | Required to publish. Becomes the item's link slug (`/roadmap?item=<slug>`). |
| `GitHub links` | Text | Any number of URLs, separated by spaces, commas or new lines. |
| `Docs link` | URL | Optional. |
| `Public review date` | Date | Items not reviewed in 60 days show up as stale in the digest. |

`Public description`, `Public Roadmap`, `Status`, `When?`, `Delivery Quarter`,
`Squad`, `Tags` and `Canny Link` already exist and are read as they are.
Share the database with the integration that owns `NOTION_API_TOKEN`.
`NOTION_DATA_SOURCE_ID` is the **data source** id, not the database id.

## What gets published

An item is live only when all of these hold:

- `Public Roadmap` is ticked.
- `Public title` and `Public description` are filled in.
- `Status` maps to a public status. `Paused`, or a status missing from the
  table in `lib/rules.ts`, keeps it hidden.
- No link is dead (404/410, or a Canny link to a post that doesn't exist).

A link that can't be checked this run (rate limit, outage) won't take a new
item live, and won't take a live item down either.

Items that fail any of these stay as drafts and are listed in the digest.
Nothing is ever deleted. Unticking an item unpublishes it, and the entry and
its URL survive. If Notion returns no ticked rows at all while items are live,
the sync leaves them up and reports it. That pattern usually means a revoked
share, not a deliberate wipe.

Slugs follow the public title until an item is first published, then never
change.

| Notion `Status` | Public status |
| --- | --- |
| Not started, In product discovery, In tech discovery | Exploring |
| Ready to dev, In delivery - on track, In delivery - late | In progress |
| In Beta Release | Beta |
| Done | Shipped |
| Paused | not published |

## Tests

`pnpm --filter cms test` runs the pure rules (`lib/rules.test.ts`) with
Node's built-in test runner.
