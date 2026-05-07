"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { Button } from "@repo/strapi-ui";
import Link from "next/link";

type Props = {
  theme: "light" | "dark";
};

export function AuthNavigation({ theme }: Props) {
  const isDark = theme === "dark";

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
        <UserButton />
      </SignedIn>
    </>
  );
}
