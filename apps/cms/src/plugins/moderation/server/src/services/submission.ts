import { auth } from "../../../../../lib/auth";
import type { ModerationContentTypeConfig } from "../config";
import { runAutomatedChecks } from "./automated-checks";
import { getPackageSecurityInfo } from "./get-package-security-info";
import { SECURITY_SCAN_PATH, triggerN8nWebhook } from "./n8n-webhook";

const BUSINESS_REVIEW_CT = "plugin::moderation.business-review";
const SECURITY_REVIEW_CT = "plugin::moderation.security-review";
const PACKAGE_UID = "api::package.package";
const VALID_SCAN_STAGES = ["dependencies", "ai_analysis", "summary"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findOrCreateUser(strapi, { email, name }) {
  const existing = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { email: { $eq: email } },
    pagination: { pageSize: 1 },
  });
  if (existing?.length > 0) return existing[0].id;

  try {
    await auth.api.signUpEmail({
      body: { email, name, password: crypto.randomUUID() },
    });
  } catch (err) {
    // Email sending may fail in local dev (no email provider configured).
    // Better Auth creates the user record before sending — check the DB anyway.
    strapi.log.warn(
      `[moderation] signUpEmail for ${email} failed (${(err as Error)?.message}) — checking if user was created`,
    );
  }

  const created = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { email: { $eq: email } },
    pagination: { pageSize: 1 },
  });
  return created[0]?.id ?? null;
}

function buildAdminLink(uid: string, documentId: string) {
  const adminBase = (
    process.env.CLOUD_APP_URL || "http://localhost:1337"
  ).replace(/\/$/, "");
  return `${adminBase}/admin/content-manager/collection-types/${uid}/${documentId}`;
}

/** Coarse submission kind used by n8n for labels/routing. */
function kindForUid(uid: string) {
  if (uid === PACKAGE_UID) return "package";
  if (uid === "api::template.template") return "template";
  if (uid === "api::showcase.showcase") return "showcase";
  return uid.split(".").pop() ?? uid;
}

/** Read the human-readable name from an entity, respecting per-CT nameField config. */
function getEntityName(
  entity: Record<string, unknown>,
  ctConfig: ModerationContentTypeConfig,
): string | null {
  const field = ctConfig.nameField ?? "name";
  return (entity[field] as string) ?? null;
}

