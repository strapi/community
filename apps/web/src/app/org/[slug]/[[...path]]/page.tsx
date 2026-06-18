import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { OrganizationView } from "@/features/auth/components/organization-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";

type Props = {
  params: Promise<{ slug: string; path?: string[] }>;
};

export default async function OrgPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { slug, path } = await params;
  const pathname = path ? `/org/${slug}/${path.join("/")}` : `/org/${slug}`;

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <OrganizationView slug={slug} pathname={pathname} />
      </main>
    </>
  );
}
