import type { Core } from "@strapi/strapi";

/**
 * SEO copy and keyword-rich headings for the home page and the overview
 * pages, applied on bootstrap so they reach every environment on deploy.
 *
 * A field is only written when it is empty or still holds one of its known
 * `replaces` values, so anything an editor changed in the admin panel is left
 * alone and re-running is a no-op.
 *
 * Titles get " | Strapi Community" appended by the web app unless they
 * already contain the site name; keep them under ~60 characters including
 * that suffix, and descriptions between 120 and 160 characters.
 */

type SeoCopy = {
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
};

type FieldUpdate = {
  value: string;
  /** Previous defaults that may be overwritten. */
  replaces?: string[];
};

const HOME: SeoCopy & {
  titleReplaces: string[];
  descriptionReplaces: string[];
} = {
  metaTitle: "Strapi Community: Plugins, Templates and Integrations",
  titleReplaces: ["Strapi Community Hub"],
  descriptionReplaces: [
    "Extend Strapi in minutes. Shaped by an open community.",
  ],
  metaDescription:
    "Discover Strapi plugins, starter templates and integrations built by the community. Compare downloads and stars, read the docs and extend Strapi in minutes.",
  keywords:
    "strapi plugins, strapi templates, strapi integrations, strapi marketplace, strapi community, headless cms",
};

/** Keyed by overview page slug. */
const OVERVIEW_PAGES: Record<string, SeoCopy> = {
  marketplace: {
    metaTitle: "Marketplace: Plugins, Providers and Tools",
    metaDescription:
      "Browse Strapi plugins, providers, SDKs and tools. Filter by category, compare downloads and GitHub stars, and find the right extension for your Strapi project.",
    keywords:
      "strapi plugins, strapi providers, strapi marketplace, strapi extensions, strapi sdk",
  },
  integrations: {
    metaTitle: "Integrations with Frameworks and Services",
    metaDescription:
      "Learn how to use Strapi with your favorite frameworks and services, from Next.js and Astro to search and e-commerce, with guides, plugins and starter templates.",
    keywords:
      "strapi integrations, strapi next.js, strapi astro, strapi frameworks, headless cms integrations",
  },
  members: {
    metaTitle: "Members, Maintainers and Contributors",
    metaDescription:
      "Meet the developers, maintainers and contributors of the Strapi community. See who builds Strapi plugins and templates, and connect with fellow builders.",
    keywords:
      "strapi community, strapi developers, strapi contributors, strapi maintainers",
  },
  partners: {
    metaTitle: "Partners: Agencies and Solution Providers",
    metaDescription:
      "Find official Strapi partners: agencies and solution providers that design, build and scale Strapi projects. Compare expertise, locations and partner levels.",
    keywords:
      "strapi partners, strapi agencies, strapi solution partners, strapi experts",
  },
  showcases: {
    metaTitle: "Showcases: Real-World Websites and Apps",
    metaDescription:
      "Explore websites, apps and digital products built with Strapi. Get inspired by real-world projects from companies and developers across the Strapi community.",
    keywords:
      "strapi showcases, built with strapi, strapi examples, strapi websites",
  },
  help: {
    metaTitle: "Help Center: Guides and FAQ",
    metaDescription:
      "Get help with the Strapi Community: guides for submitting plugins and templates, managing your profile and organization, and answers to common questions.",
  },
  submit: {
    metaTitle: "Submit a Plugin, Template or Integration",
    metaDescription:
      "Share your work with the Strapi community. Submit a plugin, starter template or integration to the marketplace and reach thousands of Strapi developers.",
  },
};

/**
 * Page headings (rendered as the <h1>), with the copy they replace. Unlike
 * the SEO fields these are required, so they're only ever swapped out when
 * they still hold the old value.
 */
const HOME_TITLE: FieldUpdate = {
  value: "Extend Strapi with community plugins and templates.",
  replaces: ["Extend Strapi in minutes. Shaped by an open community."],
};

const OVERVIEW_TITLES: Record<string, FieldUpdate> = {
  marketplace: {
    value: "Strapi Plugin Marketplace",
    replaces: ["Marketplace"],
  },
  integrations: { value: "Strapi Integrations", replaces: ["Integrations"] },
  members: { value: "Strapi Community Members", replaces: ["Members"] },
  partners: { value: "Strapi Partners", replaces: ["Partners"] },
  showcases: { value: "Built with Strapi", replaces: ["Showcases"] },
};

