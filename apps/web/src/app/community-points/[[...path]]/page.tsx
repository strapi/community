import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { ContributionsView } from "@/features/github-contributions/components/contributions-view";

type Props = {
  params: Promise<{ path?: string[] }>;
};

// Keyed by contributions-view.tsx's `contributionsViewPaths` segments. Not
// imported directly — that file is a "use client" module, so its exports
// can't be pulled into this server-only generateMetadata.
const TITLES: Record<string, string> = {
  "": "Community points",
  "gain-points": "Gain points",
  tiers: "Tiers & benefits",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const label = TITLES[path?.[0] ?? ""] ?? TITLES[""];

  return {
    title: label === TITLES[""] ? label : `${label} · Community points`,
    robots: { index: false },
  };
}

/**
 * The signed-in user's own community points section, linked from the user
 * menu. Whether they have one (not Strapi employees) is checked
 * client-side by `ContributionsView`, against the CMS — the better-auth
 * session cookie lives on the CMS's origin, not this one.
 */
export default async function CommunityPointsPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const [segment = "", ...rest] = path ?? [];
  if (rest.length > 0 || !Object.hasOwn(TITLES, segment)) notFound();

  const pathname = path
    ? `/community-points/${path.join("/")}`
    : "/community-points";

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ContributionsView pathname={pathname} />
      </main>
    </>
  );
}
