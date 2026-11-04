"use client";

import {
  AuthUIContext,
  ChangePasswordCard,
  PasskeysCard,
  ProvidersCard,
  SessionsCard,
  TwoFactorCard,
} from "@daveyplate/better-auth-ui";
import { Github } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { AuthNotice } from "../auth-notice";

/**
 * A hand-rolled replacement for `@daveyplate/better-auth-ui`'s
 * `SecuritySettingsCards` — same cards in the same order, but rendered
 * individually so a notice about GitHub contributions (see the "Show
 * GitHub contributions" setting in the Profile tab) can sit directly
 * above the "Providers" card holding the GitHub connect button. The
 * library's `DeleteAccountCard` is left out: it's only rendered there
 * with `deleteUser` set, which this app doesn't — the Settings tab
 * renders its own instead.
 *
 * NOTE: upgrading `@daveyplate/better-auth-ui` won't automatically carry
 * changes to the library's own `SecuritySettingsCards` into this copy.
 */
export function SecurityView() {
  const {
    credentials,
    hooks: { useListAccounts },
    passkey,
    social,
    genericOAuth,
    twoFactor,
  } = useContext(AuthUIContext);

  const {
    data: accounts,
    isPending: accountsPending,
    refetch: refetchAccounts,
  } = useListAccounts();

  const credentialsLinked = accounts?.some(
    (account) => account.providerId === "credential",
  );
  const githubLinked = accounts?.some(
    (account) => account.providerId === "github",
  );
  const hasProviders = Boolean(
    social?.providers?.length || genericOAuth?.providers?.length,
  );

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      {credentials && (
        <ChangePasswordCard
          accounts={accounts}
          isPending={accountsPending}
          skipHook
        />
      )}

      {hasProviders && (
        <div className="flex flex-col gap-3">
          {!accountsPending && (
            <AuthNotice icon={Github}>
              {githubLinked
                ? "Your issues, pull requests and discussions in the strapi/strapi GitHub repository are shown on your public profile. "
                : "Connect your GitHub account to showcase your issues, pull requests and discussions in the strapi/strapi GitHub repository on your public profile. "}
              You can turn this off in your{" "}
              <Link
                href="/account/profile"
                className="font-semibold underline-offset-2 hover:underline"
              >
                Profile settings
              </Link>
              .
            </AuthNotice>
          )}

          <ProvidersCard
            accounts={accounts}
            isPending={accountsPending}
            refetch={refetchAccounts}
            skipHook
          />
        </div>
      )}

      {twoFactor && credentialsLinked && <TwoFactorCard />}

      {passkey && <PasskeysCard />}

      <SessionsCard />
    </div>
  );
}