/** The new heading, or null when it was edited and should be left alone. */
const pendingTitle = (
  current: string | null | undefined,
  update?: FieldUpdate,
) =>
  update &&
  current !== update.value &&
  update.replaces?.includes(current?.trim() ?? "")
    ? update.value
    : null;

type SeoComponent = {
  id?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
} | null;

/** The changed fields of `current`, or null when nothing needs writing. */
function pendingSeo(
  current: SeoComponent,
  fields: Record<keyof SeoCopy, FieldUpdate | undefined>,
): Partial<SeoCopy> | null {
  const changes: Partial<SeoCopy> = {};

  for (const [key, update] of Object.entries(fields) as [
    keyof SeoCopy,
    FieldUpdate | undefined,
  ][]) {
    if (!update) continue;
    const value = current?.[key]?.trim();
    if (!value || update.replaces?.includes(value)) {
      if (value !== update.value) changes[key] = update.value;
    }
  }

  return Object.keys(changes).length ? changes : null;
}

const toFields = (
  copy: SeoCopy,
  titleReplaces: string[] = [],
  descriptionReplaces: string[] = [],
) => ({
  metaTitle: { value: copy.metaTitle, replaces: titleReplaces },
  metaDescription: {
    value: copy.metaDescription,
    replaces: descriptionReplaces,
  },
  keywords: copy.keywords ? { value: copy.keywords } : undefined,
});

// Passing the existing component id updates it in place, leaving the
// fields we don't send (openGraph, metaImage, ...) untouched.
const mergeSeo = (current: SeoComponent, changes: Partial<SeoCopy>) =>
  current?.id ? { id: current.id, ...changes } : changes;

async function seedHome(strapi: Core.Strapi) {
  const home = await strapi
    .documents("api::home.home")
    .findFirst({ populate: { seo: true } });
  if (!home) return;

  const seo = home.seo as SeoComponent;
  const seoChanges = pendingSeo(
    seo,
    toFields(HOME, HOME.titleReplaces, HOME.descriptionReplaces),
  );
  const title = pendingTitle(home.title, HOME_TITLE);
  if (!seoChanges && !title) return;

  await strapi.documents("api::home.home").update({
    documentId: home.documentId,
    data: {
      ...(title && { title }),
      ...(seoChanges && { seo: mergeSeo(seo, seoChanges) }),
      // biome-ignore lint/suspicious/noExplicitAny: partial component update
    } as any,
  });

  strapi.log.info(
    `[seed] Updated home: ${[...(title ? ["title"] : []), ...Object.keys(seoChanges ?? {})].join(", ")}`,
  );
}

async function seedOverviewPage(strapi: Core.Strapi, slug: string) {
  const uid = "api::overview-page.overview-page" as const;
  const copy = OVERVIEW_PAGES[slug];

  const draft = await strapi.documents(uid).findFirst({
    filters: { slug },
    status: "draft",
    populate: { seo: true },
  });
  if (!draft) return;

  const seo = draft.seo as SeoComponent;
  const seoChanges = copy ? pendingSeo(seo, toFields(copy)) : null;
  const title = pendingTitle(draft.title, OVERVIEW_TITLES[slug]);
  if (!seoChanges && !title) return;

  const published = await strapi.documents(uid).findOne({
    documentId: draft.documentId,
    status: "published",
    fields: ["updatedAt"],
  });
  // Only publish when the draft had no other pending edits; otherwise we'd
  // push an editor's unfinished changes live along with ours.
  const inSync =
    !!published &&
    new Date(draft.updatedAt as string) <=
      new Date(published.updatedAt as string);

  await strapi.documents(uid).update({
    documentId: draft.documentId,
    data: {
      ...(title && { title }),
      ...(seoChanges && { seo: mergeSeo(seo, seoChanges) }),
      // biome-ignore lint/suspicious/noExplicitAny: partial component update
    } as any,
  });

  if (inSync) {
    await strapi.documents(uid).publish({ documentId: draft.documentId });
  }

  strapi.log.info(
    `[seed] Updated "${slug}" overview page: ${[...(title ? ["title"] : []), ...Object.keys(seoChanges ?? {})].join(", ")}${inSync ? "" : " (draft only: the page has unpublished changes)"}`,
  );
}

export async function seedSeoContent(strapi: Core.Strapi): Promise<void> {
  await seedHome(strapi);

  const slugs = new Set([
    ...Object.keys(OVERVIEW_PAGES),
    ...Object.keys(OVERVIEW_TITLES),
  ]);
  for (const slug of slugs) {
    await seedOverviewPage(strapi, slug);
  }
}
