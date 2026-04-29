"use client";

import { AuthUIProvider } from "better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/client";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(href) => router.push(href)}
      replace={(href) => router.replace(href)}
      Link={({ href, ...props }) => <Link href={href ?? "#"} {...props} />}
      basePath="/auth"
      account
    >
      {children}
    </AuthUIProvider>
  );
}
