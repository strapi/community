import { cmsClient } from "@/features/cms/lib/strapi";
import { WEB_URL } from "@/features/cms/lib/structured-data";

/**
 * /llms.txt (https://llmstxt.org): a markdown map of the site for LLMs and
 * AI search. Built from the CMS on request and cached for an hour.
 */
export const revalidate = 3600;

type Entry = {
  name?: string | null;
  title?: string | null;
  description?: string | null;
  url_alias?: { url_path?: string | null }[] | null;
};

const link = (entry: Entry) => {
  const path = entry.url_alias?.[0]?.url_path;
  const name = entry.name ?? entry.title;
  if (!path || !name) return null;

  const description = entry.description?.replace(/\s+/g, " ").trim();
  return `- [${name}](${WEB_URL}${path})${description ? `: ${description}` : ""}`;
};

const section = (title: string, entries: Entry[]) => {
  const links = entries.map(link).filter(Boolean);
  return links.length ? `## ${title}\n\n${links.join("\n")}` : null;
};

// Each list is best-effort: a failing query drops its section rather than
// the whole file.
const list = <T>(promise: Promise<{ data: T[] }>) =>
  promise.then((result) => result.data as Entry[]).catch(() => []);

export async function GET() {
  const [
    home,
    overviewPages,
    packages,
    templates,
    integrations,
    categories,
    helpPages,
  ] = await Promise.all([
    cmsClient
      .single("api::home.home")
      .find({ populate: { seo: true } })
      .then((result) => result.data)
      .catch(() => null),
    list(
      cmsClient.collection("api::overview-page.overview-page").find({
        fields: ["title", "description"],
        populate: ["url_alias"],
      }),
    ),
    list(
      cmsClient.collection("api::package.package").find({
        fields: ["name", "description"],
        populate: ["url_alias"],
        sort: "monthly_downloads:desc",
        pagination: { limit: 50 },
      }),
    ),
    list(
      cmsClient.collection("api::template.template").find({
        fields: ["name", "description"],
        populate: ["url_alias"],
        sort: "stars:desc",
        pagination: { limit: 25 },
      }),
    ),
    list(
      cmsClient.collection("api::integration.integration").find({
        fields: ["name", "description"],
        populate: ["url_alias"],
        sort: "name:asc",
        pagination: { limit: 100 },
      }),
    ),
    list(
      cmsClient.collection("api::package-category.package-category").find({
        fields: ["name", "description"],
        populate: ["url_alias"],
        sort: "name:asc",
        pagination: { limit: 100 },
      }),
    ),
    list(
      cmsClient.collection("api::help-page.help-page").find({
        fields: ["title", "description"],
        populate: ["url_alias"],
        sort: "title:asc",
        pagination: { limit: 100 },
      }),
    ),
  ]);

  const summary =
    home?.seo?.metaDescription ??
    "Discover plugins, templates and integrations for Strapi, built by the community.";

  const body = [
    "# Strapi Community",
    `> ${summary}`,
    "The Strapi Community is the official hub for extending Strapi, the open-source headless CMS. It lists community and official plugins, providers, SDKs and tools (the Strapi Marketplace), starter templates, framework integration guides, community members and partner agencies.",
    section("Sections", overviewPages),
    section("Popular plugins", packages),
    section("Templates", templates),
    section("Integrations", integrations),
    section("Plugin categories", categories),
    section("Help", helpPages),
    `## Optional\n\n- [Strapi documentation](https://docs.strapi.io): Official documentation for Strapi.\n- [Strapi website](https://strapi.io): Product information, blog and pricing.\n- [Sitemap](${process.env.NEXT_PUBLIC_CMS_URL}/api/sitemap/index.xml): Every page on the Strapi Community.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
