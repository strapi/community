# Community Hub automation — n8n workflows

These workflows power moderation automation. Strapi emits lifecycle webhooks → n8n
orchestrates developer emails (SendGrid), Slack notifications, and the security scan,
and calls back into Strapi for scan results.

> **Per-instance setup.** Staging and production each run their **own** copy of these
> workflows in their own n8n instance. Credentials, base URLs, the webhook shared
> secret, and the internal workflow IDs are **not** shared — set them on each instance.

## 1. Import

- **n8n UI:** Workflows → *Import from File* for each `workflows/<slug>/workflow.json`.
  Import **`render-email (shared sub-workflow)`** first.
- **Script:** `N8N_URL=https://<instance> N8N_API_KEY=<key> pnpm --filter automation run workflows:import`
  (matches by name, updates in place).

### After import: re-link by-ID references (required)
n8n regenerates workflow IDs per instance, so two references go dangling — fix them once:
- The **`Send Developer Email`** node in the 7 lifecycle workflows → re-select the imported **render-email**.
- Each workflow's **Settings → Error Workflow** → re-select the imported **error-handler**.

## 2. n8n credentials (bound in the UI, per instance)

There are **no n8n environment variables** — the Strapi token lives in a credential.

| Credential | Type | Value | Bound to (nodes) |
|---|---|---|---|
| **Strapi API** | HTTP Header Auth | `Authorization` = `Bearer <Strapi API token>` | the **9 Strapi HTTP nodes**: render-email *Fetch Template*; security-scan *PATCH Scan/AI/Summary*; scan-timeout-sweeper *Find Stale ×2 + Mark Failed*; cleanup *Fetch Stale + Strip Label* |
| **n8n Webhook Auth** | HTTP Header Auth | `X-N8N-Auth` = `<shared secret>` | the **8 webhook trigger nodes**: plugin/template `submission-received` `approved` `declined`, plugin `changes-requested`, `security-scan`. Must equal Strapi `N8N_WEBHOOK_AUTH_VALUE` (see §4). |
| **SendGrid** | SendGrid API | n8n SendGrid key (community@strapi.io account) | render-email *Send via SendGrid* |
| **Slack** | Slack API (bot token) | bot token for `#integration-marketplace` | the **6 Slack notify nodes**: plugin/template `submission-received` + `approved`, scan-timeout-sweeper, error-handler |
| **Anthropic** | Anthropic API (predefined) | your Anthropic API key | security-scan *Claude Haiku Security Analysis* (node uses *Predefined Credential Type → Anthropic*) |

> The two Header Auth credentials are different keys (`Authorization` vs `X-N8N-Auth`)
> as is the Anthropic one (`x-api-key`) — create all three separately.

## 3. n8n per-node base URLs

The 9 Strapi HTTP nodes default to `http://localhost:1337`. Set each to this instance's
Strapi base URL (not a secret; edit per instance).

## 4. Strapi environment variables (per instance)

| Variable | Value |
|---|---|
| `N8N_WEBHOOK_BASE_URL` | this instance's n8n base URL |
| `N8N_WEBHOOK_MODE` | `production` (uses the always-on `/webhook/...` paths; workflows must be **active**) |
| `N8N_WEBHOOK_AUTH_HEADER` | `X-N8N-Auth` |
| `N8N_WEBHOOK_AUTH_VALUE` | the shared secret — must equal the **n8n Webhook Auth** credential value (§2) |
| `CLOUD_APP_URL` | Strapi admin URL (builds `dashboard_link` in Slack messages; auto-set on Strapi Cloud) |
| `SENDGRID_API_KEY` | Strapi-native email only (password resets / admin invites) — **separate** from n8n's SendGrid key |
| `EMAIL_DEFAULT_FROM` / `EMAIL_DEFAULT_REPLY_TO` | default `community@strapi.io` |

Also generate a **Strapi API token** (admin → Settings → API Tokens; full-access for first
bring-up) — paste it into the **Strapi API** n8n credential (§2). It needs read on
`email-template` and access to the `moderation` content-API routes
(`/:plural/:documentId/security-scan-result`, `/:plural/stale-scans`).

## 5. Activate

Activate the 8 webhook workflows + **render-email**. Activate `scan-timeout-sweeper` and
`cleanup-new-label-after-60d` (schedule-triggered) when you want the crons running.

## Notes / gotchas

- **Node versions:** HTTP Request nodes are pinned to `typeVersion 4.2` so they render on
  older n8n. If a node shows *"install this node / from a newer version of n8n,"* the
  instance is older than that node version — lower the `typeVersion` to match.
- **`approved` requires a publishable record:** publishing a package/template needs `slug`
  (and `description` for packages) set first, or the publish 400s and the `approved`
  webhook never fires. Reviewers set these before approving.
- **Webhook paths** are fixed per workflow (`strapi/plugin-submission-received`, …,
  `strapi/security-scan`) and mirrored in the CMS moderation plugin config.
