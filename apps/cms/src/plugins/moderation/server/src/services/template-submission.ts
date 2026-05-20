/**
 * Template submission service.
 *
 * Submissions create a draft api::template.template record directly.
 * Moderation is tracked via plugin::moderation.business-review (oneToOne).
 * Templates do not have security scanning.
 * Approval = publish the draft. No data copy needed.
 * See docs/adr/0002-review-content-types-in-moderation-plugin.md.
 */

import { auth } from "../../../../../lib/auth";
import { triggerN8nWebhook } from "./n8n-webhook";

const TEMPLATE_CT = "api::template.template";
const BUSINESS_REVIEW_CT = "plugin::moderation.business-review";

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

export default ({ strapi }) => ({
  async createSubmission(data, submitterIp) {
    const ownerDocumentId = await findOrCreateUser(strapi, {
      email: data.owner_email,
      name: data.owner_name,
    });
    const categoryConnect = await resolveCategories(
      strapi,
      data.categories_list || [],
    );

    const businessReview = await strapi.documents(BUSINESS_REVIEW_CT).create({
      data: { status: "pending" },
    });

    const template = await strapi.documents(TEMPLATE_CT).create({
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
        business_review: {
          connect: [{ documentId: businessReview.documentId }],
        },
        overall_status: "submitted",
        submitter_ip: submitterIp || null,
        submitter_agreed_to_terms: data.submitter_agreed_to_terms === true,
        submission_notes: data.submission_notes || null,
      },
    });

    triggerN8nWebhook(
      "template-submission-received",
      buildLifecyclePayload(template),
      { strapi },
    );
    return template;
  },

  async publishTemplate(templateDocumentId) {
    const template = await strapi
      .documents(TEMPLATE_CT)
      .findOne({ documentId: templateDocumentId, status: "draft" });
    if (!template) throw new Error("Template not found.");
    if (template.overall_status !== "approved")
      throw new Error("Template must be approved before publishing.");

    const published = await strapi
      .documents(TEMPLATE_CT)
      .publish({ documentId: templateDocumentId });

    triggerN8nWebhook(
      "template-approved",
      buildLifecyclePayload(template, { template_slug: published.slug }),
      { strapi },
    );

    return published;
  },

  async updateReview(templateDocumentId, reviewData) {
    const {
      business_review_status,
      reviewer_feedback,
      rejection_reason,
      notes,
      overall_status,
    } = reviewData;

    const template = await strapi.documents(TEMPLATE_CT).findOne({
      documentId: templateDocumentId,
      populate: ["business_review"],
      status: "draft",
    });
    if (!template?.business_review)
      throw new Error("No business review found for this template.");

    await strapi.documents(BUSINESS_REVIEW_CT).update({
      documentId: (template.business_review as { documentId: string })
        .documentId,
      data: {
        ...(business_review_status && { status: business_review_status }),
        ...(reviewer_feedback !== undefined && { reviewer_feedback }),
        ...(rejection_reason !== undefined && { rejection_reason }),
        ...(notes !== undefined && { notes }),
      },
    });

    if (overall_status) {
      await strapi.documents(TEMPLATE_CT).update({
        documentId: templateDocumentId,
        data: { overall_status },
      });
    }
  },

  async rejectOrRequestChanges(
    templateDocumentId,
    { status, reason, feedback },
  ) {
    if (!["rejected", "changes_requested"].includes(status)) {
      throw new Error("Status must be 'rejected' or 'changes_requested'.");
    }

    const template = await strapi.documents(TEMPLATE_CT).findOne({
      documentId: templateDocumentId,
      status: "draft",
      populate: ["business_review"],
    });
    if (!template) throw new Error("Template not found.");

    const updated = await strapi.documents(TEMPLATE_CT).update({
      documentId: templateDocumentId,
      data: { overall_status: status },
    });

    if (template.business_review) {
      await strapi.documents(BUSINESS_REVIEW_CT).update({
        documentId: (template.business_review as { documentId: string })
          .documentId,
        data: {
          status: status === "rejected" ? "rejected" : "changes_requested",
          ...(reason && { rejection_reason: reason }),
          ...(feedback && { reviewer_feedback: feedback }),
        },
      });
    }

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
    return strapi.documents(TEMPLATE_CT).findMany({
      filters: baseFilter,
      sort: { createdAt: "desc" },
      pagination: { page, pageSize },
      status: "draft",
      populate: ["business_review"],
    });
  },

  async getSubmission(templateDocumentId) {
    return strapi.documents(TEMPLATE_CT).findOne({
      documentId: templateDocumentId,
      status: "draft",
      populate: ["business_review"],
    });
  },
});
