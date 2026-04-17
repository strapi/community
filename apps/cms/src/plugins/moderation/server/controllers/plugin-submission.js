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
   * POST /api/moderation/plugin-submissions
   * Accepts a new plugin submission from the public.
   * Called by the Next.js proxy, never directly from the browser.
   */
  async create(ctx) {
    const body = ctx.request.body?.data || ctx.request.body;

    const required = [
      "plugin_name",
      "description",
      "git_repository",
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
   * POST /moderation/submissions/:documentId/promote
   * Promote an approved submission to a real package entry (admin only).
   */
  async promote(ctx) {
    const { documentId } = ctx.params;

    try {
      const pkg = await service(strapi).promoteToPackage(documentId);
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
});
