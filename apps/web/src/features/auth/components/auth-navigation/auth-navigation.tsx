"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { Button } from "@repo/strapi-ui";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/features/auth/lib/client";

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
          additionalLinks={
            slug
              ? [
                  {
                    href: `/${slug}`,
                    icon: <UserIcon />,
                    label: "Profile",
                    signedIn: true,
                  },
                ]
              : []
          }
        />
      </SignedIn>
    </>
  );
}
