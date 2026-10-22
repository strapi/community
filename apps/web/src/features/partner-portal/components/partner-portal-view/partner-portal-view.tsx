"use client";

import { useAuthenticate } from "@daveyplate/better-auth-ui";
import {
  BadgeCheckIcon,
  ChartLineIcon,
  CodeXmlIcon,
  FolderIcon,
  IdCardIcon,
  LockIcon,
  type LucideIcon,
  MenuIcon,
  PresentationIcon,
  SendIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  meetsLevel,
  type PartnerLevel,
  type PartnerSection,
  SECTION_MINIMUM_LEVEL,
} from "../../lib/levels";
import {
  type PartnerOrganization,
  usePartnerOrganizations,
} from "../../lib/partner-organizations";
import {
  type PartnerResourceSummary,
  usePartnerPortal,
} from "../../lib/partner-portal";
import { OrganizationMark } from "../organization-mark";
import { ComingSoonSection } from "../sections/coming-soon-section";
import { LockedSection } from "../sections/locked-section";
import { ProgramInfoSection } from "../sections/program-info-section";
import { ResourceDetail } from "../sections/resource-detail";
import { ResourceSection } from "../sections/resource-section";
import { ReusableContentSection } from "../sections/reusable-content-section";

type View =
  | "PROGRAM"
  | "SALES"
  | "TECH"
  | "CONTENT"
  | "SUBMISSIONS"
  | "ARR_TRACKER";

/**
 * URL segment per view (`/partner/<slug>/<segment>`); `PROGRAM` is the
 * index. Resource sections also have a child page per resource
 * (`/partner/<slug>/<segment>/<resource-slug>`).
 */
export const partnerViewPaths: Record<View, string> = {
  PROGRAM: "",
  SALES: "sales-enablement",
  TECH: "tech-enablement",
  CONTENT: "reusable-content",
  SUBMISSIONS: "submissions",
  ARR_TRACKER: "arr-tracker",
};

const NAV_ITEMS: { view: View; label: string; icon: LucideIcon }[] = [
  { view: "PROGRAM", label: "Program information", icon: IdCardIcon },
  { view: "SALES", label: "Sales enablement", icon: PresentationIcon },
  { view: "TECH", label: "Tech enablement", icon: CodeXmlIcon },
  { view: "CONTENT", label: "Reusable content", icon: FolderIcon },
  { view: "SUBMISSIONS", label: "Submissions", icon: SendIcon },
  { view: "ARR_TRACKER", label: "ARR tracker", icon: ChartLineIcon },
];

/** The views backed by CMS `partner-resource` entries, by their `section`. */
const RESOURCE_SECTIONS: Partial<
  Record<View, { section: PartnerSection; description: string }>
> = {
  SALES: {
    section: "sales_enablement",
    description:
      "Everything you need to position and sell Strapi to your clients.",
  },
  TECH: {
    section: "tech_enablement",
    description:
      "Training, certification and technical resources for your delivery team.",
  },
  CONTENT: {
    section: "reusable_content",
    description:
      "Approved assets to use in your own marketing and client pitches.",
  },
};

/** Views planned for a later phase, shown as placeholders for now. */
const LATER_SECTIONS: Partial<
  Record<View, { description: string; badge: string }>
> = {
  SUBMISSIONS: {
    description: "Register deals and send requests to the partner team.",
    badge: "Coming later",
  },
  ARR_TRACKER: {
    description:
      "Track the annual recurring revenue you generate with Strapi, by client and over time.",
    badge: "Not before Q2 2027",
  },
};

type Props = {
  slug: string;
  pathname: string;
};

/**
 * An organization-scoped partner portal — same sidebar + content layout as
 * `OrganizationView`/`AccountView`, but only for owners/admins of an
 * organization flagged as `partner` in the CMS. The route itself already
 * 404s for non-partner organizations; this additionally checks the
 * signed-in user's own membership via `GET /organizations/partners`, and
 * loads the gated content (filtered by partner level in the CMS) via
 * `GET /organizations/:id/partner-portal`.
 */