/** Pull recipient contact off a populated `owner` relation (better-auth user). */
function ownerContact(entity: Record<string, unknown>) {
  const owner = entity.owner as { email?: string; name?: string } | null;
  return {
    owner_email: owner?.email ?? null,
    owner_name: owner?.name ?? owner?.email ?? null,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export default ({ strapi }) => {
  function getCtConfigs(): ModerationContentTypeConfig[] {
    return strapi.plugin("moderation").config("contentTypes") ?? [];
  }

  function getConfigByUid(uid: string): ModerationContentTypeConfig {
    const found = getCtConfigs().find((c) => c.uid === uid);
    if (!found)
      throw new Error(`[moderation] No config for content type '${uid}'`);
    return found;
  }

  function getConfigByPlural(plural: string): ModerationContentTypeConfig {
    const found = getCtConfigs().find((c) => c.pluralName === plural);
    if (!found) {
      throw new Error(
        `[moderation] No content type configured with pluralName '${plural}'`,
      );
    }
    return found;
  }

  return {
    getAllConfigs() {
      const configs = getCtConfigs();
      return configs.map((c) => ({
        uid: c.uid,
        singularName: c.singularName,
        pluralName: c.pluralName,
        label: c.label ?? c.pluralName,
        checks: c.checks ?? [],
        hasSecurityScan: c.uid === PACKAGE_UID,
      }));
    },

    getConfigByPlural,

    // ── Submission creation ──────────────────────────────────────────────────

    async createSubmission(
      uid: string,
      rawBody: Record<string, unknown>,
      submitterIp: string | null,
    ) {
      const ctConfig = getConfigByUid(uid);

      // Create the BusinessReview record first so we can link it
      const businessReview = await strapi.documents(BUSINESS_REVIEW_CT).create({
        data: { status: "pending" },
      });

      // Resolve owner user
      let owner: object | null = null;
      if (rawBody.owner_email) {
        const ownerId = await findOrCreateUser(strapi, {
          email: rawBody.owner_email,
          name: rawBody.owner_name || rawBody.owner_email,
        });
        if (ownerId) {
          owner = { id: ownerId, __type: "plugin::better-auth.user" };
        }
      }

      // Resolve categories (optional, requires categoryUid in config)
      let categories: object[] = [];
      if (ctConfig.categoryUid && Array.isArray(rawBody.categories_list)) {
        const results = await strapi.documents(ctConfig.categoryUid).findMany({
          filters: { name: { $in: rawBody.categories_list } },
          pagination: { pageSize: 100 },
        });
        categories = (results ?? []).map((c) => ({ documentId: c.documentId }));
      }

      // Build entity data — strip meta fields, apply defaults, attach relations
      const META_FIELDS = new Set([
        "owner_email",
        "owner_name",
        "categories_list",
      ]);
      const entityData: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(rawBody)) {
        if (!META_FIELDS.has(key)) entityData[key] = val;
      }

      const entity = await strapi.documents(uid).create({
        data: {
          ...(ctConfig.defaultFieldValues ?? {}),
          ...entityData,
          owner,
          categories,
          business_review: {
            connect: [{ documentId: businessReview.documentId }],
          },
          overall_status: "submitted",
          submitter_ip: submitterIp ?? null,
          submitter_agreed_to_terms: rawBody.submitter_agreed_to_terms === true,
          submission_notes: rawBody.submission_notes ?? null,
        },
      });

      // Run configured checks asynchronously
      if (ctConfig.checks && ctConfig.checks.length > 0) {
        this.runChecksAsync(
          uid,
          entity.documentId,
          businessReview.documentId,
          entity,
          ctConfig,
        ).catch((err) => {
          strapi.log.error(
            `[moderation] Async checks failed for ${entity.documentId}: ${err.message}`,
          );
        });
      }

      // Fire submission-received webhook
      if (ctConfig.webhooks?.submissionReceived) {
        triggerN8nWebhook(
          ctConfig.webhooks.submissionReceived,
          {
            documentId: entity.documentId,
            contentType: uid,
            kind: kindForUid(uid),
            name: getEntityName(entity, ctConfig),
            git_repository: entity.git_repository ?? null,
            owner_email: (rawBody.owner_email as string) ?? null,
            owner_name:
              (rawBody.owner_name as string) ??
              (rawBody.owner_email as string) ??
              null,
            dashboard_link: buildAdminLink(uid, entity.documentId),
          },
          { strapi },
        );
      }

      return entity;
    },

    async runChecksAsync(
      uid: string,
      documentId: string,
      businessReviewId: string,
      entity: Record<string, unknown>,
      ctConfig: ModerationContentTypeConfig,
    ) {
      const checksResult = await runAutomatedChecks({
        repository_url: entity.git_repository as string | undefined,
        package_location: entity.package_location as string | undefined,
        enabledChecks: ctConfig.checks,
      }).catch(() => null);

      await strapi.documents(BUSINESS_REVIEW_CT).update({
        documentId: businessReviewId,
        data: { automated_check_results: checksResult },
      });

      await strapi.documents(uid).update({
        documentId,
        data: { overall_status: "under_review" },
      });
    },

    // ── Security scan (hardcoded to api::package.package) ───────────────────

    async triggerSecurityScan(packageDocumentId: string) {
      const pkg = await strapi
        .documents(PACKAGE_UID)
        .findOne({ documentId: packageDocumentId, status: "draft" });
      if (!pkg) throw new Error("Package not found.");

      const securityReview = await strapi.documents(SECURITY_REVIEW_CT).create({
        data: {
          status: "running",
          started_at: new Date().toISOString(),
          package: { connect: [{ documentId: packageDocumentId }] },
        },
      });

      const packageInfo = pkg.package_location
        ? await getPackageSecurityInfo(pkg.package_location).catch(() => null)
        : null;

      const result = await triggerN8nWebhook(
        SECURITY_SCAN_PATH,
        {
          packageId: packageDocumentId,
          name: pkg.name,
          package_location: pkg.package_location,
          git_repository: pkg.git_repository,
          readme: pkg.readme,
          package_info: packageInfo,
          dashboard_link: buildAdminLink(PACKAGE_UID, packageDocumentId),
        },
        { strapi },
      );

      if (!result.ok) {
        await strapi.documents(SECURITY_REVIEW_CT).update({
          documentId: securityReview.documentId,
          data: { status: "failed" },
        });
        throw new Error(result.error || "Failed to trigger n8n security scan.");
      }

      return {
        packageDocumentId,
        securityReviewDocumentId: securityReview.documentId,
        status: "running",
      };
    },

    async updateSecurityScanResult(
      packageDocumentId: string,
      {
        stage,
        result,
        status,
      }: { stage?: string; result?: unknown; status?: string },
    ) {
      if (stage && !VALID_SCAN_STAGES.includes(stage)) {
        throw new Error(
          `Invalid scan stage '${stage}'. Expected one of: ${VALID_SCAN_STAGES.join(", ")}.`,
        );
      }

      const reviews = await strapi.documents(SECURITY_REVIEW_CT).findMany({
        filters: { package: { documentId: { $eq: packageDocumentId } } },
        sort: { createdAt: "desc" },
        pagination: { pageSize: 1 },
      });
      const review = reviews[0];
      if (!review)
        throw new Error("No security review found for this package.");

      const data: Record<string, unknown> = {};
      if (stage === "dependencies") data.dependencies = result ?? null;
      if (stage === "ai_analysis") data.ai_analysis = result ?? null;
      if (stage === "summary") data.summary = result ?? null;
      if (status === "completed" || status === "failed") {
        data.status = status;
        data.run_at = new Date().toISOString();
      }

      if (Object.keys(data).length === 0) {
        throw new Error("No stage result or status transition provided.");
      }

      return strapi
        .documents(SECURITY_REVIEW_CT)
        .update({ documentId: review.documentId, data });
    },

    async listStaleScans({ cutoff }: { cutoff: string }) {
      if (!cutoff) return [];
      return strapi.documents(SECURITY_REVIEW_CT).findMany({
        filters: {
          status: { $eq: "running" },
          started_at: { $lt: cutoff },
        },
        fields: ["documentId", "started_at"],
        populate: ["package"],
        pagination: { page: 1, pageSize: 50 },
      });
    },

    // ── Review workflow ──────────────────────────────────────────────────────

    async updateReview(
      uid: string,
      documentId: string,
      reviewData: Record<string, unknown>,
    ) {
      const {
        business_review_status,
        reviewer_feedback,
        rejection_reason,
        notes,
        overall_status,
      } = reviewData as Record<string, string | undefined>;

      const entity = await strapi.documents(uid).findOne({
        documentId,
        populate: ["business_review"],
        status: "draft",
      });
      if (!entity?.business_review) {
        throw new Error("No business review found for this submission.");
      }

      await strapi.documents(BUSINESS_REVIEW_CT).update({
        documentId: (entity.business_review as { documentId: string })
          .documentId,
        data: {
          ...(business_review_status && { status: business_review_status }),
          ...(reviewer_feedback !== undefined && { reviewer_feedback }),
          ...(rejection_reason !== undefined && { rejection_reason }),
          ...(notes !== undefined && { notes }),
        },
      });

      if (overall_status) {
        await strapi.documents(uid).update({
          documentId,
          data: { overall_status },
        });
      }
    },

    async publish(uid: string, documentId: string) {
      const ctConfig = getConfigByUid(uid);

      const entity = await strapi
        .documents(uid)
        .findOne({ documentId, status: "draft", populate: ["owner"] });
      if (!entity) throw new Error("Submission not found.");
      if (entity.overall_status !== "approved") {
        throw new Error("Submission must be approved before publishing.");
      }

      const published = await strapi.documents(uid).publish({ documentId });

      if (ctConfig.webhooks?.approved) {
        triggerN8nWebhook(
          ctConfig.webhooks.approved,
          {
            documentId,
            contentType: uid,
            kind: kindForUid(uid),
            name: getEntityName(entity, ctConfig),
            slug: published.slug ?? null,
            ...ownerContact(entity),
            dashboard_link: buildAdminLink(uid, documentId),
          },
          { strapi },
        );
      }

      return published;
    },

    async decide(
      uid: string,
      documentId: string,
      {
        status,
        reason,
        feedback,
      }: { status: string; reason?: string; feedback?: string },
    ) {
      if (!["rejected", "changes_requested"].includes(status)) {
        throw new Error("Status must be 'rejected' or 'changes_requested'.");
      }

      const ctConfig = getConfigByUid(uid);

      const entity = await strapi.documents(uid).findOne({
        documentId,
        status: "draft",
        populate: ["business_review", "owner"],
      });
      if (!entity) throw new Error("Submission not found.");

      const updated = await strapi.documents(uid).update({
        documentId,
        data: { overall_status: status },
      });

      if (entity.business_review) {
        await strapi.documents(BUSINESS_REVIEW_CT).update({
          documentId: (entity.business_review as { documentId: string })
            .documentId,
          data: {
            status: status === "rejected" ? "rejected" : "changes_requested",
            ...(reason && { rejection_reason: reason }),
            ...(feedback && { reviewer_feedback: feedback }),
          },
        });
      }

      const webhookPath =
        status === "rejected"
          ? ctConfig.webhooks?.declined
          : ctConfig.webhooks?.changesRequested;

      if (webhookPath) {
        triggerN8nWebhook(
          webhookPath,
          {
            documentId,
            contentType: uid,
            kind: kindForUid(uid),
            name: getEntityName(entity, ctConfig),
            reason: reason ?? null,
            feedback: feedback ?? null,
            ...ownerContact(entity),
            dashboard_link: buildAdminLink(uid, documentId),
          },
          { strapi },
        );
      }

      return updated;
    },

    async listSubmissions(
      uid: string,
      {
        status,
        page = 1,
        pageSize = 25,
      }: { status?: string; page?: number; pageSize?: number } = {},
    ) {
      const baseFilter = {
        overall_status: status
          ? { $eq: status }
          : { $in: ["submitted", "under_review", "changes_requested"] },
      };
      return strapi.documents(uid).findMany({
        filters: baseFilter,
        sort: { createdAt: "desc" },
        pagination: { page, pageSize },
        status: "draft",
        populate: ["business_review"],
      });
    },

    async getSubmission(uid: string, documentId: string) {
      const populate =
        uid === PACKAGE_UID
          ? ["business_review", "security_reviews"]
          : ["business_review"];
      return strapi.documents(uid).findOne({
        documentId,
        status: "draft",
        populate,
      });
    },
  };
};
