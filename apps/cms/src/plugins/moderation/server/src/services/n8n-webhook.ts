/**
 * n8n webhook helper.
 *
 * Accepts webhook paths directly (e.g. "strapi/plugin-submission-received").
 * Paths come from the plugin config's `webhooks` object per content type.
 * The SECURITY_SCAN_PATH constant is hardcoded because security scanning is
 * not configurable — it always applies to api::package.package.
 *
 * Flipping N8N_WEBHOOK_MODE between 'production' and 'test' toggles all
 * webhooks between n8n's always-on prod URL (/webhook/<path>) and the
 * developer-only test URL (/webhook-test/<path>).
 */

export const SECURITY_SCAN_PATH = "strapi/security-scan";

function getWebhookUrl(path: string) {
  const base = process.env.N8N_WEBHOOK_BASE_URL;
  const mode = (process.env.N8N_WEBHOOK_MODE || "production").toLowerCase();

  if (!base) {
    throw new Error(
      "N8N_WEBHOOK_BASE_URL is not configured; cannot call n8n webhooks.",
    );
  }
  if (!path) {
    throw new Error("Webhook path is required.");
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
 * POST a payload to an n8n webhook path. Returns `{ ok, url, error? }` —
 * never throws, so callers control failure behaviour.
 */
async function triggerN8nWebhook(
  path: string,
  payload: object,
  { strapi }: { strapi?: { log?: { warn?: (msg: string) => void } } } = {},
) {
  let url: string;
  try {
    url = getWebhookUrl(path);
  } catch (err) {
    strapi?.log?.warn?.(`[moderation] ${(err as Error).message}`);
    return { ok: false, error: (err as Error).message };
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
      const error = `n8n webhook '${path}' returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`;
      strapi?.log?.warn?.(`[moderation] ${error}`);
      return { ok: false, url, error };
    }
    return { ok: true, url };
  } catch (err) {
    const error = `n8n webhook '${path}' fetch failed: ${(err as Error).message}`;
    strapi?.log?.warn?.(`[moderation] ${error}`);
    return { ok: false, url: url!, error };
  }
}

export { getWebhookUrl, triggerN8nWebhook };
