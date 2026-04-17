/**
 * Template submission controller.
 *
 * Exposes two sets of endpoints:
 *  - content-api: public-facing submission endpoint (called through Next.js proxy)
 *  - admin: moderation endpoints for super admins
 */

const service = (strapi) =>
  strapi.plugin("moderation").service("template-submission");

module.exports = ({ strapi }) => ({
  /**
   * POST /api/moderation/template-submissions
   * Accepts a new template submission from the public.
   * Called by the Next.js proxy, never directly from the browser.
   */
  async create(ctx) {
    const body = ctx.request.body?.data || ctx.request.body;

    const required = [
      "template_name",
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
      strapi.log.error(
        `[moderation] Template submission create error: ${err.message}`,
      );
      ctx.internalServerError("Failed to create submission.");
    }
  },

  /**
   * GET /moderation/template-submissions
   * List all template submissions (admin only).
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
   * GET /moderation/template-submissions/:documentId
   * Fetch a single template submission (admin only).
   */
  async findOne(ctx) {
    const { documentId } = ctx.params;
    const submission = await service(strapi).getSubmission(documentId);
    if (!submission) return ctx.notFound("Submission not found.");
    ctx.body = { data: submission };
  },

  /**
   * PUT /moderation/template-submissions/:documentId/review
   * Save draft review fields (admin only).
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
   * POST /moderation/template-submissions/:documentId/decide
   * Approve or reject a template submission (admin only).
   */
  async decide(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body;
    const { status, feedback, notes, reason } = body;

    try {
      const updated = await service(strapi).decide(documentId, {
        status,
        feedback,
        notes,
        reason,
      });
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * POST /moderation/template-submissions/:documentId/run-security-scan
   * Manually trigger the n8n security-scan workflow for a template submission (admin only).
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
   * GET /api/moderation/template-submissions/stale-scans?cutoff=<ISO timestamp>
   * Content-api + API-token: returns template submissions whose scan has been
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
   * POST /api/moderation/template-submissions/:documentId/security-scan-result
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
