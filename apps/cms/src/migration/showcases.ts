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
  const { default: captureWebsite } = await import("capture-website");
  const tmpPath = path.join(
    os.tmpdir(),
    `screenshot-${Date.now()}-${Math.random().toString(36).slice(2)}.png`,
  );

  await captureWebsite.file(url, tmpPath, {
    width: 1280,
    height: 800,
    timeout: 15,
    delay: 5,
    overwrite: true,
  });

  try {
    return await uploadFile(tmpPath, `${title}.png`, "image/png");
  } finally {
    await fs.promises.unlink(tmpPath).catch(() => {});
  }
};

export const migrateShowcases = async () => {
  strapi.log.info("Starting showcases migration...");

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
    }
  } catch (error) {
    strapi.log.error("Error migrating showcases:", error);
  } finally {
    strapi.log.info("Showcases migration finished.");
  }
};
