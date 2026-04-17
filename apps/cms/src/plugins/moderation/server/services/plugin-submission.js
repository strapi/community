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
const { runSecurityChecks } = require("./security-checks");

const CONTENT_TYPE = "plugin::moderation.plugin-submission";

module.exports = ({ strapi }) => ({
  /**
   * Create a new submission and immediately kick off automated checks.
   * Called by the public-facing API endpoint proxied through Next.js.
   */
  async createSubmission(data, submitterIp) {
    const submission = await strapi.documents(CONTENT_TYPE).create({
      data: {
        plugin_name: data.plugin_name,
        npm_package_name: data.npm_package_name || null,
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
      npm_package_name: data.npm_package_name,
      plugin_name: data.plugin_name,
    }).catch((err) => {
      strapi.log.error(
        `[moderation] Async checks failed for submission ${submission.documentId}: ${err.message}`,
      );
    });

    // TODO: Trigger n8n "submission received" workflow here.
    // Example: await triggerN8nWorkflow('plugin-submission-received', { submissionId: submission.documentId });

    return submission;
  },

  /**
   * Run all automated and security checks, then save results to the submission.
   * Called internally after creation; not exposed as a public endpoint.
   */
  async runChecksAsync(
    documentId,
    { repository_url, npm_package_name, plugin_name },
  ) {
    const [businessChecks, securityChecks] = await Promise.allSettled([
      runAutomatedChecks({ repository_url, npm_package_name }),
      runSecurityChecks({ repository_url, npm_package_name, plugin_name }),
    ]);

    const automated =
      businessChecks.status === "fulfilled" ? businessChecks.value : null;
    const security =
      securityChecks.status === "fulfilled" ? securityChecks.value : null;

    const combined = {
      ...(automated || {}),
      checks: {
        ...(automated?.checks || {}),
        security: security || {},
      },
    };

    await strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        automated_check_results: combined,
        overall_status: "under_review",
      },
    });
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
        package_location: submission.npm_package_name || null,
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

    // TODO: Trigger n8n "submission approved" workflow here.
    // Example: await triggerN8nWorkflow('plugin-submission-approved', {
    //   submissionId: documentId,
    //   packageId: pkg.documentId,
    //   ownerEmail: submission.owner_email,
    // });

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

    if (status === "rejected") {
      // TODO: Trigger n8n "submission rejected" workflow.
      // Example: await triggerN8nWorkflow('plugin-submission-rejected', {
      //   submissionId: documentId,
      //   ownerEmail: updated.owner_email,
      //   reason,
      // });
    } else {
      // TODO: Trigger n8n "changes requested" workflow.
      // Example: await triggerN8nWorkflow('plugin-submission-changes-requested', {
      //   submissionId: documentId,
      //   ownerEmail: updated.owner_email,
      //   feedback,
      // });
    }

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
   * Fetch a single submission by documentId.
   */
  async getSubmission(documentId) {
    return strapi.documents(CONTENT_TYPE).findOne({ documentId });
  },
});
