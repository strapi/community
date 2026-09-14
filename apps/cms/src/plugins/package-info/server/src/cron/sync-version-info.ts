import { getPackageInfo } from "../services/get-package-info";

export async function syncVersionInfo(): Promise<{
  updated: number;
  failed: number;
}> {
  const packages = await strapi.documents("api::package.package").findMany({
    status: "published",
    fields: [
      "documentId",
      "package_location",
      "git_repository",
      "readme",
      "readme_auto_sync",
    ],
    populate: { version_info: true },
    pagination: { pageSize: 500 },
  });

  let updated = 0;
  let failed = 0;

  for (const pkg of packages) {
    if (!pkg.package_location) continue;

    try {
      const info = await getPackageInfo(
        pkg.package_location,
        pkg.git_repository ?? undefined,
      );
      if (!info) continue;

      // Owner opted out of readme auto-sync (see the "Submissions" edit
      // form) — leave `readme` alone but keep version/stats syncing.
      // Syncing is the default: treat `null` (packages that predate this
      // field — the schema's `default: true` only applies to rows created
      // after it was added) the same as `true`, not as opted out.
      const newReadme =
        pkg.readme_auto_sync !== false ? (info.readme ?? null) : pkg.readme;
      const newVersion = info.version ?? null;
      const newPublishedAt = info.publishedAt ?? null;
      const newInstallCommand = info.installCommand ?? null;

      if (
        newReadme === pkg.readme &&
        newVersion === (pkg.version_info?.version ?? null) &&
        newPublishedAt === (pkg.version_info?.published_at ?? null) &&
        newInstallCommand === (pkg.version_info?.install_command ?? null)
      )
        continue;

      await strapi.documents("api::package.package").update({
        status: "published",
        documentId: pkg.documentId,
        data: {
          readme: newReadme,
          version_info: {
            version: newVersion,
            published_at: newPublishedAt,
            install_command: newInstallCommand,
          },
        },
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.error(
        `[package-info] Failed to sync version info for ${pkg.package_location}: ${err}`,
      );
    }
  }

  return { updated, failed };
}
