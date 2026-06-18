const SUPPORTED = [
  "api::package.package",
  "api::template.template",
  "api::showcase.showcase",
];

export default ({ strapi }) => ({
  async getUsers(ctx) {
    const users = await strapi.documents("plugin::better-auth.user").findMany({
      fields: ["name", "email", "documentId"],
      pagination: { limit: 100 },
    });
    ctx.body = { data: users };
  },

  async getOrganizations(ctx) {
    const orgs = await strapi
      .documents("plugin::better-auth.organization")
      .findMany({
        fields: ["name", "slug", "documentId"],
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

    ctx.body = { data: entry?.owner ?? null };
  },

  async setOwner(ctx) {
    const { contentType, documentId, ownerDocumentId, ownerType } =
      ctx.request.body.data;

    if (!SUPPORTED.includes(contentType)) {
      return ctx.badRequest("Unsupported content type");
    }

    let ownerValue = null;
    if (ownerDocumentId) {
      const ownerEntity = await strapi.db
        .query(ownerType)
        .findOne({ where: { documentId: ownerDocumentId } });

      if (!ownerEntity) {
        return ctx.badRequest("Owner not found");
      }

      ownerValue = { id: ownerEntity.id, __type: ownerType };
    }

    await strapi.documents(contentType).update({
      status: "published",
      documentId,
      data: { owner: ownerValue },
    });

    ctx.body = { success: true };
  },
});
