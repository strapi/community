import { breadcrumbTrail } from "@/lib/breadcrumbs";
import { SITE_NAME } from "./seo";

/**
 * schema.org builders for the JSON-LD rendered on each page.
 * See https://developers.google.com/search/docs/appearance/structured-data
 */

type Schema = Record<string, unknown>;

type DateValue = string | Date | number | null | undefined;

export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL ?? "https://community.strapi.io";

const absoluteUrl = (path: string) => new URL(path, WEB_URL).toString();

const STRAPI_ORGANIZATION_ID = "https://strapi.io/#organization";
const WEBSITE_ID = `${WEB_URL}/#website`;

/** Drops null/undefined/empty values so the output stays valid. */
const compact = (schema: Schema): Schema =>
  Object.fromEntries(
    Object.entries(schema).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );

/** The publisher and the site; rendered once in the root layout. */
export function siteSchema(): Schema[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": STRAPI_ORGANIZATION_ID,
      name: "Strapi",
      url: "https://strapi.io",
      logo: absoluteUrl("/icon-512.png"),
      sameAs: [
        "https://github.com/strapi",
        "https://x.com/strapijs",
        "https://www.linkedin.com/company/strapi",
        "https://www.youtube.com/c/Strapi",
        "https://discord.strapi.io",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: WEB_URL,
      publisher: { "@id": STRAPI_ORGANIZATION_ID },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${WEB_URL}/marketplace?query={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/** BreadcrumbList for a path; the last crumb uses the page's real name. */
export function breadcrumbSchema(path: string, name?: string | null): Schema {
  const crumbs = breadcrumbTrail(path);
  const last = crumbs[crumbs.length - 1];
  if (name && last) last.label = name;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href),
    })),
  };
}

type OwnerLike = {
  __type?: string;
  name?: string | null;
  url_alias?: { url_path?: string | null }[] | null;
} | null;

const ownerSchema = (owner: OwnerLike | undefined) => {
  if (!owner?.name) return undefined;
  const path = owner.url_alias?.[0]?.url_path;

  return compact({
    "@type":
      owner.__type === "plugin::better-auth.user" ? "Person" : "Organization",
    name: owner.name,
    url: path ? absoluteUrl(path) : undefined,
  });
};

const PACKAGE_SUBCATEGORY: Record<string, string> = {
  plugin: "Strapi plugin",
  provider: "Strapi provider",
  sdk: "Strapi SDK",
  tool: "Strapi tool",
};

export function packageSchema(
  path: string,
  pkg: {
    name?: string | null;
    description?: string | null;
    type?: string | null;
    iconUrl?: string;
    owner?: OwnerLike;
    version?: string | null;
    git_repository?: string | null;
    package_location?: string | null;
    categories?: { name?: string | null }[] | null;
    createdAt?: DateValue;
    updatedAt?: DateValue;
  },
): Schema {
  const author = ownerSchema(pkg.owner);

  return compact({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pkg.name,
    description: pkg.description,
    url: absoluteUrl(path),
    image: pkg.iconUrl,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory:
      PACKAGE_SUBCATEGORY[pkg.type ?? ""] ?? "Strapi plugin",
    operatingSystem: "Cross-platform",
    softwareVersion: pkg.version,
    downloadUrl: pkg.package_location,
    keywords: pkg.categories
      ?.map((category) => category.name)
      .filter(Boolean)
      .join(", "),
    author,
    datePublished: pkg.createdAt,
    dateModified: pkg.updatedAt,
    sameAs: [pkg.git_repository, pkg.package_location].filter(Boolean),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

export function templateSchema(
  path: string,
  template: {
    name?: string | null;
    description?: string | null;
    imageUrl?: string;
    owner?: OwnerLike;
    git_repository?: string | null;
    preview_link?: string | null;
    categories?: { name?: string | null }[] | null;
    createdAt?: DateValue;
    updatedAt?: DateValue;
  },
): Schema {
  return compact({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: template.name,
    description: template.description,
    url: absoluteUrl(path),
    image: template.imageUrl,
    codeRepository: template.git_repository,
    runtimePlatform: "Strapi",
    keywords: template.categories
      ?.map((category) => category.name)
      .filter(Boolean)
      .join(", "),
    author: ownerSchema(template.owner),
    datePublished: template.createdAt,
    dateModified: template.updatedAt,
    sameAs: [template.preview_link].filter(Boolean),
    isPartOf: { "@id": WEBSITE_ID },
  });
}

type ProfileLike = {
  bio?: string | null;
  subtitle?: string | null;
  website?: string | null;
  github?: string | null;
  location?: string | null;
} | null;

export function personSchema(
  path: string,
  user: { name?: string | null; image?: string | null; profile?: ProfileLike },
): Schema {
  const profile = user.profile;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(path),
    mainEntity: compact({
      "@type": "Person",
      name: user.name,
      description: profile?.bio,
      jobTitle: profile?.subtitle,
      image: user.image,
      homeLocation: profile?.location,
      sameAs: [profile?.website, profile?.github].filter(Boolean),
    }),
  };
}

export function organizationSchema(
  path: string,
  org: { name?: string | null; logoUrl?: string; profile?: ProfileLike },
): Schema {
  const profile = org.profile;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(path),
    mainEntity: compact({
      "@type": "Organization",
      name: org.name,
      description: profile?.bio,
      logo: org.logoUrl,
      location: profile?.location,
      sameAs: [profile?.website, profile?.github].filter(Boolean),
    }),
  };
}

/** Listing pages: overviews and categories. */
export function collectionPageSchema(
  path: string,
  page: { name?: string | null; description?: string | null },
): Schema {
  return compact({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    description: page.description,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID },
  });
}

export function articleSchema(
  path: string,
  article: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string;
    createdAt?: DateValue;
    updatedAt?: DateValue;
  },
): Schema {
  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.imageUrl,
    url: absoluteUrl(path),
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    publisher: { "@id": STRAPI_ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

export function faqSchema(
  items: { question?: string | null; answer?: string | null }[],
): Schema | null {
  const answered = items.filter((item) => item.question && item.answer);
  if (!answered.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
