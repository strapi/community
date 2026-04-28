import { getPackageInfo } from "../services/get-package-info";

export async function syncVersionInfo(): Promise<{
  updated: number;
  failed: number;
}> {
  const packages = await strapi.documents("api::package.package").findMany({
    status: "published",
    fields: ["documentId", "package_location", "git_repository"],
    pagination: { pageSize: 500 },
  });

  let updated = 0;
  let failed = 0;

  for (const pkg of packages) {
    if (!pkg.package_location) continue;

    try {
      strapi.log.info(
        `[package-info] Syncing version info for ${pkg.package_location}`,
      );
      const info = await getPackageInfo(
        pkg.package_location,
        pkg.git_repository ?? undefined,
      );
      if (!info) continue;

      await strapi.documents("api::package.package").update({
        status: "published",
        documentId: pkg.documentId,
        data: {
          readme: info.readme ?? null,
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
}
