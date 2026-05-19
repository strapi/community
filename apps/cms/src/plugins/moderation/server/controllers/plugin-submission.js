/**
 * Plugin submission controller.
 *
 * Exposes two sets of endpoints:
 *  - content-api: public-facing submission endpoint (called through Next.js proxy)
 *  - admin: moderation endpoints for super admins
 */

const service = (strapi) =>
  strapi.plugin("moderation").service("plugin-submission");

module.exports = ({ strapi }) => ({
  /**
   * POST /api/moderation/packages/submit
   * Accepts a new plugin submission from the public.
   * Called by the Next.js proxy, never directly from the browser.
   */
  async create(ctx) {
    const body = ctx.request.body?.data || ctx.request.body;

    const required = [
      "plugin_name",
      "description",
      "repository_url",
      "owner_name",
      "owner_email",
    ];
    const missing = required.filter((f) => !body[f]?.toString().trim());
    if (missing.length > 0) {
      return ctx.badRequest(`Missing required fields: ${missing.join(", ")}`);
    }

    if (!body.submitter_agreed_to_terms) {
      return ctx.badRequest("You must agree to the terms before submitting.");
    }

    const submitterIp =
      ctx.request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      ctx.request.ip ||
      null;

    try {
      const submission = await service(strapi).createSubmission(
        body,
        submitterIp,
      );
      ctx.created({ data: { documentId: submission.documentId } });
    } catch (err) {
      strapi.log.error(`[moderation] Submission create error: ${err.message}`);
      ctx.internalServerError("Failed to create submission.");
    }
  },

  /**
   * GET /moderation/submissions
   * List all plugin submissions (admin only).
   */
  async find(ctx) {
    const { status, page, pageSize } = ctx.query;
    const submissions = await service(strapi).listSubmissions({
      status,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
    });
    ctx.body = { data: submissions };
  },

  /**
   * GET /moderation/submissions/:documentId
   * Fetch a single submission (admin only).
   */
  async findOne(ctx) {
    const { documentId } = ctx.params;
    const submission = await service(strapi).getSubmission(documentId);
    if (!submission) return ctx.notFound("Submission not found.");
    ctx.body = { data: submission };
  },

  /**
   * PUT /moderation/submissions/:documentId/review
   * Update review status fields on a submission (admin only).
   */
  async updateReview(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body;

    try {
      const updated = await service(strapi).updateReview(documentId, body);
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * POST /moderation/submissions/:documentId/publish
   * Publish an approved draft Package (admin only).
   */
  async publish(ctx) {
    const { documentId } = ctx.params;

    try {
      const pkg = await service(strapi).publishPackage(documentId);
      ctx.body = { data: pkg };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * POST /moderation/submissions/:documentId/decide
   * Reject a submission or request changes (admin only).
   */
  async decide(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body;
    const { status, reason, feedback } = body;

    try {
      const updated = await service(strapi).rejectOrRequestChanges(documentId, {
        status,
        reason,
        feedback,
      });
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * POST /moderation/submissions/:documentId/run-security-scan
   * Manually trigger the n8n security-scan workflow for a submission (admin only).
   * Manual rather than automatic on submit to avoid burning LLM spend on spam submissions.
   */
  async runSecurityScan(ctx) {
    const { documentId } = ctx.params;
    try {
      const result = await service(strapi).triggerSecurityScan(documentId);
      ctx.body = { data: result };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * GET /api/moderation/packages/stale-scans?cutoff=<ISO timestamp>
   * Content-api + API-token: returns packages whose scan has been
   * 'running' since before `cutoff`. Consumed by the n8n scan-timeout-sweeper.
   */
  async listStaleScans(ctx) {
    const { cutoff } = ctx.query;
    if (!cutoff) return ctx.badRequest("cutoff query param is required");
    try {
      const results = await service(strapi).listStaleScans({ cutoff });
      ctx.body = { data: results };
    } catch (err) {
      ctx.internalServerError(err.message);
    }
  },

  /**
   * POST /api/moderation/packages/:documentId/security-scan-result
   * Called by n8n (with a Strapi API token) to write back per-stage scan results.
   */
  async updateSecurityScan(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body;
    const { stage, result, status } = body || {};

    try {
      const updated = await service(strapi).updateSecurityScanResult(
        documentId,
        { stage, result, status },
      );
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },
});
