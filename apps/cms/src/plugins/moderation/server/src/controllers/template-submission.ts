/**
 * Template submission controller.
 *
 * Exposes two sets of endpoints:
 *  - content-api: public-facing submission endpoint (called through Next.js proxy)
 *  - admin: moderation endpoints for super admins
 */

const service = (strapi) =>
  strapi.plugin("moderation").service("template-submission");

export default ({ strapi }) => ({
  /**
   * POST /api/moderation/templates/submit
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
   * GET /api/moderation/template-submissions
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
   * GET /api/moderation/template-submissions/:documentId
   * Fetch a single template submission (admin only).
   */
  async findOne(ctx) {
    const { documentId } = ctx.params;
    const submission = await service(strapi).getSubmission(documentId);
    if (!submission) return ctx.notFound("Submission not found.");
    ctx.body = { data: submission };
  },

  /**
   * PUT /api/moderation/template-submissions/:documentId/review
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
   * POST /api/moderation/template-submissions/:documentId/publish
   * Publish an approved template submission (admin only).
   */
  async publish(ctx) {
    const { documentId } = ctx.params;
    try {
      const result = await service(strapi).publishTemplate(documentId);
      ctx.body = { data: result };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  /**
   * POST /api/moderation/template-submissions/:documentId/decide
   * Reject or request changes on a template submission (admin only).
   */
  async decide(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data || ctx.request.body;
    const { status, feedback, reason } = body;

    try {
      const updated = await service(strapi).rejectOrRequestChanges(documentId, {
        status,
        feedback,
        reason,
      });
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },
});
