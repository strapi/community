# Marketplace Analytics

A server-only local plugin that exposes marketplace analytics as tools on
Strapi's native MCP server (`POST /mcp`, enabled in `config/server.ts`). It
mirrors the way `@strapi-community/plugin-better-auth-dashboard` registers its
Better Auth tools via `strapi.ai.mcp.registerTool`.

## Tools

| Tool | What it returns |
| --- | --- |
| `marketplace_submission_stats` | Submission counts (plugins + templates) by content type and moderation `overall_status`. Optional `type` / `since`. |
| `marketplace_submissions_graph` | Submissions over time (`daily` / `weekly` / `monthly`), new + cumulative per bucket. Optional `type`. |
| `marketplace_partner_signup_stats` | Partner sign-up counts: total partners, signed-up (have an owner) vs pending, broken down by partner level. |
| `marketplace_partner_signups_graph` | Partner sign-ups over time (`daily` / `weekly` / `monthly`), new + cumulative per bucket. |

## What counts as a submission

Every package (`api::package.package`) and template (`api::template.template`)
is a submission. Counts use the **draft** version of each document, so entries
still under review (unpublished) are included and each submission is counted
once. Moderation state comes from the `overall_status` field the moderation
plugin injects (`submitted`, `under_review`, `changes_requested`, `rejected`,
`approved`).

## What counts as a partner sign-up

A **partner sign-up** is a partner organization (`partner: true` on
`plugin::better-auth.organization`) that has at least one **owner** — a
`plugin::better-auth.member` row with `role: "owner"` for that organization.

This single rule covers both intended cases:

- a **new** partner created together with an owner, and
- an **existing** partner that previously had no owner and later gains one.

Both reduce to the same current-state fact — the partner now has an owner — and
every such organization necessarily transitioned from zero owners to one at some
point. The sign-up is **dated** by the earliest owner-membership's `createdAt`,
which drives the time-series graph.

### Known limitations (derived from current state)

There is no dedicated event log, so these figures are computed from the live
data. As a result they cannot:

- see a partner whose owner was later **removed** (it drops back to "pending"), or
- confirm the `partner` flag was already set at the exact moment the owner was
  first added.

For the "how many partners have an owner" question these edges don't matter. If
precise, immutable event attribution is ever needed, add lifecycle hooks on
`member` creation / organization creation that write to an audit collection and
point the tools at that instead.

## Access control

All tools are gated behind the `plugin::marketplace-analytics.analytics.read`
RBAC action ("Marketplace Analytics → Read" in **Settings → Roles**). An MCP
client authenticates with an admin API token whose role holds that permission.

Toggle registration with the plugin's `mcp.enabled` config in
`config/plugins.ts`.
