"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { Suspense } from "react";
import { useAuthUIProviderProps } from "../../lib/use-auth-ui-props";
import { AuthErrorToast } from "../auth-error-toast";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const authUIProviderProps = useAuthUIProviderProps();

  return (
    <AuthUIProvider {...authUIProviderProps}>
      {children}
      {/* `useSearchParams` needs a Suspense boundary to not opt the whole
          tree out of static rendering. */}
      <Suspense>
        <AuthErrorToast />
      </Suspense>
    </AuthUIProvider>
  );
}
