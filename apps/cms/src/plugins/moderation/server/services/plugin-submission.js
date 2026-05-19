/**
 * Package submission service.
 *
 * Submissions create a draft api::package.package record directly.
 * Moderation fields (overall_status, review statuses, scan results) live on Package.
 * Approval = publish the draft. No data copy needed.
 * See docs/adr/0001-moderation-fields-on-package-not-intermediary.md.
 */

const { runAutomatedChecks } = require("./automated-checks");
const { getPackageSecurityInfo } = require("./get-package-security-info");
const { triggerN8nWebhook } = require("./n8n-webhook");

const CONTENT_TYPE = "api::package.package";

/**
 * Find a Better Auth user by email, or create a minimal record.
 * Blocking — caller must await this before creating the Package.
 */
async function findOrCreateUser(strapi, { email, name }) {
  const existing = await strapi.documents("plugin::better-auth.user").findMany({
    filters: { email: { $eq: email } },
    pagination: { pageSize: 1 },
  });

  if (existing?.length > 0) return existing[0].documentId;

  const created = await strapi
    .documents("plugin::better-auth.user")
    .create({ data: { email, name } });

  return created.documentId;
}

/**
 * Resolve an array of { email, name } maintainer objects to Better Auth user documentIds.
 */
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

/**
 * Resolve category name strings to package-category documentIds.
 * Unknown categories are silently dropped — Package schema is the authority.
 */
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

const VALID_SCAN_STAGES = ["dependencies", "ai_analysis", "summary"];

