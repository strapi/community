"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { useAuthUIProviderProps } from "../../lib/use-auth-ui-props";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const authUIProviderProps = useAuthUIProviderProps();

  return <AuthUIProvider {...authUIProviderProps}>{children}</AuthUIProvider>;
}
