/**
 * Package submission service.
 *
 * Submissions create a draft api::package.package record directly.
 * Moderation is tracked via plugin::moderation.business-review (oneToOne)
 * and plugin::moderation.security-review (oneToMany, latest = current scan).
 * Approval = publish the draft. No data copy needed.
 * See docs/adr/0002-review-content-types-in-moderation-plugin.md.
 */

import { auth } from "../../../../../lib/auth";
import { runAutomatedChecks } from "./automated-checks";
import { getPackageSecurityInfo } from "./get-package-security-info";
import { triggerN8nWebhook } from "./n8n-webhook";

const PACKAGE_CT = "api::package.package";
const BUSINESS_REVIEW_CT = "plugin::moderation.business-review";
const SECURITY_REVIEW_CT = "plugin::moderation.security-review";

const VALID_SCAN_STAGES = ["dependencies", "ai_analysis", "summary"];

/**
 * Find a Better Auth user by email, or create one via the BA API.
 * Document Service is used for lookups only — never for creating BA users.
 */
async function findOrCreateUser(strapi, { email, name }) {
  const existing = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { email: { $eq: email } },
    pagination: { pageSize: 1 },
  });

  if (existing?.length > 0) return existing[0].documentId;

  await auth.api.signUpEmail({
    body: { email, name, password: crypto.randomUUID() },
  });

  const created = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { email: { $eq: email } },
    pagination: { pageSize: 1 },
  });

  return created[0]?.documentId ?? null;
}

async function resolveMaintainers(strapi, maintainersList) {
  if (!Array.isArray(maintainersList) || maintainersList.length === 0)
    return [];
  const ids = await Promise.all(
    maintainersList
      .filter((m) => m?.email)
      .map((m) =>
        findOrCreateUser(strapi, { email: m.email, name: m.name || m.email }),
      ),
  );
  return ids.filter(Boolean);
}

async function resolveCategories(strapi, categoryNames) {
  if (!Array.isArray(categoryNames) || categoryNames.length === 0) return [];
  const results = await strapi
    .documents("api::package-category.package-category")
    .findMany({
      filters: { name: { $in: categoryNames } },
      pagination: { pageSize: 100 },
    });
  return (results ?? []).map((c) => ({ documentId: c.documentId }));
}

function buildLifecyclePayload(pkg, extras = {}) {
  const adminBase = (
    process.env.CLOUD_APP_URL || "http://localhost:1337"
  ).replace(/\/$/, "");
  return {
    packageId: pkg.documentId,
    submission_kind: "plugin",
    name: pkg.name,
    package_location: pkg.package_location || null,
    type: pkg.type,
    git_repository: pkg.git_repository,
    dashboard_link: `${adminBase}/admin/content-manager/collection-types/api::package.package/${pkg.documentId}`,
    ...extras,
  };
}

