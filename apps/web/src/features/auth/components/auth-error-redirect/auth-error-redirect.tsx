"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "../../lib/client";

/**
 * `/auth/error` — the CMS's `onAPIError.errorURL`, where failed OAuth
 * sign-ins/links land. Not a page of its own: forwards the error to wherever
 * the visitor belongs (account settings when signed in, e.g. a failed link;
 * sign-in otherwise), where <AuthErrorToast> picks it up.
 *
 * Decided client-side on purpose: the session cookie lives on the CMS's
 * domain, so a server-side check here (which only receives the web app's
 * cookies) would always see a signed-out visitor.
 */
export function AuthErrorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    const query = new URLSearchParams({
      error: searchParams.get("error") || "UNKNOWN",
    });
    const description = searchParams.get("error_description");
    if (description) query.set("error_description", description);

    router.replace(`${session ? "/account" : "/auth/sign-in"}?${query}`);
  }, [isPending, session, router, searchParams]);

  return null;
}
