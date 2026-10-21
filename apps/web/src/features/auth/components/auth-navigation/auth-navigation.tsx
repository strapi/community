"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { Button } from "@repo/strapi-ui";
import { HandshakeIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/features/auth/lib/client";
import { usePartnerOrganizations } from "@/features/partner-portal/lib/partner-organizations";

type Props = {
  theme: "light" | "dark";
};

export function AuthNavigation({ theme }: Props) {
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
        <UserButton
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
      </SignedIn>
    </>
  );
}