export default ({ strapi }) => ({
  /**
   * Create a draft Package from a public submission.
   * Creates a BusinessReview record and connects it to the Package.
   */
  async createSubmission(data, submitterIp) {
    const ownerDocumentId = await findOrCreateUser(strapi, {
      email: data.owner_email,
      name: data.owner_name,
    });
    const maintainerIds = await resolveMaintainers(
      strapi,
      data.maintainers_list || [],
    );
    const categoryConnect = await resolveCategories(
      strapi,
      data.categories_list || [],
    );

    // Create BusinessReview first so we can connect it during Package creation.
    const businessReview = await strapi.documents(BUSINESS_REVIEW_CT).create({
      data: { status: "pending" },
    });

    const pkg = await strapi.documents(PACKAGE_CT).create({
      data: {
        name: data.plugin_name,
        description: data.description,
        git_repository: data.repository_url,
        package_location: data.package_location || null,
        type: data.package_type || "plugin",
        readme: data.readme || null,
        labels: { official: false, featured: false, paid: false },
        owner: {
          connect: [
            { documentId: ownerDocumentId, __type: "plugin::better-auth.user" },
          ],
        },
        maintainers: {
          connect: maintainerIds.map((id) => ({ documentId: id })),
        },
        categories: { connect: categoryConnect },
        ...(data.logo_documentId
          ? { icon: { connect: [{ documentId: data.logo_documentId }] } }
          : {}),
        business_review: {
          connect: [{ documentId: businessReview.documentId }],
        },
        overall_status: "submitted",
        submitter_ip: submitterIp || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submission_notes: data.submission_notes || null,
      },
    });

    this.runChecksAsync(pkg.documentId, businessReview.documentId, {
      git_repository: data.repository_url,
      package_location: data.package_location,
    }).catch((err) => {
      strapi.log.error(
        `[moderation] Async checks failed for ${pkg.documentId}: ${err.message}`,
      );
    });

    triggerN8nWebhook(
      "plugin-submission-received",
      buildLifecyclePayload(pkg),
      { strapi },
    );
    return pkg;
  },

  async runChecksAsync(
    packageDocumentId,
    businessReviewDocumentId,
    { git_repository, package_location },
  ) {
    const businessChecks = await runAutomatedChecks({
      repository_url: git_repository,
      package_location,
    }).catch(() => null);

    await strapi.documents(BUSINESS_REVIEW_CT).update({
      documentId: businessReviewDocumentId,
      data: { automated_check_results: businessChecks },
    });

    await strapi.documents(PACKAGE_CT).update({
      documentId: packageDocumentId,
      data: { overall_status: "under_review" },
    });
  },

  async triggerSecurityScan(packageDocumentId) {
    const pkg = await strapi
      .documents(PACKAGE_CT)
      .findOne({ documentId: packageDocumentId, status: "draft" });
    if (!pkg) throw new Error("Package not found.");

    // Create a new SecurityReview record for this scan run.
    // The manyToOne `package` relation on SecurityReview connects it to the Package.
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
      "security-scan",
      {
        ...buildLifecyclePayload(pkg),
        readme: pkg.readme,
        package_info: packageInfo,
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

  async updateSecurityScanResult(packageDocumentId, { stage, result, status }) {
    if (stage && !VALID_SCAN_STAGES.includes(stage)) {
      throw new Error(
        `Invalid scan stage '${stage}'. Expected one of: ${VALID_SCAN_STAGES.join(", ")}.`,
      );
    }

    // Find the latest SecurityReview for this package via the back-relation.
    const reviews = await strapi.documents(SECURITY_REVIEW_CT).findMany({
      filters: { package: { documentId: { $eq: packageDocumentId } } },
      sort: { createdAt: "desc" },
      pagination: { pageSize: 1 },
    });
    const review = reviews[0];
    if (!review) throw new Error("No security review found for this package.");

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

  async updateReview(packageDocumentId, reviewData) {
    const {
      business_review_status,
      reviewer_feedback,
      rejection_reason,
      notes,
      overall_status,
    } = reviewData;

    const pkg = await strapi.documents(PACKAGE_CT).findOne({
      documentId: packageDocumentId,
      populate: ["business_review"],
      status: "draft",
    });
    if (!pkg?.business_review)
      throw new Error("No business review found for this package.");

    await strapi.documents(BUSINESS_REVIEW_CT).update({
      documentId: (pkg.business_review as { documentId: string }).documentId,
      data: {
        ...(business_review_status && { status: business_review_status }),
        ...(reviewer_feedback !== undefined && { reviewer_feedback }),
        ...(rejection_reason !== undefined && { rejection_reason }),
        ...(notes !== undefined && { notes }),
      },
    });

    if (overall_status) {
      await strapi.documents(PACKAGE_CT).update({
        documentId: packageDocumentId,
        data: { overall_status },
      });
    }
  },

  /**
   * Approve a submission by publishing the draft Package.
   */
  async publishPackage(packageDocumentId) {
    const pkg = await strapi.documents(PACKAGE_CT).findOne({
      documentId: packageDocumentId,
      status: "draft",
    });
    if (!pkg) throw new Error("Package not found.");
    if (pkg.overall_status !== "approved")
      throw new Error("Package must be approved before publishing.");

    const published = await strapi
      .documents(PACKAGE_CT)
      .publish({ documentId: packageDocumentId });

    triggerN8nWebhook(
      "plugin-approved",
      buildLifecyclePayload(pkg, { package_slug: published.slug }),
      { strapi },
    );

    return published;
  },

  async rejectOrRequestChanges(
    packageDocumentId,
    { status, reason, feedback },
  ) {
    if (!["rejected", "changes_requested"].includes(status)) {
      throw new Error("Status must be 'rejected' or 'changes_requested'.");
    }

    const pkg = await strapi.documents(PACKAGE_CT).findOne({
      documentId: packageDocumentId,
      status: "draft",
      populate: ["business_review"],
    });
    if (!pkg) throw new Error("Package not found.");

    const updated = await strapi.documents(PACKAGE_CT).update({
      documentId: packageDocumentId,
      data: { overall_status: status },
    });

    if (pkg.business_review) {
      await strapi.documents(BUSINESS_REVIEW_CT).update({
        documentId: (pkg.business_review as { documentId: string }).documentId,
        data: {
          status: status === "rejected" ? "rejected" : "changes_requested",
          ...(reason && { rejection_reason: reason }),
          ...(feedback && { reviewer_feedback: feedback }),
        },
      });
    }

    triggerN8nWebhook(
      status === "rejected" ? "plugin-declined" : "plugin-changes-requested",
      buildLifecyclePayload(updated, {
        reason: reason || null,
        feedback: feedback || null,
      }),
      { strapi },
    );

    return updated;
  },

  async listSubmissions({
    status,
    page = 1,
    pageSize = 25,
  }: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const baseFilter = {
      overall_status: status
        ? { $eq: status }
        : { $in: ["submitted", "under_review", "changes_requested"] },
    };
    return strapi.documents(PACKAGE_CT).findMany({
      filters: baseFilter,
      sort: { createdAt: "desc" },
      pagination: { page, pageSize },
      status: "draft",
      populate: ["business_review"],
    });
  },

  /**
   * Returns running SecurityReview records that started before `cutoff`.
   * Populates `package` so n8n knows which package each stale scan belongs to.
   */
  async listStaleScans({ cutoff }) {
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

  async getSubmission(packageDocumentId) {
    return strapi.documents(PACKAGE_CT).findOne({
      documentId: packageDocumentId,
      status: "draft",
      populate: ["business_review", "security_reviews"],
    });
  },
});
