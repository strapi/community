import type { GetQueryParams } from "@repo/strapi-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { OrganizationView } from "@/features/auth/components/organization-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { cmsClient } from "@/features/cms/lib/strapi";
import {
  getPackageCategories,
  getTemplateCategories,
} from "@/features/submissions/lib/categories";

const contentType = "plugin::better-auth.organization" as const;

type Props = {
  params: Promise<{ slug: string; path?: string[] }>;
};

// Keyed by organization-view.tsx's own `viewPaths` (`@daveyplate/better-auth-ui`'s
// default `organizationViewPaths` segments plus its custom "profile"/
// "submissions" tabs). Not imported directly — that package's entry file is
// a "use client" boundary, so its exports can't be pulled into this
// server-only generateMetadata. organization-view.tsx doesn't override
// `viewPaths` either (beyond those two), so these literal segments stay in
// sync with what it actually renders at.
const TITLES: Record<string, string> = {
  settings: "Settings",
  profile: "Profile",
  members: "Members",
  teams: "Teams",
  "api-keys": "API keys",
  submissions: "Submissions",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, path } = await params;
  // The "Submissions" edit screen nests further segments
  // (.../submissions/<type>/<documentId>/edit) — title on the first
  // segment there, the last segment everywhere else (the flat tabs).
  const view = path?.[0] === "submissions" ? "submissions" : path?.at(-1);
  const label = (view && TITLES[view]) || TITLES.settings;

  const { data } = await cmsClient.collection(contentType).find({
    filters: { slug: { $eq: slug } },
    fields: ["name"],
  } satisfies GetQueryParams<typeof contentType>);

  const organizationName = data[0]?.name;

  return { title: organizationName ? `${label} · ${organizationName}` : label };
}

export default async function OrgPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { slug, path } = await params;
  const pathname = path ? `/org/${slug}/${path.join("/")}` : `/org/${slug}`;

  // Reads better-auth's organization + its linked profile via the default
  // Strapi content-api route (server-side bearer token), so the "Profile"
  // tab doesn't need its own read endpoint — only the write side does.
  const query = {
    filters: { slug: { $eq: slug } },
    populate: ["profile"],
  } satisfies GetQueryParams<typeof contentType>;

  const [{ data }, packageCategories, templateCategories] = await Promise.all([
    cmsClient.collection(contentType).find(query),
    getPackageCategories(),
    getTemplateCategories(),
  ]);
  const organization = data[0];

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <OrganizationView
          slug={slug}
          pathname={pathname}
          organizationId={
            organization?.id != null ? String(organization.id) : undefined
          }
          initialProfile={organization?.profile ?? undefined}
          packageCategories={packageCategories}
          templateCategories={templateCategories}
        />
      </main>
    </>
  );
}
