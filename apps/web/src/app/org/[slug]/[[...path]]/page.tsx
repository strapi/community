import type { GetQueryParams } from "@repo/strapi-client";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { OrganizationView } from "@/features/auth/components/organization-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { cmsClient } from "@/features/cms/lib/strapi";

const contentType = "plugin::better-auth.organization" as const;

type Props = {
  params: Promise<{ slug: string; path?: string[] }>;
};

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

  const { data } = await cmsClient.collection(contentType).find(query);
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
        />
      </main>
    </>
  );
}
