"use client";

import { AuthUIProvider, AuthView } from "@daveyplate/better-auth-ui";
import { useAuthUIProviderProps } from "../lib/use-auth-ui-props";

/**
 * AuthView's social-buttons section only excludes the RESET_PASSWORD and
 * EMAIL_VERIFICATION views — TWO_FACTOR isn't in that list, so "or
 * continue with Google/GitHub" shows up on the 2FA challenge page too,
 * even though picking one wouldn't actually satisfy the second factor —
 * it'd just start an unrelated sign-in. There's no prop on AuthView to
 * exclude a view from that section, so a nested provider with `social`
 * disabled for just this route is the only way to suppress it.
 */
export function TwoFactorAuthView({ pathname }: { pathname: string }) {
  const authUIProviderProps = useAuthUIProviderProps();

  return (
    <AuthUIProvider {...authUIProviderProps} social={undefined}>
      <AuthView pathname={pathname} />
    </AuthUIProvider>
  );
}
