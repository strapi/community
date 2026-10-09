"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { getAuthErrorMessage } from "../../lib/auth-errors";

/**
 * Toasts the `?error=<code>` better-auth appends when a redirect-based flow
 * fails (OAuth callbacks, email verification, magic link, password reset),
 * then strips it from the URL so a refresh doesn't toast it again.
 *
 * Skipped on `/auth/reset-password`: better-auth-ui handles that one itself
 * (toast + redirect to sign-in, carrying the query string along). The toast
 * there and the one fired here after that redirect share a sonner `id` (see
 * the `toast` prop in use-auth-ui-props), so they collapse into one.
 */
export function AuthErrorToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error || pathname === "/auth/reset-password") return;

    const message = getAuthErrorMessage(
      error,
      searchParams.get("error_description"),
    );
    toast.error(message, { id: message });

    const params = new URLSearchParams(searchParams);
    params.delete("error");
    params.delete("error_description");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [error, pathname, router, searchParams]);

  return null;
}
