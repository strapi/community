/**
 * package controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::package.package',
  ({ strapi }) => ({
    async count(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const countPackages = await strapi
        .documents('api::package.package')
        .count(sanitizedQueryParams);

      const sanitizedResults = await this.sanitizeOutput(countPackages, ctx);

      return this.transformResponse({ count: sanitizedResults });
    },

    async random(ctx) {
      await this.validateQuery(ctx);
      const { pagination }: { pagination?: Record<string, any> } =
        (await this.sanitizeQuery(ctx)) || {};

      const limit = pagination?.pageSize || 4; // Default limit if pagination is missing

      const qb = await strapi.db
        .connection('packages')
        .select('*')
        .where({
          verified: true,
        })
        .whereNotNull('published_at')
        .limit(limit)
        .orderByRaw('RANDOM()');

      const results = await qb;

      return this.transformResponse(results);
    },
  })
);
