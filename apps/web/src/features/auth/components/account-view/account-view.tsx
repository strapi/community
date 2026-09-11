"use client";

import {
  AccountSettingsCards,
  ApiKeysCard,
  AuthUIContext,
  accountViewPaths,
  getViewByPath,
  OrganizationsCard,
  SecuritySettingsCards,
  UserAvatar,
  UserInvitationsCard,
  useAuthenticate,
} from "@daveyplate/better-auth-ui";
import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileView } from "../profile-view";
import { SettingsContextSwitcher } from "../settings-context-switcher";

type View = "SETTINGS" | "PROFILE" | "SECURITY" | "API_KEYS" | "ORGANIZATIONS";

const viewPaths = { ...accountViewPaths, PROFILE: "profile" } as const;

type Props = {
  pathname?: string;
};

/**
 * A hand-rolled replacement for `@daveyplate/better-auth-ui`'s
 * `AccountView` — mirrors `OrganizationView`'s approach (see that
 * component's comment) for the same reason: the library's own component
 * has no slot for an extra tab, so adding a personal "Profile" tab means
 * reproducing its nav + view switching ourselves. Everything used below
 * besides `ProfileView` is a public export of the package; the nav
 * layout (sidebar on desktop, a collapsible list on mobile) mirrors the
 * library's own two-column `AccountView`, just built with this app's own
 * Tailwind tokens instead of better-auth-ui's internal Button/Drawer
 * primitives, which aren't exported.
 *
 * NOTE: upgrading `@daveyplate/better-auth-ui` won't automatically carry
 * changes to the library's own `AccountView` into this copy.
 */
export function AccountView({ pathname }: Props) {
  const {
    apiKey,
    organization: organizationOptions,
    localization,
    Link,
    hooks: { useSession },
  } = useContext(AuthUIContext);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useAuthenticate();

  const { data: sessionData, isPending: sessionPending } = useSession();

  // `slug` is a custom `additionalFields` entry (see use-auth-ui-props.tsx)
  // not present on better-auth-ui's own `User` type — see the same cast
  // in auth-navigation.tsx, which links to this same public profile URL.
  const userSlug = (sessionData?.user as { slug?: string } | undefined)?.slug;

  const path = pathname?.split("/").pop();
  const view =
    (getViewByPath(viewPaths, path) as View | undefined) ?? "SETTINGS";

  const navItems = useMemo(() => {
    const items: { view: View; label: string }[] = [
      { view: "SETTINGS", label: "Settings" },
      { view: "PROFILE", label: "Profile" },
      { view: "SECURITY", label: "Security" },
    ];

    if (apiKey) items.push({ view: "API_KEYS", label: "API Keys" });
    if (organizationOptions) {
      items.push({ view: "ORGANIZATIONS", label: "Organizations" });
    }

    return items;
  }, [apiKey, organizationOptions]);

  // Close the mobile nav once navigating to a tab actually lands on it.
  useEffect(() => {
    if (view) setMobileNavOpen(false);
  }, [view]);

  const navHref = (item: { view: View }) => `/account/${viewPaths[item.view]}`;

  const navItemClassName = (item: { view: View }) =>
    cn(
      "w-full rounded-md px-4 py-2 text-left text-sm font-medium transition-colors",
      view === item.view
        ? "bg-(--color-neutral100) font-semibold text-(--color-neutral900)"
        : "text-(--color-neutral700) hover:bg-(--color-neutral100)",
    );

  const userName =
    sessionData?.user?.name || sessionData?.user?.email || localization?.USER;

  // A hand-rolled stand-in for `UserView` — same avatar + name layout,
  // but with the "View profile" link where `UserView` would otherwise
  // hardcode the user's email as the subtitle (no prop overrides that).
  const identity = (size: "default" | "lg") => (
    <div className="flex items-center gap-2">
      <UserAvatar
        user={sessionData?.user}
        isPending={sessionPending}
        size={size}
      />
      <div className="flex flex-col truncate text-left leading-tight">
        <span
          className={cn(
            "truncate font-semibold",
            size === "lg" ? "text-base" : "text-sm",
          )}
        >
          {userName}
        </span>

        {userSlug && (
          <Link
            href={`/${userSlug}`}
            className="inline-flex items-center gap-1 truncate text-xs font-medium text-(--color-primary600) hover:underline"
          >
            View profile
            <ArrowUpRightIcon className="size-3 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {/*
       * "Settings context" switcher — with no active organization here,
       * it renders as "Personal Account", making it obvious this is the
       * top-level context, while still offering a one-click jump into any
       * of the user's organizations. On mobile it stands alone, full-width
       * (below its own identity + "View profile" row, kept separate so
       * its label stays legible on narrow screens); on desktop it sits in
       * its own bar above the sidebar + content row, aligned with both
       * (see that same choice, and why, on `OrganizationView`): identity
       * and the profile link on the left, the switch on the far right.
       */}
      {organizationOptions && (
        <>
          <div className="md:hidden">{identity("default")}</div>

          <SettingsContextSwitcher className="md:hidden" />

          <div className="hidden items-center justify-between gap-4 md:flex">
            {identity("lg")}

            <SettingsContextSwitcher />
          </div>
        </>
      )}

      <div className="flex w-full grow flex-col gap-4 md:flex-row md:gap-12">
        {/* Mobile: current view label + toggle for the nav list below it. */}
        <div className="flex items-center justify-between gap-2 md:hidden">
          <span className="font-semibold text-base">
            {navItems.find((item) => item.view === view)?.label}
          </span>

          <button
            type="button"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
            className="rounded-md border border-(--color-neutral150) p-2 text-(--color-neutral700)"
          >
            {mobileNavOpen ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="flex flex-col gap-1 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.view}
                href={navHref(item)}
                className={navItemClassName(item)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop: a persistent sidebar, like better-auth-ui's own layout. */}
        <div className="hidden md:block">
          <div className="flex w-48 flex-col gap-1 lg:w-60">
            {navItems.map((item) => (
              <Link
                key={item.view}
                href={navHref(item)}
                className={navItemClassName(item)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 md:gap-6">
          {view === "SETTINGS" && <AccountSettingsCards />}

          {view === "PROFILE" && <ProfileView variant="user" />}

          {view === "SECURITY" && <SecuritySettingsCards />}

          {view === "API_KEYS" && apiKey && <ApiKeysCard />}

          {view === "ORGANIZATIONS" && organizationOptions && (
            <div className="grid w-full gap-4 md:gap-6">
              <OrganizationsCard />
              <UserInvitationsCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
