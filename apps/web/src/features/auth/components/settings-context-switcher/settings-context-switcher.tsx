"use client";

import {
  AuthUIContext,
  OrganizationLogo,
  UserAvatar,
} from "@daveyplate/better-auth-ui";
import { ChevronsUpDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** The active organization's slug, when viewing an organization's
   * settings. Omit when viewing the signed-in user's own settings. */
  slug?: string;
  className?: string;
};

const itemClassName =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-(--color-neutral100)";

/**
 * A hand-rolled stand-in for `@daveyplate/better-auth-ui`'s
 * `OrganizationSwitcher` — used the same way, in the same spots
 * (`AccountView`/`OrganizationView`), but that component's dropdown rows
 * aren't customizable beyond CSS classnames (confirmed against its
 * v3.4.0 source: `OrganizationCellView`'s subtitle is hardcoded to the
 * organization's `slug`, with no prop to override the text itself), and
 * this app wants a fixed "Organization" label there instead of the slug.
 * Built entirely from the library's own exported pieces (`OrganizationLogo`,
 * `UserAvatar`, `AuthUIContext`) plus a plain click-outside/Escape-to-close
 * dropdown — the library's own Button/DropdownMenu primitives aren't
 * exported (see `OrganizationView`'s comment for the same constraint).
 *
 * Only supports this app's own config (`pathMode: "slug"` — see
 * use-auth-ui-props.tsx): switching is always a navigation, never
 * `authClient.organization.setActive`.
 */
export function SettingsContextSwitcher({ slug, className }: Props) {
  const {
    organization: organizationOptions,
    localization,
    hooks: { useSession, useListOrganizations },
    Link,
  } = useContext(AuthUIContext);

  // `AuthUIContext`'s `Link` type only declares `href`/`className`/
  // `children`, but this app's own implementation (use-auth-ui-props.tsx)
  // spreads every other prop onto `next/link`'s `Link`, which does accept
  // `onClick` — widen the type here to close the dropdown on navigation.
  const NavLink = Link as unknown as (props: {
    href: string;
    onClick?: () => void;
    className?: string;
    children: ReactNode;
  }) => ReactNode;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: sessionData } = useSession();
  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations();

  const otherOrganizations = (organizations ?? []).filter(
    (organization) => organization.slug !== slug,
  );

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
        return;
      }

      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  // Nothing to switch to — the user isn't a member of any organization
  // (so there's no org list, and, since that also means they can't be
  // viewing an organization's settings, no "Personal Account" entry to
  // offer either).
  if (!organizationsPending && organizations?.length === 0) return null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-(--color-neutral150) px-3 py-2 text-left text-sm font-semibold text-(--color-neutral700) transition-colors hover:bg-(--color-neutral100)"
      >
        Switch settings context
        <ChevronsUpDownIcon className="size-4 shrink-0 text-(--color-neutral600)" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-full min-w-56 rounded-md border border-(--color-neutral150) bg-(--background) p-1 shadow-md">
          {slug && (
            <>
              <NavLink
                href={organizationOptions?.personalPath ?? "/account"}
                onClick={() => setOpen(false)}
                className={itemClassName}
              >
                <UserAvatar user={sessionData?.user} size="sm" />
                <span className="flex flex-col truncate text-left leading-tight">
                  <span className="truncate text-sm font-semibold">
                    {sessionData?.user?.name ||
                      sessionData?.user?.email ||
                      localization?.USER}
                  </span>
                  <span className="truncate text-xs opacity-70">
                    {localization?.PERSONAL_ACCOUNT}
                  </span>
                </span>
              </NavLink>

              {otherOrganizations.length > 0 && (
                <div className="my-1 border-t border-(--color-neutral150)" />
              )}
            </>
          )}

          {otherOrganizations.map((organization) => (
            <NavLink
              key={organization.id}
              href={`${organizationOptions?.basePath}/${organization.slug}`}
              onClick={() => setOpen(false)}
              className={itemClassName}
            >
              <OrganizationLogo organization={organization} size="sm" />
              <span className="flex flex-col truncate text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  {organization.name}
                </span>
                <span className="truncate text-xs opacity-70">
                  {localization?.ORGANIZATION}
                </span>
              </span>
            </NavLink>
          ))}

          {organizationsPending && (
            <div className="px-2 py-1.5 text-xs text-(--color-neutral600)">
              Loading…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
