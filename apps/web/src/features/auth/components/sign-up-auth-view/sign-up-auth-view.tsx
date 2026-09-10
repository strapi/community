"use client";

import { AuthUIProvider, AuthView } from "@daveyplate/better-auth-ui";
import { useAuthUIProviderProps } from "../../lib/use-auth-ui-props";

/**
 * AuthUIProvider's `magicLink` (like `credentials`/`emailOTP`/etc.) is a
 * plain boolean with no per-view granularity — AuthView reads it straight
 * from context, so there's no prop on AuthView itself to hide the magic
 * link button on just the sign-up page. Nesting a second provider that
 * overrides only `magicLink` for this one route shadows the context for
 * this subtree without duplicating (and risking drift in) the rest of the
 * shared config.
 */
export function SignUpAuthView({ pathname }: { pathname: string }) {
  const authUIProviderProps = useAuthUIProviderProps();

  return (
    <AuthUIProvider {...authUIProviderProps} magicLink={false}>
      <AuthView pathname={pathname} />
    </AuthUIProvider>
  );
}
