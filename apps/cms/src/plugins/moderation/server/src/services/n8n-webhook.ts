/**
 * n8n webhook helper.
 *
 * Centralises URL construction + POST mechanics for every lifecycle event the
 * moderation plugin emits into n8n. Flipping `N8N_WEBHOOK_MODE` between
 * `production` and `test` toggles all webhooks between n8n's always-on prod URL
 * (`/webhook/<path>`) and the developer-only test URL (`/webhook-test/<path>`,
 * active only while "Listen for test event" is open in the n8n UI).
 *
 * Failures are logged and surfaced via the returned object — NOT thrown — so
 * callers can decide whether a lifecycle webhook failure should block the user's
 * action (security-scan does block) or be fire-and-forget (notifications don't).
 */

/**
 * Registry of webhook keys → n8n webhook paths.
 * Keep paths aligned with the `path` parameter on each workflow's Webhook node
 * under apps/automation/workflows/{slug}/workflow.json.
 */
const WEBHOOK_PATHS: Record<string, string> = {
  "security-scan": "strapi/security-scan",
  "plugin-submission-received": "strapi/plugin-submission-received",
  "plugin-approved": "strapi/plugin-approved",
  "plugin-declined": "strapi/plugin-declined",
  "plugin-changes-requested": "strapi/plugin-changes-requested",
  "template-submission-received": "strapi/template-submission-received",
  "template-approved": "strapi/template-approved",
  "template-declined": "strapi/template-declined",
};

function getWebhookUrl(key: string) {
  const base = process.env.N8N_WEBHOOK_BASE_URL;
  const mode = (process.env.N8N_WEBHOOK_MODE || "production").toLowerCase();
  const path = WEBHOOK_PATHS[key];

  if (!base) {
    throw new Error(
      "N8N_WEBHOOK_BASE_URL is not configured; cannot call n8n webhooks.",
    );
  }
  if (!path) {
    throw new Error(
      `Unknown webhook key '${key}'. Known keys: ${Object.keys(WEBHOOK_PATHS).join(", ")}.`,
    );
  }
  if (mode !== "production" && mode !== "test") {
    throw new Error(
      `Invalid N8N_WEBHOOK_MODE '${mode}'. Must be 'production' or 'test'.`,
    );
  }

  const prefix = mode === "test" ? "webhook-test" : "webhook";
  return `${base.replace(/\/$/, "")}/${prefix}/${path}`;
}

/**
 * POST a payload to the named n8n webhook. Returns `{ ok, url, error? }` —
 * never throws, so callers control failure behaviour.
 */
async function triggerN8nWebhook(
  key,
  payload,
  { strapi }: { strapi?: { log?: { warn?: (msg: string) => void } } } = {},
) {
  let url: string;
  try {
    url = getWebhookUrl(key);
  } catch (err) {
    strapi?.log?.warn?.(`[moderation] ${err.message}`);
    return { ok: false, error: err.message };
  }

  const authHeader = process.env.N8N_WEBHOOK_AUTH_HEADER || "X-N8N-Auth";
  const authValue = process.env.N8N_WEBHOOK_AUTH_VALUE;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authValue ? { [authHeader]: authValue } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const error = `n8n webhook '${key}' returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`;
      strapi?.log?.warn?.(`[moderation] ${error}`);
      return { ok: false, url, error };
    }
    return { ok: true, url };
  } catch (err) {
    const error = `n8n webhook '${key}' fetch failed: ${err.message}`;
    strapi?.log?.warn?.(`[moderation] ${error}`);
    return { ok: false, url, error };
  }
}

export { getWebhookUrl, triggerN8nWebhook, WEBHOOK_PATHS };
