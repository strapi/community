const SUPPORTED = ["api::package.package", "api::template.template"];

module.exports = ({ strapi }) => ({
  async getUsers(ctx) {
    const users = await strapi.documents("plugin::better-auth.user").findMany({
      fields: ["name", "email", "documentId"],
      populate: { profile: { populate: { avatar: { fields: ["url"] } } } },
      pagination: { limit: 100 },
    });
    ctx.body = { data: users };
  },

  async getOrganizations(ctx) {
    const orgs = await strapi
      .documents("plugin::better-auth.organization")
      .findMany({
        fields: ["name", "slug", "documentId"],
        populate: { profile: { populate: { avatar: { fields: ["url"] } } } },
        pagination: { limit: 100 },
      });
    ctx.body = { data: orgs };
  },

  async getOwner(ctx) {
    const { contentType, documentId, populate } = ctx.query;

    if (!SUPPORTED.includes(contentType)) {
      return ctx.badRequest("Unsupported content type");
    }

    const entry = await strapi.documents(contentType).findOne({
      documentId,
      populate: {
        owner: populate
          ? {
              populate,
            }
          : true,
      },
    });

    ctx.body = { data: entry?.owner ?? [] };
  },

  async setOwner(ctx) {
    const { contentType, documentId, ownerDocumentId, ownerType } =
      ctx.request.body.data;

    if (!SUPPORTED.includes(contentType)) {
      return ctx.badRequest("Unsupported content type");
    }

    const ownerValue = ownerDocumentId
      ? { set: [{ documentId: ownerDocumentId, __type: ownerType }] }
      : { set: [] };

    await strapi.documents(contentType).update({
      documentId,
      data: { owner: ownerValue },
    });

    ctx.body = { success: true };
  },
});
