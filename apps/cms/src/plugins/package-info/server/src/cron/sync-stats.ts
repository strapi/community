import { getGitStars } from "../services/get-git-stars";
import { getPackageInfo } from "../services/get-package-info";
import { getReadme } from "../services/get-readme";

export async function syncStats(): Promise<{
  updated: number;
  failed: number;
}> {
  const [packages, templates] = await Promise.all([
    strapi.documents("api::package.package").findMany({
      status: "published",
      fields: ["documentId", "package_location", "git_repository"],
      pagination: { pageSize: 500 },
    }),
    strapi.documents("api::template.template").findMany({
      status: "published",
      fields: ["documentId", "git_repository"],
      pagination: { pageSize: 500 },
    }),
  ]);

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

      const patch: Record<string, unknown> = {};
      if (info.stars !== null) patch.stars = info.stars;
      if (info.downloads?.monthly !== null)
        patch.monthly_downloads = info.downloads?.monthly ?? null;

      if (Object.keys(patch).length === 0) continue;

      await strapi.documents("api::package.package").update({
        status: "published",
        documentId: pkg.documentId,
        data: patch,
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.error(
        `[package-info] Failed to sync package ${pkg.package_location}: ${err}`,
      );
    }
  }

  for (const template of templates) {
    if (!template.git_repository) continue;

    try {
      const [stars, readme] = await Promise.all([
        getGitStars(template.git_repository),
        getReadme(template.git_repository),
      ]);

      const patch: Record<string, unknown> = {};
      if (stars !== null) patch.stars = stars;
      if (readme !== null) patch.readme = readme;

      if (Object.keys(patch).length === 0) continue;

      await strapi.documents("api::template.template").update({
        status: "published",
        documentId: template.documentId,
        data: patch,
      });

      updated++;
    } catch (err) {
      failed++;
      strapi.log.error(
        `[package-info] Failed to sync template ${template.git_repository}: ${err}`,
      );
    }
  }

  return { updated, failed };
}
