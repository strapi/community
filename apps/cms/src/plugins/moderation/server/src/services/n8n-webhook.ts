/**
 * The moderation plugin's n8n webhooks — the helper itself is shared, see
 * src/lib/n8n-webhook.ts. The security-scan path is fixed per namespace
 * (security scanning is not a configurable content-type webhook — it always
 * applies to api::package.package), but shares the N8N_WEBHOOK_NAMESPACE
 * prefix so duplicate workflow sets on a shared n8n instance (e.g. staging vs
 * production) don't collide.
 */
import {
  getWebhookUrl,
  N8N_WEBHOOK_NS,
  triggerN8nWebhook as triggerSharedN8nWebhook,
} from "../../../../../lib/n8n-webhook";

export const SECURITY_SCAN_PATH = `${N8N_WEBHOOK_NS}/security-scan`;

/** The shared helper, logging under `[moderation]`. */
const triggerN8nWebhook = (
  path: string,
  payload: object,
  options: Parameters<typeof triggerSharedN8nWebhook>[2] = {},
) =>
  triggerSharedN8nWebhook(path, payload, { label: "moderation", ...options });

export { getWebhookUrl, triggerN8nWebhook };
