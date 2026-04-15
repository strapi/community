const syncVersionInfo = async () => {
  const packages = await strapi.documents("api::package.package").findMany({
    filters: { publishedAt: { $notNull: true } },
    fields: ["documentId", "package_location"],
    pagination: { pageSize: 500 },
  });

  let updated = 0;
  let failed = 0;

  for (const pkg of packages) {
    if (!pkg.package_location) continue;

    try {
      const info = await getPackageInfo(pkg.package_location);

      if (!info) continue;

      await strapi.documents("api::package.package").update({
        documentId: pkg.documentId,
        data: {
          version_info: {
            version: info.version ?? null,
            published_at: info.publishedAt ?? null,
            install_command: info.installCommand ?? null,
          },
        },
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.warn(
        `[package-info] Failed to sync version info for ${pkg.package_location}: ${err}`,
      );
    }
  }

  return { updated, failed };
};

module.exports = { syncVersionInfo };
