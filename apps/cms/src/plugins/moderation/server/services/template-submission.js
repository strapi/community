/**
 * Template submission service.
 *
 * Submissions create a draft api::template.template record directly.
 * Moderation fields (overall_status, review statuses) live on Template.
 * Approval = publish the draft. No data copy needed.
 */

const { triggerN8nWebhook } = require("./n8n-webhook");

const CONTENT_TYPE = "api::template.template";

/**
 * Find a Better Auth user by email, or create a minimal record.
 * Blocking — caller must await this before creating the Template.
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
 * Resolve category name strings to template-category documentIds.
 * Unknown categories are silently dropped — Template schema is the authority.
 */
async function resolveCategories(strapi, categoryNames) {
  if (!Array.isArray(categoryNames) || categoryNames.length === 0) return [];
  const results = await strapi
    .documents("api::template-category.template-category")
    .findMany({
      filters: { name: { $in: categoryNames } },
      pagination: { pageSize: 100 },
    });
  return (results ?? []).map((c) => ({ documentId: c.documentId }));
}

function buildLifecyclePayload(template, extras = {}) {
  const adminBase = (
    process.env.CLOUD_APP_URL || "http://localhost:1337"
  ).replace(/\/$/, "");
  return {
    templateId: template.documentId,
    submission_kind: "template",
    name: template.name,
    git_repository: template.git_repository,
    preview_link: template.preview_link || null,
    dashboard_link: `${adminBase}/admin/content-manager/collection-types/api::template.template/${template.documentId}`,
    ...extras,
  };
}

module.exports = ({ strapi }) => ({
  /**
   * Create a draft Template from a public submission.
   * Owner is resolved to a Better Auth user (blocking).
   */
  async createSubmission(data, submitterIp) {
    // Resolve owner (blocking — required relation)
    const ownerDocumentId = await findOrCreateUser(strapi, {
      email: data.owner_email,
      name: data.owner_name,
    });

    // Resolve categories
    const categoryConnect = await resolveCategories(
      strapi,
      data.categories_list || [],
    );

    const template = await strapi.documents(CONTENT_TYPE).create({
      data: {
        name: data.template_name,
        description: data.description,
        git_repository: data.repository_url,
        preview_link: data.demo_url || null,
        readme: data.readme || null,
        labels: { official: false, featured: false, paid: false },
        owner: {
          connect: [
            { documentId: ownerDocumentId, __type: "plugin::better-auth.user" },
          ],
        },
        categories: { connect: categoryConnect },
        ...(data.logo_documentId
          ? {
              preview_image: {
                connect: [{ documentId: data.logo_documentId }],
              },
            }
          : {}),
        // Moderation fields
        overall_status: "submitted",
        business_review_status: "pending",
        submitter_ip: submitterIp || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submission_notes: data.submission_notes || null,
      },
    });

    // Fire-and-forget n8n notification
    triggerN8nWebhook(
      "template-submission-received",
      buildLifecyclePayload(template),
      { strapi },
    );

    return template;
  },

  /**
   * Approve a submission by publishing the draft Template.
   * No data copy — the draft IS the template.
   */
  async publishTemplate(documentId) {
    const template = await strapi
      .documents(CONTENT_TYPE)
      .findOne({ documentId });
    if (!template) throw new Error("Template not found.");
    if (template.overall_status !== "approved")
      throw new Error("Template must be approved before publishing.");

    const published = await strapi
      .documents(CONTENT_TYPE)
      .publish({ documentId });

    triggerN8nWebhook(
      "template-approved",
      buildLifecyclePayload(template, { template_slug: published.slug }),
      { strapi },
    );

    return published;
  },

  /**
   * Update review fields on a template submission (notes, feedback, status).
   * Used for saving draft review state without finalising the decision.
   */
  async updateReview(documentId, reviewData) {
    const {
      business_review_status,
      reviewer_feedback,
      rejection_reason,
      business_review_notes,
      overall_status,
    } = reviewData;

    return strapi.documents(CONTENT_TYPE).update({
      documentId,
      data: {
        ...(business_review_status && { business_review_status }),
        ...(reviewer_feedback !== undefined && { reviewer_feedback }),
        ...(rejection_reason !== undefined && { rejection_reason }),
        ...(business_review_notes !== undefined && { business_review_notes }),
        ...(overall_status && { overall_status }),
      },
    });
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
      status === "rejected"
        ? "template-declined"
        : "template-changes-requested",
      buildLifecyclePayload(updated, {
        reason: reason || null,
        feedback: feedback || null,
      }),
      { strapi },
    );

    return updated;
  },

  /**
   * List template submissions with optional status filter and pagination.
   */
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

  /**
   * Fetch a single template submission by documentId.
   */
  async getSubmission(documentId) {
    return strapi
      .documents(CONTENT_TYPE)
      .findOne({ documentId, status: "draft" });
  },
});
