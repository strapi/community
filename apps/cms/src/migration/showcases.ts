import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parse } from "yaml";
import { createCategories, uploadFile } from "./utils";

const GITHUB_API_URL =
  "https://api.github.com/repos/strapi/community-content/contents/showcase/sites.yml?ref=master";

type ShowcaseSite = {
  title: string;
  url: string;
  description: string;
  categories?: string[];
  frontend?: string[];
  made_by?: string;
  made_by_url?: string;
};

const captureScreenshot = async (url: string, title: string) => {
  const params = new URLSearchParams({
    access_key: process.env.SCREENSHOTONE_KEY,
    url,
    viewport_width: "1024",
    viewport_height: "768",
    format: "jpg",
    block_ads: "true",
    block_cookie_banners: "true",
    block_banners_by_heuristics: "false",
    block_trackers: "true",
    delay: "3",
    timeout: "20",
    response_type: "by_format",
    image_quality: "80",
  });

  const response = await fetch(`https://api.screenshotone.com/take?${params}`, {
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    throw new Error(
      `Screenshot API returned ${response.status} for ${url}. ${await response.text()}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const tmpPath = path.join(
    os.tmpdir(),
    `screenshot-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
  );

  await fs.promises.writeFile(tmpPath, buffer);

  try {
    return await uploadFile(tmpPath, `${title}.jpg`, "image/jpeg");
  } finally {
    await fs.promises.unlink(tmpPath).catch(() => {});
  }
};

export const migrateShowcases = async () => {
  strapi.log.info("Starting showcases migration...");
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const { content } = (await response.json()) as { content: string };
    const yamlContent = Buffer.from(content, "base64").toString("utf-8");
    const sites = parse(yamlContent) as ShowcaseSite[];

    for (const site of sites) {
      const existing = await strapi
        .documents("api::showcase.showcase")
        .findFirst({ filters: { url: site.url } });

      if (existing) {
        skipped++;
        continue;
      }

      const categoryIds = await createCategories(
        "api::showcase-category.showcase-category",
        site.categories ?? [],
      );

      const techStackIds = await createCategories(
        "api::tech-stack.tech-stack",
        site.frontend ?? [],
      );

      let image = null;
      try {
        image = await captureScreenshot(site.url, site.title);
      } catch (err) {
        strapi.log.warn(
          `Failed to capture screenshot for ${site.url}, skipping.`,
          err,
        );
        failed++;
        continue;
      }

      await strapi.documents("api::showcase.showcase").create({
        data: {
          title: site.title,
          url: site.url,
          description: site.description,
          categories: categoryIds,
          tech_stacks: techStackIds,
          ...(image ? { image: image.id } : {}),
        },
      });
      migrated++;
    }
  } catch (error) {
    strapi.log.error("Error migrating showcases:", error);
  } finally {
    strapi.log.info(
      `Showcases migration finished. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`,
    );
  }
};
