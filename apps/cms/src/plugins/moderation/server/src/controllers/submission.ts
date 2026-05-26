import type { ModerationContentTypeConfig } from "../config";

const svc = (strapi) => strapi.plugin("moderation").service("submission");

export default ({ strapi }) => ({
  // ── Config ───────────────────────────────────────────────────────────────

  /** GET /moderation/config — returns configured content types for the admin UI */
  async getConfig(ctx) {
    ctx.body = { data: svc(strapi).getAllConfigs() };
  },

  // ── Submission creation (content-api) ───────────────────────────────────

  /** POST /api/moderation/:plural/submit */
  async create(ctx) {
    const { plural } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound(`No content type configured for '${plural}'`);
    }

    const body = ctx.request.body?.data ?? ctx.request.body;

    if (!body?.submitter_agreed_to_terms) {
      return ctx.badRequest("You must agree to the terms before submitting.");
    }

    const submitterIp =
      ctx.request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      ctx.request.ip ||
      null;

    try {
      const submission = await svc(strapi).createSubmission(
        ctConfig.uid,
        body,
        submitterIp,
      );
      ctx.created({ data: { documentId: submission.documentId } });
    } catch (err) {
      strapi.log.error(
        `[moderation] Submission create error: ${(err as Error).message}`,
      );
      ctx.internalServerError("Failed to create submission.");
    }
  },

  // ── Admin list / detail ──────────────────────────────────────────────────

  /** GET /moderation/:plural/submissions */
  async find(ctx) {
    const { plural } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound();
    }

    const { status, page, pageSize } = ctx.query as Record<string, string>;
    const submissions = await svc(strapi).listSubmissions(ctConfig.uid, {
      status,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
    });
    ctx.body = { data: submissions };
  },

  /** GET /moderation/:plural/submissions/:documentId */
  async findOne(ctx) {
    const { plural, documentId } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound();
    }

    const submission = await svc(strapi).getSubmission(
      ctConfig.uid,
      documentId,
    );
    if (!submission) return ctx.notFound("Submission not found.");
    ctx.body = { data: submission };
  },

  // ── Review actions (admin) ───────────────────────────────────────────────

  /** PUT /moderation/:plural/submissions/:documentId/review */
  async updateReview(ctx) {
    const { plural, documentId } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound();
    }

    const body = ctx.request.body?.data ?? ctx.request.body;
    try {
      await svc(strapi).updateReview(ctConfig.uid, documentId, body);
      ctx.body = { data: { ok: true } };
    } catch (err) {
      ctx.badRequest((err as Error).message);
    }
  },

  /** POST /moderation/:plural/submissions/:documentId/publish */
  async publish(ctx) {
    const { plural, documentId } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound();
    }

    try {
      const result = await svc(strapi).publish(ctConfig.uid, documentId);
      ctx.body = { data: result };
    } catch (err) {
      ctx.badRequest((err as Error).message);
    }
  },

  /** POST /moderation/:plural/submissions/:documentId/decide */
  async decide(ctx) {
    const { plural, documentId } = ctx.params;
    let ctConfig: ModerationContentTypeConfig | null;
    try {
      ctConfig = svc(strapi).getConfigByPlural(plural);
    } catch {
      return ctx.notFound();
    }

    const body = ctx.request.body?.data ?? ctx.request.body;
    const { status, reason, feedback } = body ?? {};

    try {
      const updated = await svc(strapi).decide(ctConfig.uid, documentId, {
        status,
        reason,
        feedback,
      });
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest((err as Error).message);
    }
  },

  // ── Security scan (admin) — hardcoded to api::package.package ───────────

  /** POST /moderation/:plural/submissions/:documentId/run-security-scan */
  async runSecurityScan(ctx) {
    const { documentId } = ctx.params;
    try {
      const result = await svc(strapi).triggerSecurityScan(documentId);
      ctx.body = { data: result };
    } catch (err) {
      ctx.badRequest((err as Error).message);
    }
  },

  // ── Security scan callbacks (content-api) ───────────────────────────────

  /** POST /api/moderation/:plural/:documentId/security-scan-result */
  async updateSecurityScan(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body?.data ?? ctx.request.body;
    const { stage, result, status } = body ?? {};

    try {
      const updated = await svc(strapi).updateSecurityScanResult(documentId, {
        stage,
        result,
        status,
      });
      ctx.body = { data: updated };
    } catch (err) {
      ctx.badRequest((err as Error).message);
    }
  },

  /** GET /api/moderation/:plural/stale-scans?cutoff=<ISO> */
  async listStaleScans(ctx) {
    const { cutoff } = ctx.query as { cutoff?: string };
    if (!cutoff) return ctx.badRequest("cutoff query param is required");
    try {
      const results = await svc(strapi).listStaleScans({ cutoff });
      ctx.body = { data: results };
    } catch (err) {
      ctx.internalServerError((err as Error).message);
    }
  },
});
