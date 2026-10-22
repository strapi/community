"use client";

import {
  ApiKeysCard,
  AuthUIContext,
  getViewByPath,
  OrganizationInvitationsCard,
  OrganizationLogo,
  OrganizationMembersCard,
  OrganizationSettingsCards,
  organizationViewPaths,
  TeamsCard,
  useAuthenticate,
  useCurrentOrganization,
} from "@daveyplate/better-auth-ui";
import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { SubmissionsView } from "@/features/submissions/components/submissions-view";
import type {
  SubmissionCategory,
  SubmissionType,
} from "@/features/submissions/lib/types";
import { cn } from "@/lib/utils";
import type { OrganizationProfile } from "../../lib/organization-profile";
import { ProfileView } from "../profile-view";
import { SettingsContextSwitcher } from "../settings-context-switcher";

type View =
  | "SETTINGS"
  | "PROFILE"
  | "MEMBERS"
  | "TEAMS"
  | "API_KEYS"
  | "SUBMISSIONS";

const viewPaths = {
  ...organizationViewPaths,
  PROFILE: "profile",
  SUBMISSIONS: "submissions",
} as const;

type Props = {
  slug?: string;
  pathname?: string;
  organizationId?: string;
  initialProfile?: OrganizationProfile;
  packageCategories?: SubmissionCategory[];
  templateCategories?: SubmissionCategory[];
};

/**
 * A hand-rolled replacement for `@daveyplate/better-auth-ui`'s
 * `OrganizationView` — that component has no slot/children/extra-tab prop
 * (confirmed against its v3.4.0 source), so adding a real "Profile" tab
 * means reproducing its nav + view switching ourselves. Everything used
 * below besides `ProfileView` is a public export of the package; the nav
 * layout (sidebar on desktop, a collapsible list on
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
  packageCategories = [],
  templateCategories = [],
}: Props) {
  const {
    teams: teamOptions,
    organization: organizationOptions,
    account: accountOptions,
    localization,
    Link,
    replace,
  } = useContext(AuthUIContext);

  const { slug: contextSlug, apiKey } = organizationOptions || {};
  const { enabled: teamsEnabled } = teamOptions || {};

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useAuthenticate();

  // Same nested-path handling as `account-view.tsx` — see its comment for
  // why `getViewByPath` alone isn't enough for the "Submissions" edit
  // screen (`/org/<slug>/submissions/<type>/<documentId>/edit`). Two fixed
  // segments here (`org`, `<slug>`) instead of one (`account`).
  const segments = pathname?.split("/").filter(Boolean).slice(2) ?? [];
  const isSubmissionEdit = segments[0] === "submissions" && segments.length > 2;
  const editTarget =
    isSubmissionEdit && segments[1] && segments[2]
      ? { type: segments[1] as SubmissionType, documentId: segments[2] }
      : undefined;

  const view: View = isSubmissionEdit
    ? "SUBMISSIONS"
    : ((getViewByPath(viewPaths, segments[0]) as View | undefined) ??
      "SETTINGS");

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
      { view: "SUBMISSIONS", label: "Submissions" },
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

  const submissionsBase = `${organizationOptions?.basePath}${
    organizationOptions?.pathMode === "slug" ? `/${slug}` : ""
  }/${viewPaths.SUBMISSIONS}`;

  const navItemClassName = (item: { view: View }) =>
    cn(
      "w-full rounded-md px-4 py-2 text-left text-sm font-medium transition-colors",
      view === item.view
        ? "bg-(--color-neutral100) font-semibold text-(--color-neutral900)"
        : "text-(--color-neutral700) hover:bg-(--color-neutral100)",
    );

  const organizationName = organization?.name || localization?.ORGANIZATION;

  // A hand-rolled stand-in for `OrganizationCellView` — same logo + name
  // layout, but with the "View profile" link where it would otherwise
  // hardcode the organization's slug as the subtitle (no prop overrides
  // that).
  const identity = (size: "default" | "lg") => (
    <div className="flex items-center gap-2">
      <OrganizationLogo
        organization={organization}
        isPending={organizationPending}
        size={size}
      />
      <div className="flex flex-col truncate text-left leading-tight">
        <span
          className={cn(
            "truncate font-semibold",
            size === "lg" ? "text-base" : "text-sm",
          )}
        >
          {organizationName}
        </span>

        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1 truncate text-xs font-medium text-(--color-primary600) hover:underline"
        >
          View profile
          <ArrowUpRightIcon className="size-3 shrink-0" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {/*
       * "Settings context" switcher — makes it obvious which organization
       * is being edited (as opposed to the signed-in user's own settings)
       * and doubles as the way back to personal settings or across to
       * another organization. On mobile (no room for a header bar) it
       * stands alone, full-width (below its own identity + "View profile"
       * row, kept separate so its label stays legible on narrow screens);
       * on desktop it sits in its own bar above the sidebar + content
       * row, aligned with both: identity and the profile link on the
       * left, the switch itself on the far right.
       */}
      <div className="md:hidden">{identity("default")}</div>

      <SettingsContextSwitcher slug={slug} className="md:hidden" />

      <div className="hidden items-center justify-between gap-4 md:flex">
        {identity("lg")}

        <SettingsContextSwitcher slug={slug} />
      </div>

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

        <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
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

          {view === "SUBMISSIONS" && (
            <SubmissionsView
              variant="organization"
              organizationId={
                organizationId ??
                (organization?.id != null ? String(organization.id) : undefined)
              }
              editTarget={editTarget}
              backHref={submissionsBase}
              editHrefFor={(type, documentId) =>
                `${submissionsBase}/${type}/${documentId}/edit`
              }
              packageCategories={packageCategories}
              templateCategories={templateCategories}
            />
          )}

          {view === "PROFILE" && (
            <ProfileView
              variant="organization"
              organizationId={organizationId}
              initialProfile={initialProfile}
            />
          )}

          {view === "SETTINGS" && (
            <OrganizationSettingsCards
              slug={slug}
              classNames={{
                // Shared across every card here (logo/name/slug/delete —
                // `classNames.card` is broadcast to all of them, and the
                // delete card in turn shares it between its always-visible
                // settings-card blurb and its confirmation dialog), but
                // scoping on `data-slot` keeps this out of every other card
                // and out of the settings-card blurb — only the dialog's
                // own description (rendered via `DialogDescription`, whose
                // `data-slot` differs from the card's `CardDescription`)
                // picks up the warning-box styling. Mirrors the same trick
                // in `account-view.tsx`'s `<DeleteAccountCard>`.
                card: {
                  description:
                    "data-[slot=dialog-description]:rounded-md data-[slot=dialog-description]:border data-[slot=dialog-description]:border-red-200 data-[slot=dialog-description]:bg-red-50 data-[slot=dialog-description]:px-4 data-[slot=dialog-description]:py-3 data-[slot=dialog-description]:text-red-700",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
