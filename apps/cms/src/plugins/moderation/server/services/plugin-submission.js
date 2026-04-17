/**
 * Plugin submission service.
 *
 * Architecture choice: Option B — separate moderation content type.
 *
 * Incoming submissions are stored as `plugin::moderation.plugin-submission`
 * records and go through two independent review tracks (business + security)
 * before a moderator can promote them to a real `api::package.package` entry.
 *
 * This keeps unapproved submissions completely isolated from the live package
 * catalogue and supports full review auditability.
 */

const { runAutomatedChecks } = require("./automated-checks");
const { getPackageSecurityInfo } = require("./get-package-security-info");
const { triggerN8nWebhook } = require("./n8n-webhook");

const CONTENT_TYPE = "plugin::moderation.plugin-submission";

/**
 * Build the standard payload sent to every plugin-* lifecycle webhook.
 * Centralised so n8n workflows can rely on a stable shape across events.
 *
 * `dashboard_link` is the absolute URL to the submission in the Strapi admin.
 * Only used in INTERNAL Slack messages (#integration-marketplace) — never in
 * outbound emails to submitters. Base URL comes from CLOUD_APP_URL, which
 * Strapi Cloud injects automatically; dev falls back to localhost:1337.
 */
function buildLifecyclePayload(submission, extras = {}) {
  const adminBase = (
    process.env.CLOUD_APP_URL || "http://localhost:1337"
  ).replace(/\/$/, "");
  const adminPath = `/admin/plugins/moderation/submissions/${submission.documentId}`;
  return {
    submissionId: submission.documentId,
    submission_kind: "plugin",
    plugin_name: submission.plugin_name,
    package_location: submission.package_location || null,
    package_type: submission.package_type,
    repository_url: submission.repository_url,
    owner_name: submission.owner_name,
    owner_email: submission.owner_email,
    dashboard_link: `${adminBase}${adminPath}`,
    ...extras,
  };
}

const VALID_SCAN_STAGES = ["dependencies", "ai_analysis", "summary"];

