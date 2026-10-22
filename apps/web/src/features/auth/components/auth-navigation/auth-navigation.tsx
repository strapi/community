"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { Button } from "@repo/strapi-ui";
import { HandshakeIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { authClient } from "@/features/auth/lib/client";
import { usePartnerOrganizations } from "@/features/partner-portal/lib/partner-organizations";

type Props = {
  theme: "light" | "dark";
  // Renders the user button as a round avatar with a hover tooltip instead
  // of the full name/email button.
  compact?: boolean;
  // Rendered after the user button, only when signed in (e.g. the CMS
  // navigation `cta_links`).
  signedInActions?: ReactNode;
};

export function AuthNavigation({
  theme,
  compact = false,
  signedInActions,
}: Props) {
  const isDark = theme === "dark";
  // `slug` is a custom `additionalFields` entry (see use-auth-ui-props.tsx)
  // not present on better-auth-ui's own `User` type, so it isn't typed on
  // the session — it determines the user's public profile URL (the
  // `/[slug]` webtools pattern, see apps/cms/src/lib/auth.ts).
  const { data: session } = authClient.useSession();
  const slug = (session?.user as { slug?: string } | undefined)?.slug;

  // One entry per partner organization the user can manage — normally
  // just one, but the portal is organization-scoped, so name the org when
  // there's more than one to tell them apart.
  const { organizations: partnerOrganizations } = usePartnerOrganizations();
  const partnerLinks = partnerOrganizations.map((organization) => ({
    href: `/partner/${organization.slug}`,
    icon: <HandshakeIcon />,
    label:
      partnerOrganizations.length > 1
        ? `Partner portal · ${organization.name}`
        : "Partner portal",
    signedIn: true,
  }));

  const userButton = (
    <UserButton
      size={compact ? "icon" : "default"}
      className={compact ? "size-9" : undefined}
      classNames={{ trigger: { base: "cursor-pointer" } }}
      additionalLinks={[
        ...(slug
          ? [
              {
                href: `/${slug}`,
                icon: <UserIcon />,
                label: "Profile",
                signedIn: true,
              },
            ]
          : []),
        ...partnerLinks,
      ]}
    />
  );

  return (
    <>
      <SignedOut>
        <Button
          variant={isDark ? "outlineInverse" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        {compact ? (
          // Tooltip is hidden while the dropdown is open so it doesn't
          // overlap the menu (Radix sets `data-state="open"` on the trigger).
          <span className="group/avatar relative mr-2 flex items-center">
            {userButton}
            <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-3 py-1 text-sm font-semibold text-white opacity-0 transition-opacity group-hover/avatar:opacity-100 group-has-[[data-state=open]]/avatar:hidden">
              Settings menu
            </span>
          </span>
        ) : (
          userButton
        )}
        {signedInActions}
      </SignedIn>
    </>
  );
}
