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
          .count({ status: 'published' });

        console.log(countPackages);
        ctx.body = countPackages;
      } catch (e) {
        ctx.body = e;
      }
    },
  })
);
