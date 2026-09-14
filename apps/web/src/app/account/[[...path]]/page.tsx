import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { AccountView } from "@/features/auth/components/account-view";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import {
  getPackageCategories,
  getTemplateCategories,
} from "@/features/submissions/lib/categories";

type Props = {
  params: Promise<{ path?: string[] }>;
};

// Keyed by account-view.tsx's own `viewPaths` (`@daveyplate/better-auth-ui`'s
// default `accountViewPaths` segments plus its custom "profile"/"submissions"
// tabs). Not imported directly — that package's entry file is a "use client"
// boundary, so its exports can't be pulled into this server-only
// generateMetadata. account-view.tsx doesn't override `viewPaths` either
// (beyond those two), so these literal segments stay in sync with what it
// actually renders at.
const TITLES: Record<string, string> = {
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  "api-keys": "API keys",
  organizations: "Organizations",
  submissions: "Submissions",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  // The "Submissions" edit screen nests further segments
  // (.../submissions/<type>/<documentId>/edit) — title on the first
  // segment there, the last segment everywhere else (the flat tabs).
  const view = path?.[0] === "submissions" ? "submissions" : path?.at(-1);

  return { title: (view && TITLES[view]) || TITLES.settings };
}

export default async function AccountPage({ params }: Props) {
  if (!isAuthEnabled) notFound();

  const { path } = await params;
  const pathname = path ? `/account/${path.join("/")}` : "/account";

  const [packageCategories, templateCategories] = await Promise.all([
    getPackageCategories(),
    getTemplateCategories(),
  ]);

  return (
    <>
      <Navigation theme="light" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountView
          pathname={pathname}
          packageCategories={packageCategories}
          templateCategories={templateCategories}
        />
      </main>
    </>
  );
}