module.exports = ({ strapi }) => ({
  /**
   * Create a new submission and immediately kick off automated checks.
   * Called by the public-facing API endpoint proxied through Next.js.
   */
  async createSubmission(data, submitterIp) {
    const submission = await strapi.documents(CONTENT_TYPE).create({
      data: {
        plugin_name: data.plugin_name,
        package_location: data.package_location || null,
        description: data.description,
        repository_url: data.repository_url,
        logo_url: data.logo_url || null,
        package_type: data.package_type || "plugin",
        categories_list: data.categories_list || [],
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        maintainers_list: data.maintainers_list || [],
        readme: data.readme || null,
        submission_notes: data.submission_notes || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submitter_ip: submitterIp || null,
        overall_status: "submitted",
        business_review_status: "pending",
        security_review_status: "pending",
        automated_check_results: null,
      },
    });

    // Run checks asynchronously so the submission response is fast.
    // Results are saved back to the record once available.
    this.runChecksAsync(submission.documentId, {
      repository_url: data.repository_url,
      package_location: data.package_location,
    }).catch((err) => {
      strapi.log.error(
        `[moderation] Async checks failed for submission ${submission.documentId}: ${err.message}`,
      );
    });

    // Fire-and-forget: notify n8n. A transient n8n failure must not block submission creation.
    triggerN8nWebhook(
      "plugin-submission-received",
      buildLifecyclePayload(submission),
      { strapi },
    );

    return submission;
  },

  /**
   * Run automated business-side checks (repo public, README, MIT license, Strapi peer dep)
   * and save results to the submission. Security scanning is NOT run here — it is driven
   * manually by a moderator via `triggerSecurityScan` to avoid running costly scans
   * (AI analysis in particular) on every submission, including potential spam.
   */
  async runChecksAsync(documentId, { repository_url, package_location }) {
    const businessChecks = await runAutomatedChecks({
      repository_url,
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

  /**
   * Trigger the n8n security-scan workflow for a submission.
   * Fire-and-forget: n8n writes per-stage results back via the content-api write-back route.
   *
   * Called by an admin action, not automatically on submission. Guarded against re-triggering
   * while a scan is already in progress.
   *
   * Fetches registry metadata up-front (reusing package-info's extract patterns) so the n8n
   * workflow does not duplicate registry lookups. When the submission points at an unsupported
   * or unpublished package, `package_info` is sent as null and n8n falls back to repo-only scan.
   */
  async triggerSecurityScan(documentId) {
    const submission = await strapi.documents(CONTENT_TYPE).findOne({
      documentId,
    });
    if (!submission) throw new Error("Submission not found.");

    if (submission.security_scan_status === "running") {
      throw new Error(
        "A security scan is already running for this submission.",
      );
    }

    await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        security_scan_status: "running",
        security_scan_started_at: new Date().toISOString(),
      },
    });

    const packageInfo = submission.package_location
      ? await getPackageSecurityInfo(submission.package_location).catch(
          () => null,
        )
      : null;

    const payload = {
      ...buildLifecyclePayload(submission),
      readme: submission.readme,
      package_info: packageInfo,
    };

    const result = await triggerN8nWebhook("security-scan", payload, {
      strapi,
    });
    if (!result.ok) {
      await strapi.documents(CONTENT_TYPE).update({
        documentId,
        data: { security_scan_status: "failed" },
      });
      throw new Error(result.error || "Failed to trigger n8n security scan.");
    }

    return { documentId, status: "running" };
  },

  /**
   * Write back a single security-scan stage result from n8n.
   * Stages: npm_advisories, dependencies, ai_analysis, summary.
   * Also accepts status transitions: 'completed' or 'failed' (with no stage result).
   */
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

  /**
   * Update review status fields for a submission.
   * Enforces the rule: overall approval requires BOTH review tracks to pass.
   */
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

    // Derive computed overall status if both review tracks have a result.
    let computedOverall = overall_status;
    if (business_review_status && security_review_status) {
      if (
        business_review_status === "approved" &&
        security_review_status === "approved"
      ) {
        // Both passed — moderator may set to approved, but keep any explicit override.
        if (!overall_status || overall_status === "under_review") {
          computedOverall = "approved";
        }
      } else if (
        business_review_status === "rejected" ||
        security_review_status === "rejected"
      ) {
        // At least one review failed — cannot be approved regardless.
        if (overall_status === "approved") {
          throw new Error(
            "Cannot approve a submission when either business or security review has been rejected.",
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
   * Promote an approved submission to a real package entry.
   * Can only be called when both review tracks have passed and overall_status is 'approved'.
   *
   * The promoted package is created in draft state. A moderator publishes it manually
   * in the content manager, giving a final human sign-off before it goes live.
   */
  async promoteToPackage(documentId) {
    const submission = await strapi.documents(CONTENT_TYPE).findOne({
      documentId,
    });

    if (!submission) {
      throw new Error("Submission not found.");
    }

    if (submission.overall_status !== "approved") {
      throw new Error("Submission must be approved before promotion.");
    }
    if (submission.business_review_status !== "approved") {
      throw new Error("Business review must be approved before promotion.");
    }
    if (submission.security_review_status !== "approved") {
      throw new Error("Security review must be approved before promotion.");
    }
    if (submission.promoted_package) {
      throw new Error("Submission has already been promoted to a package.");
    }

    // Create the package entry in draft state. Publish step is manual.
    const pkg = await strapi.documents("api::package.package").create({
      data: {
        name: submission.plugin_name,
        description: submission.description,
        repository_url: submission.repository_url,
        package_location: submission.package_location || null,
        type: submission.package_type,
        readme: submission.readme || null,
        labels: {
          official: false,
          featured: false,
          paid: false,
        },
      },
    });

    // Link the submission to the new package.
    await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: { promoted_package: { connect: [{ documentId: pkg.documentId }] } },
    });

    // Fire-and-forget: notify n8n so it can email the submitter + post to Slack.
    // Package content-type uses a `url_alias` relation (webtools plugin) for slugs,
    // which is populated out-of-band — don't guess. Pass null; n8n workflow falls back
    // to the repo URL in the email.
    triggerN8nWebhook(
      "plugin-approved",
      buildLifecyclePayload(submission, {
        package_id: pkg.documentId,
        package_slug: null,
        marketplace_link: null,
      }),
      { strapi },
    );

    return pkg;
  },

  /**
   * Mark a submission as rejected or changes-requested and store reviewer feedback.
   * Triggers the appropriate n8n workflow (TODO).
   */
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

    const lifecycleKey =
      status === "rejected" ? "plugin-declined" : "plugin-changes-requested";
    triggerN8nWebhook(
      lifecycleKey,
      buildLifecyclePayload(updated, {
        reason: reason || null,
        feedback: feedback || null,
      }),
      { strapi },
    );

    return updated;
  },

  /**
   * List submissions with optional status filter and pagination.
   */
  async listSubmissions({ status, page = 1, pageSize = 25 } = {}) {
    const filters = status ? { overall_status: { $eq: status } } : {};
    return strapi.documents(CONTENT_TYPE).findMany({
      filters,
      sort: { createdAt: "desc" },
      pagination: { page, pageSize },
    });
  },

  /**
   * List submissions whose security scan is stuck in 'running' past a cutoff.
   * Consumed by the n8n scan-timeout-sweeper workflow. Content-api + API-token
   * guarded so the sweeper does not need an admin session.
   */
  async listStaleScans({ cutoff }) {
    if (!cutoff) return [];
    return strapi.documents(CONTENT_TYPE).findMany({
      filters: {
        security_scan_status: { $eq: "running" },
        security_scan_started_at: { $lt: cutoff },
      },
      fields: ["documentId", "plugin_name", "security_scan_started_at"],
      pagination: { page: 1, pageSize: 50 },
    });
  },

  /**
   * Fetch a single submission by documentId.
   */
  async getSubmission(documentId) {
    return strapi.documents(CONTENT_TYPE).findOne({ documentId });
  },
});
