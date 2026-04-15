const syncStats = async () => {
  const [packages, templates] = await Promise.all([
    strapi.documents("api::package.package").findMany({
      filters: { publishedAt: { $notNull: true } },
      fields: ["documentId", "package_location", "git_repository"],
      pagination: { pageSize: 500 },
    }),
    strapi.documents("api::template.template").findMany({
      filters: { publishedAt: { $notNull: true } },
      fields: ["documentId", "git_repository"],
      pagination: { pageSize: 500 },
    }),
  ]);

  let updated = 0;
  let failed = 0;

  // Packages: stars + monthly downloads
  for (const pkg of packages) {
    if (!pkg.package_location) continue;

    try {
      const info = await getPackageInfo(
        pkg.package_location,
        pkg.git_repository ?? undefined,
      );

      if (!info) continue;

      const patch = {};
      if (info.stars !== null) patch.stars = info.stars;
      if (info.downloads?.monthly !== null) {
        patch.monthly_downloads = info.downloads?.monthly ?? null;
      }

      if (Object.keys(patch).length === 0) continue;

      await strapi.documents("api::package.package").update({
        documentId: pkg.documentId,
        data: patch,
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.warn(
        `[package-info] Failed to sync package ${pkg.package_location}: ${err}`,
      );
    }
  }

  // Templates: stars only
  for (const template of templates) {
    if (!template.git_repository) continue;

    try {
      const stars = await getGitStars(template.git_repository);
      if (stars === null) continue;

      await strapi.documents("api::template.template").update({
        documentId: template.documentId,
        data: { stars },
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.warn(
        `[package-info] Failed to sync template ${template.git_repository}: ${err}`,
      );
    }
  }

  return { updated, failed };
};

module.exports = { syncStats };