module.exports = ({ strapi }) => ({
  /**
   * Create a draft Package from a public submission.
   * Owner and maintainers are resolved to Better Auth users (blocking).
   */
  async createSubmission(data, submitterIp) {
    // Resolve owner (blocking — required relation)
    const ownerDocumentId = await findOrCreateUser(strapi, {
      email: data.owner_email,
      name: data.owner_name,
    });

    // Resolve maintainers
    const maintainerIds = await resolveMaintainers(
      strapi,
      data.maintainers_list || [],
    );

    // Resolve categories
    const categoryConnect = await resolveCategories(
      strapi,
      data.categories_list || [],
    );

    const pkg = await strapi.documents(CONTENT_TYPE).create({
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
        // Moderation fields
        overall_status: "submitted",
        business_review_status: "pending",
        security_review_status: "pending",
        submitter_ip: submitterIp || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submission_notes: data.submission_notes || null,
      },
    });

    // Run business checks async — do not block the response
    this.runChecksAsync(pkg.documentId, {
      git_repository: data.repository_url,
      package_location: data.package_location,
    }).catch((err) => {
      strapi.log.error(
        `[moderation] Async checks failed for ${pkg.documentId}: ${err.message}`,
      );
    });

    // Fire-and-forget n8n notification
    triggerN8nWebhook(
      "plugin-submission-received",
      buildLifecyclePayload(pkg),
      { strapi },
    );

    return pkg;
  },

  async runChecksAsync(documentId, { git_repository, package_location }) {
    const businessChecks = await runAutomatedChecks({
      repository_url: git_repository,
      package_location,
    }).catch(() => null);

    await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        automated_check_results: businessChecks,
        overall_status: "under_review",
      },
    });
  },

  async triggerSecurityScan(documentId) {
    const pkg = await strapi.documents(CONTENT_TYPE).findOne({ documentId });
    if (!pkg) throw new Error("Package not found.");
    if (pkg.security_scan_status === "running") {
      throw new Error("A security scan is already running for this package.");
    }

    await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        security_scan_status: "running",
        security_scan_started_at: new Date().toISOString(),
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
      await strapi.documents(CONTENT_TYPE).update({
        documentId,
        data: { security_scan_status: "failed" },
      });
      throw new Error(result.error || "Failed to trigger n8n security scan.");
    }

    return { documentId, status: "running" };
  },

  async updateSecurityScanResult(documentId, { stage, result, status }) {
    if (stage && !VALID_SCAN_STAGES.includes(stage)) {
      throw new Error(
        `Invalid scan stage '${stage}'. Expected one of: ${VALID_SCAN_STAGES.join(", ")}.`,
      );
    }

    const data = {};
    if (stage === "dependencies")
      data.security_scan_dependencies = result ?? null;
    if (stage === "ai_analysis")
      data.security_scan_ai_analysis = result ?? null;
    if (stage === "summary") data.security_scan_summary = result ?? null;

    if (status === "completed" || status === "failed") {
      data.security_scan_status = status;
      data.security_scan_run_at = new Date().toISOString();
    }

    if (Object.keys(data).length === 0) {
      throw new Error("No stage result or status transition provided.");
    }

    return strapi.documents(CONTENT_TYPE).update({ documentId, data });
  },

  async updateReview(documentId, reviewData) {
    const {
      business_review_status,
      security_review_status,
      reviewer_feedback,
      rejection_reason,
      business_review_notes,
      security_review_notes,
      overall_status,
    } = reviewData;

    let computedOverall = overall_status;
    if (business_review_status && security_review_status) {
      if (
        business_review_status === "approved" &&
        security_review_status === "approved"
      ) {
        if (!overall_status || overall_status === "under_review")
          computedOverall = "approved";
      } else if (
        business_review_status === "rejected" ||
        security_review_status === "rejected"
      ) {
        if (overall_status === "approved") {
          throw new Error(
            "Cannot approve when either review track is rejected.",
          );
        }
      }
    }

    return strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        ...(business_review_status && { business_review_status }),
        ...(security_review_status && { security_review_status }),
        ...(reviewer_feedback !== undefined && { reviewer_feedback }),
        ...(rejection_reason !== undefined && { rejection_reason }),
        ...(business_review_notes !== undefined && { business_review_notes }),
        ...(security_review_notes !== undefined && { security_review_notes }),
        ...(computedOverall && { overall_status: computedOverall }),
      },
    });
  },

  /**
   * Approve a submission by publishing the draft Package.
   * No data copy — the draft IS the package.
   */
  async publishPackage(documentId) {
    const pkg = await strapi
      .documents(CONTENT_TYPE)
      .findOne({ documentId, status: "draft" });
    if (!pkg) throw new Error("Package not found.");
    if (pkg.overall_status !== "approved")
      throw new Error("Package must be approved before publishing.");

    const published = await strapi
      .documents(CONTENT_TYPE)
      .publish({ documentId });

    triggerN8nWebhook(
      "plugin-approved",
      buildLifecyclePayload(pkg, { package_slug: published.slug }),
      { strapi },
    );

    return published;
  },

  async rejectOrRequestChanges(documentId, { status, reason, feedback }) {
    if (!["rejected", "changes_requested"].includes(status)) {
      throw new Error("Status must be 'rejected' or 'changes_requested'.");
    }

    const updated = await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        overall_status: status,
        rejection_reason: reason || null,
        reviewer_feedback: feedback || null,
      },
    });

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

  async listSubmissions({ status, page = 1, pageSize = 25 } = {}) {
    const baseFilter = {
      overall_status: status
        ? { $eq: status }
        : { $in: ["submitted", "under_review", "changes_requested"] },
    };
    return strapi.documents(CONTENT_TYPE).findMany({
      filters: baseFilter,
      sort: { createdAt: "desc" },
      pagination: { page, pageSize },
      status: "draft",
    });
  },

  async listStaleScans({ cutoff }) {
    if (!cutoff) return [];
    return strapi.documents(CONTENT_TYPE).findMany({
      filters: {
        security_scan_status: { $eq: "running" },
        security_scan_started_at: { $lt: cutoff },
      },
      fields: ["documentId", "name", "security_scan_started_at"],
      pagination: { page: 1, pageSize: 50 },
      status: "draft",
    });
  },

  async getSubmission(documentId) {
    return strapi
      .documents(CONTENT_TYPE)
      .findOne({ documentId, status: "draft" });
  },
});
