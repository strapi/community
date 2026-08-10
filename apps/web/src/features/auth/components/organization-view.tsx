"use client";

import {
  ApiKeysCard,
  AuthUIContext,
  getViewByPath,
  OrganizationInvitationsCard,
  OrganizationMembersCard,
  OrganizationSettingsCards,
  organizationViewPaths,
  TeamsCard,
  useAuthenticate,
  useCurrentOrganization,
} from "@daveyplate/better-auth-ui";
import { MenuIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { OrganizationProfile } from "../lib/organization-profile";
import { OrganizationProfileCard } from "./organization-profile-card";

type View = "SETTINGS" | "PROFILE" | "MEMBERS" | "TEAMS" | "API_KEYS";

const viewPaths = { ...organizationViewPaths, PROFILE: "profile" } as const;

type Props = {
  slug?: string;
  pathname?: string;
  organizationId?: string;
  initialProfile?: OrganizationProfile;
};

/**
 * A hand-rolled replacement for `@daveyplate/better-auth-ui`'s
 * `OrganizationView` — that component has no slot/children/extra-tab prop
 * (confirmed against its v3.4.0 source), so adding a real "Profile" tab
 * means reproducing its nav + view switching ourselves. Everything used
 * below besides `OrganizationProfileCard` is a public export of the
 * package; the nav layout (sidebar on desktop, a collapsible list on
 * mobile) mirrors the library's own two-column `OrganizationView`, just
 * built with this app's own Tailwind tokens instead of better-auth-ui's
 * internal Button/Drawer primitives, which aren't exported.
 *
 * NOTE: upgrading `@daveyplate/better-auth-ui` won't automatically carry
 * changes to the library's own `OrganizationView` into this copy.
 */
export function OrganizationView({
  slug: slugProp,
  pathname,
  organizationId,
  initialProfile,
}: Props) {
  const {
    teams: teamOptions,
    organization: organizationOptions,
    account: accountOptions,
    Link,
    replace,
  } = useContext(AuthUIContext);

  const { slug: contextSlug, apiKey } = organizationOptions || {};
  const { enabled: teamsEnabled } = teamOptions || {};

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useAuthenticate();

  const path = pathname?.split("/").pop();
  const view =
    (getViewByPath(viewPaths, path) as View | undefined) ?? "SETTINGS";

  const slug = slugProp || contextSlug;

  const {
    data: organization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
  } = useCurrentOrganization({ slug });

  const navItems = useMemo(() => {
    const items: { view: View; label: string }[] = [
      { view: "SETTINGS", label: "Settings" },
      { view: "PROFILE", label: "Profile" },
      { view: "MEMBERS", label: "Members" },
    ];

    if (teamsEnabled) items.push({ view: "TEAMS", label: "Teams" });
    if (apiKey) items.push({ view: "API_KEYS", label: "API Keys" });

    return items;
  }, [teamsEnabled, apiKey]);

  useEffect(() => {
    if (organization || organizationPending || organizationRefetching) return;

    replace(
      `${accountOptions?.basePath}/${accountOptions?.viewPaths?.ORGANIZATIONS}`,
    );
  }, [
    organization,
    organizationPending,
    organizationRefetching,
    accountOptions?.basePath,
    accountOptions?.viewPaths?.ORGANIZATIONS,
    replace,
  ]);

  // Close the mobile nav once navigating to a tab actually lands on it.
  useEffect(() => {
    if (view) setMobileNavOpen(false);
  }, [view]);

  const navHref = (item: { view: View }) =>
    `${organizationOptions?.basePath}${
      organizationOptions?.pathMode === "slug" ? `/${slug}` : ""
    }/${viewPaths[item.view]}`;

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
        {view === "MEMBERS" && (
          <>
            <OrganizationMembersCard slug={slug} />
            <OrganizationInvitationsCard slug={slug} />
          </>
        )}

        {view === "TEAMS" && organization?.id && teamsEnabled && (
          <TeamsCard organizationId={organization.id} />
        )}

        {view === "API_KEYS" && (
          <ApiKeysCard
            isPending={organizationPending}
            organizationId={organization?.id}
          />
        )}

        {view === "PROFILE" && (
          <OrganizationProfileCard
            organizationId={organizationId}
            initialProfile={initialProfile}
          />
        )}

        {view === "SETTINGS" && <OrganizationSettingsCards slug={slug} />}
      </div>
    </div>
  );
}
