/**
 * Template submission service.
 *
 * Templates have a simple single-track review: submitted → approved | rejected.
 * There are no automated checks and no two-track review process.
 *
 * Feedback to the submitter is delivered via n8n workflows (see TODO comments).
 */

const CONTENT_TYPE = "plugin::moderation.template-submission";

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

    // TODO: Trigger n8n "template submission received" workflow here.
    // Example: await triggerN8nWorkflow('template-submission-received', {
    //   submissionId: submission.documentId,
    //   ownerEmail: data.owner_email,
    //   templateName: data.template_name,
    // });

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

    if (status === "approved") {
      // TODO: Trigger n8n "template approved" workflow.
      // Example: await triggerN8nWorkflow('template-submission-approved', {
      //   submissionId: documentId,
      //   ownerEmail: updated.owner_email,
      //   templateName: updated.template_name,
      // });
    } else {
      // TODO: Trigger n8n "template rejected" workflow.
      // Example: await triggerN8nWorkflow('template-submission-rejected', {
      //   submissionId: documentId,
      //   ownerEmail: updated.owner_email,
      //   reason,
      //   feedback,
      // });
    }

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
   * Fetch a single template submission by documentId.
   */
  async getSubmission(documentId) {
    return strapi.documents(CONTENT_TYPE).findOne({ documentId });
  },
});
