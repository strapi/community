/**
 * package controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::package.package',
  ({ strapi }) => ({
    async count(ctx) {
      try {
        const countPackages = await strapi
          .documents('api::package.package')
          .count(ctx.query);

        ctx.body = {
          data: {
            count: countPackages,
          },
        };
      } catch (e) {
        ctx.body = e;
      }
    },
  })
);
