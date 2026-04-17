/**
 * Template submission service.
 *
 * Templates have a simple single-track review: submitted → approved | rejected.
 * There are no automated checks and no two-track review process.
 *
 * Feedback to the submitter is delivered via n8n workflows (see TODO comments).
 */

const { triggerN8nWebhook } = require("./n8n-webhook");

const CONTENT_TYPE = "plugin::moderation.template-submission";

const VALID_SCAN_STAGES = ["dependencies", "ai_analysis", "summary"];

function buildLifecyclePayload(submission, extras = {}) {
  const adminBase = (
    process.env.CLOUD_APP_URL || "http://localhost:1337"
  ).replace(/\/$/, "");
  const adminPath = `/admin/plugins/moderation/template-submissions/${submission.documentId}`;
  return {
    submissionId: submission.documentId,
    submission_kind: "template",
    template_name: submission.template_name,
    repository_url: submission.repository_url,
    demo_url: submission.demo_url || null,
    owner_name: submission.owner_name,
    owner_email: submission.owner_email,
    dashboard_link: `${adminBase}${adminPath}`,
    ...extras,
  };
}

module.exports = ({ strapi }) => ({
  /**
   * Create a new template submission.
   * Called by the public-facing API endpoint proxied through Next.js.
   */
  async createSubmission(data, submitterIp) {
    const submission = await strapi.documents(CONTENT_TYPE).create({
      data: {
        template_name: data.template_name,
        description: data.description,
        repository_url: data.repository_url,
        demo_url: data.demo_url || null,
        logo_url: data.logo_url || null,
        categories_list: data.categories_list || [],
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        submission_notes: data.submission_notes || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submitter_ip: submitterIp || null,
        overall_status: "submitted",
      },
    });

    triggerN8nWebhook(
      "template-submission-received",
      buildLifecyclePayload(submission),
      { strapi },
    );

    return submission;
  },

  /**
   * Update review fields on a template submission (notes, feedback, status).
   * Used for saving draft review state without finalising the decision.
   */
  async updateReview(documentId, reviewData) {
    const {
      overall_status,
      reviewer_feedback,
      reviewer_notes,
      rejection_reason,
    } = reviewData;

    if (
      overall_status &&
      !["submitted", "approved", "rejected"].includes(overall_status)
    ) {
      throw new Error("Invalid overall_status value.");
    }

    return strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        ...(overall_status && { overall_status }),
        ...(reviewer_feedback !== undefined && { reviewer_feedback }),
        ...(reviewer_notes !== undefined && { reviewer_notes }),
        ...(rejection_reason !== undefined && { rejection_reason }),
      },
    });
  },

  /**
   * Approve or reject a template submission.
   * Triggers the appropriate n8n workflow (TODO).
   */
  async decide(documentId, { status, feedback, notes, reason }) {
    if (!["approved", "rejected"].includes(status)) {
      throw new Error("Status must be 'approved' or 'rejected'.");
    }

    const updated = await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        overall_status: status,
        reviewer_feedback: feedback || null,
        reviewer_notes: notes || null,
        rejection_reason: reason || null,
      },
    });

    triggerN8nWebhook(
      status === "approved" ? "template-approved" : "template-declined",
      buildLifecyclePayload(updated, {
        reason: reason || null,
        feedback: feedback || null,
        notes: notes || null,
      }),
      { strapi },
    );

    return updated;
  },

  /**
   * List template submissions with optional status filter and pagination.
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
   * Consumed by the n8n scan-timeout-sweeper workflow.
   */
  async listStaleScans({ cutoff }) {
    if (!cutoff) return [];
    return strapi.documents(CONTENT_TYPE).findMany({
      filters: {
        security_scan_status: { $eq: "running" },
        security_scan_started_at: { $lt: cutoff },
      },
      fields: ["documentId", "template_name", "security_scan_started_at"],
      pagination: { page: 1, pageSize: 50 },
    });
  },

  /**
   * Fetch a single template submission by documentId.
   */
  async getSubmission(documentId) {
    return strapi.documents(CONTENT_TYPE).findOne({ documentId });
  },

  /**
   * Trigger the n8n security-scan workflow for a template submission.
   * Templates are repo-only (no published artifact); `package_info` is always null
   * in the webhook payload, and the workflow falls back to repo + AI-only analysis.
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

    const payload = {
      ...buildLifecyclePayload(submission),
      plugin_name: submission.template_name,
      package_location: null,
      readme: submission.description,
      package_info: null,
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
   * Stages: dependencies, ai_analysis, summary.
   * Also accepts status transitions: 'completed' or 'failed' (with no stage result).
   *
   * Templates do not have a separate npm_advisories stage (no registry artifact).
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
});
