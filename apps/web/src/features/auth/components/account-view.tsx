"use client";

import {
  AccountSettingsCards,
  ApiKeysCard,
  AuthUIContext,
  accountViewPaths,
  getViewByPath,
  OrganizationsCard,
  SecuritySettingsCards,
  UserInvitationsCard,
  useAuthenticate,
} from "@daveyplate/better-auth-ui";
import { MenuIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { UserProfileCard } from "./user-profile-card";

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
 * besides `UserProfileCard` is a public export of the package; the nav
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
    Link,
  } = useContext(AuthUIContext);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useAuthenticate();

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

  return (
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

        {view === "PROFILE" && <UserProfileCard />}

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
  );
}
