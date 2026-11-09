"use client";

import { ArrowUpRightIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Link from "next/link";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cn } from "@/lib/utils";
import type { PartnerResourceSummary } from "../../lib/partner-portal";
import { cardClassName, Eyebrow, SectionHeader } from "./shared";

/** The resource's icon, as picked with the CMS's lucide icon field. */
export function ResourceIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  if (!name) return <FileTextIcon className={className} />;

  return (
    <DynamicIcon
      name={name as IconName}
      className={className}
      fallback={() => <FileTextIcon className={className} />}
    />
  );
}

/**
 * Where a resource card leads: its own page when it has a body,
 * otherwise straight to its file or external link.
 */
export function resourceTarget(
  resource: PartnerResourceSummary,
  pageHref: string,
) {
  if (resource.has_content) return { href: pageHref, kind: "page" as const };
  if (resource.file) {
    return { href: cmsImageUrl(resource.file.url), kind: "file" as const };
  }
  if (resource.link) return { href: resource.link, kind: "link" as const };
  return null;
}

export function ResourceTargetLabel({
  kind,
}: {
  kind: "page" | "file" | "link";
}) {
  if (kind === "file") {
    return (
      <>
        <DownloadIcon className="size-3.5" />
        Download
      </>
    );
  }

  return (
    <>
      {kind === "page" ? "Read more" : "Open"}
      <ArrowUpRightIcon className="size-3.5" />
    </>
  );
}

function ResourceCard({
  resource,
  href,
}: {
  resource: PartnerResourceSummary;
  href: string;
}) {
  const target = resourceTarget(resource, href);

  const body = (
    <>
      <span className="flex size-10 items-center justify-center rounded-md bg-(--color-primary100) text-(--color-primary600)">
        <ResourceIcon name={resource.icon} className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-(--color-neutral900)">
        {resource.title}
      </h3>
      {resource.description && (
        <p className="grow text-sm text-(--color-neutral600)">
          {resource.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        {resource.label ? <Eyebrow>{resource.label}</Eyebrow> : <span />}
        {target && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary600)">
            <ResourceTargetLabel kind={target.kind} />
          </span>
        )}
      </div>
    </>
  );

  const className = cn(
    cardClassName,
    "flex flex-col gap-3 transition-colors",
    target && "hover:border-(--color-primary200)",
  );

  if (!target) return <div className={className}>{body}</div>;

  if (target.kind === "page") {
    return (
      <Link href={target.href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a
      href={target.href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {body}
    </a>
  );
}

export function ResourceGrid({
  resources,
  hrefFor,
}: {
  resources: PartnerResourceSummary[];
  hrefFor: (resource: PartnerResourceSummary) => string;
}) {
  if (resources.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-(--color-neutral150) px-6 py-10 text-center text-sm text-(--color-neutral600)">
        Nothing here yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.documentId}
          resource={resource}
          href={hrefFor(resource)}
        />
      ))}
    </div>
  );
}

export function ResourceSection({
  title,
  description,
  resources,
  hrefFor,
}: {
  title: string;
  description: string;
  resources: PartnerResourceSummary[];
  hrefFor: (resource: PartnerResourceSummary) => string;
}) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionHeader title={title} description={description} />
      <ResourceGrid resources={resources} hrefFor={hrefFor} />
    </div>
  );
}