export function PartnerPortalView({ slug, pathname }: Props) {
  useAuthenticate();

  const { organizations, isPending } = usePartnerOrganizations();
  const organization = organizations.find((org) => org.slug === slug);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [segment = "", resourceSlug] = pathname
    .split("/")
    .filter(Boolean)
    .slice(2);
  const view =
    (Object.entries(partnerViewPaths).find(
      ([, path]) => path === segment,
    )?.[0] as View | undefined) ?? "PROGRAM";

  // Close the mobile nav once navigating to a tab actually lands on it.
  useEffect(() => {
    if (view) setMobileNavOpen(false);
  }, [view]);

  if (isPending) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="h-12 w-64 animate-pulse rounded-md bg-(--color-neutral100)" />
        <div className="h-96 w-full animate-pulse rounded-md bg-(--color-neutral100)" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-(--color-neutral150) px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-(--color-neutral900)">
          No access to this partner portal
        </h1>
        <p className="max-w-md text-sm text-(--color-neutral600)">
          The partner portal is available to owners and admins of partner
          organizations.
        </p>
        <Link
          href="/account"
          className="mt-2 text-sm font-semibold text-(--color-primary600) hover:underline"
        >
          Back to your account
        </Link>
      </div>
    );
  }

  const level: PartnerLevel = organization.partner_level ?? "Unlisted";

  const navHref = (item: { view: View }) =>
    [`/partner/${slug}`, partnerViewPaths[item.view]].filter(Boolean).join("/");

  const isLocked = (item: { view: View }) => {
    const section = RESOURCE_SECTIONS[item.view]?.section;
    return !!section && !meetsLevel(level, SECTION_MINIMUM_LEVEL[section]);
  };

  const navItemClassName = (item: { view: View }) =>
    cn(
      "flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm font-medium transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
      view === item.view
        ? "bg-(--color-neutral100) font-semibold text-(--color-neutral900)"
        : "text-(--color-neutral700) hover:bg-(--color-neutral100)",
    );

  const navLinks = NAV_ITEMS.map((item) => (
    <Link
      key={item.view}
      href={navHref(item)}
      className={navItemClassName(item)}
    >
      <item.icon />
      <span className="grow">{item.label}</span>
      {isLocked(item) && (
        <LockIcon className="text-(--color-neutral600)" aria-label="Locked" />
      )}
      {LATER_SECTIONS[item.view] && (
        <span className="rounded-full bg-(--color-neutral150) px-1.5 py-0.5 text-[10px] font-semibold text-(--color-neutral700)">
          Later
        </span>
      )}
    </Link>
  ));

  const currentItem = NAV_ITEMS.find((item) => item.view === view);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <OrganizationMark organization={organization} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--color-neutral600)">
              Partner portal
            </span>
            <span className="truncate text-base font-semibold text-(--color-neutral900)">
              {organization.name}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-primary200) bg-(--color-primary100) px-3 py-1 text-xs font-semibold text-(--color-primary600)">
            <BadgeCheckIcon className="size-4" />
            {level} partner
          </span>
          <Link
            href={`/org/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-(--color-neutral150) px-3 py-1.5 text-xs font-semibold text-(--color-neutral800) hover:bg-(--color-neutral100)"
          >
            <SettingsIcon className="size-3.5" />
            Organization settings
          </Link>
        </div>
      </div>

      <div className="flex w-full grow flex-col gap-4 md:flex-row md:gap-12">
        {/* Mobile: current view label + toggle for the nav list below it. */}
        <div className="flex items-center justify-between gap-2 md:hidden">
          <span className="font-semibold text-base">{currentItem?.label}</span>

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
          <nav className="flex flex-col gap-1 md:hidden">{navLinks}</nav>
        )}

        {/* Desktop: a persistent sidebar, like the settings pages. */}
        <nav className="hidden md:block">
          <div className="flex w-48 flex-col gap-1 lg:w-60">{navLinks}</div>
        </nav>

        <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
          {currentItem && LATER_SECTIONS[view] ? (
            <ComingSoonSection
              title={currentItem.label}
              description={LATER_SECTIONS[view].description}
              badge={LATER_SECTIONS[view].badge}
              icon={currentItem.icon}
            />
          ) : isLocked({ view }) ? (
            <LockedSection
              title={currentItem?.label ?? ""}
              description={RESOURCE_SECTIONS[view]?.description ?? ""}
              minimumLevel={
                SECTION_MINIMUM_LEVEL[
                  RESOURCE_SECTIONS[view]?.section ?? "reusable_content"
                ]
              }
            />
          ) : (
            <PortalContent
              organization={organization}
              level={level}
              view={view}
              title={currentItem?.label ?? ""}
              sectionHref={navHref({ view })}
              resourceSlug={resourceSlug}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** The views rendered from the CMS's gated partner content. */
function PortalContent({
  organization,
  level,
  view,
  title,
  sectionHref,
  resourceSlug,
}: {
  organization: PartnerOrganization;
  level: PartnerLevel;
  view: View;
  title: string;
  sectionHref: string;
  resourceSlug?: string;
}) {
  const { data: portal, isPending } = usePartnerPortal(organization.id);
  const resourceSection = RESOURCE_SECTIONS[view];

  if (resourceSection && resourceSlug) {
    return (
      <ResourceDetail
        organizationId={organization.id}
        slug={resourceSlug}
        backHref={sectionHref}
        backLabel={title}
      />
    );
  }

  if (isPending) {
    return (
      <div className="h-96 w-full animate-pulse rounded-md bg-(--color-neutral100)" />
    );
  }

  if (!portal) {
    return (
      <p className="text-sm text-(--color-neutral600)">
        The partner portal couldn't be loaded. Please try again later.
      </p>
    );
  }

  if (!resourceSection) {
    return (
      <ProgramInfoSection
        organization={organization}
        level={level}
        benefits={portal.benefits}
      />
    );
  }

  const resources = portal.resources.filter(
    (resource) => resource.section === resourceSection.section,
  );
  const hrefFor = (resource: PartnerResourceSummary) =>
    `${sectionHref}/${resource.slug}`;

  if (view === "CONTENT") {
    return <ReusableContentSection resources={resources} hrefFor={hrefFor} />;
  }

  return (
    <ResourceSection
      title={title}
      description={resourceSection.description}
      resources={resources}
      hrefFor={hrefFor}
    />
  );
}
