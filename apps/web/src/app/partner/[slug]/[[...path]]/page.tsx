import type { GetQueryParams } from "@repo/strapi-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { cmsClient } from "@/features/cms/lib/strapi";
import { PartnerPortalView } from "@/features/partner-portal/components/partner-portal-view";

const contentType = "plugin::better-auth.organization" as const;

type Props = {
  params: Promise<{ slug: string; path?: string[] }>;
};

// Keyed by partner-portal-view.tsx's `partnerViewPaths` segments. Not
// imported directly — that file is a "use client" module, so its exports
// can't be pulled into this server-only generateMetadata.
const TITLES: Record<string, string> = {
  "sales-enablement": "Sales enablement",
  "tech-enablement": "Tech enablement",
  "reusable-content": "Reusable content",
  submissions: "Submissions",
  "arr-tracker": "ARR tracker",
};

// Sections with a child page per CMS resource (`<section>/<resource-slug>`).
const RESOURCE_SECTIONS = new Set([
  "sales-enablement",
  "tech-enablement",
  "reusable-content",
]);

function isValidPath(path?: string[]) {
  if (!path) return true;
  const [section = "", resource, ...rest] = path;
  if (!TITLES[section] || rest.length > 0) return false;
  return !resource || RESOURCE_SECTIONS.has(section);
}

/** The organization, only if it's flagged as a partner in the CMS. */
async function findPartnerOrganization(slug: string) {
  const { data } = await cmsClient.collection(contentType).find({
    filters: { slug: { $eq: slug }, partner: { $eq: true } },
    fields: ["name"],
  } satisfies GetQueryParams<typeof contentType>);

  return data[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, path } = await params;
  const label = (path?.[0] && TITLES[path[0]]) || "Partner portal";

  const organization = await findPartnerOrganization(slug);

  return {
    title: organization ? `${label} · ${organization.name}` : label,
    robots: { index: false },
  };
}

export default async function PartnerPortalPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { slug, path } = await params;
  if (!isValidPath(path)) notFound();

  // Server-side, this only proves the organization is a partner — whether
  // the signed-in user is one of its owners/admins is checked client-side
  // by `PartnerPortalView` (the better-auth session cookie lives on the
  // CMS's origin, not this one).
  if (!(await findPartnerOrganization(slug))) notFound();

  const pathname = path
    ? `/partner/${slug}/${path.join("/")}`
    : `/partner/${slug}`;

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PartnerPortalView slug={slug} pathname={pathname} />
      </main>
    </>
  );
}
