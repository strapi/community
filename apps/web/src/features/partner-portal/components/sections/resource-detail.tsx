"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/content/markdown";
import { cn } from "@/lib/utils";
import { usePartnerResource } from "../../lib/partner-portal";
import {
  ResourceIcon,
  ResourceTargetLabel,
  resourceTarget,
} from "./resource-section";
import { cardClassName, Eyebrow } from "./shared";

/** A partner resource's own page — the "child" of its section. */
export function ResourceDetail({
  organizationId,
  slug,
  backHref,
  backLabel,
}: {
  organizationId: number;
  slug: string;
  backHref: string;
  backLabel: string;
}) {
  const { data: resource, isPending } = usePartnerResource(
    organizationId,
    slug,
  );

  const back = (
    <Link
      href={backHref}
      className="inline-flex items-center gap-1 self-start text-sm font-medium text-(--color-neutral700) hover:text-(--color-neutral900)"
    >
      <ArrowLeftIcon className="size-4" />
      {backLabel}
    </Link>
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <div className="h-64 w-full animate-pulse rounded-md bg-(--color-neutral100)" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <p className="text-sm text-(--color-neutral600)">
          This resource doesn't exist or isn't available at your partner level.
        </p>
      </div>
    );
  }

  // Already on the resource's page — only its file or link is left to offer.
  const target = resourceTarget({ ...resource, has_content: false }, "");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {back}

      <div className={cn(cardClassName, "flex flex-col gap-6")}>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-(--color-primary100) text-(--color-primary600)">
            <ResourceIcon name={resource.icon} className="size-5" />
          </span>
          <div className="min-w-0 grow">
            {resource.label && <Eyebrow>{resource.label}</Eyebrow>}
            <h2 className="text-xl font-semibold text-(--color-neutral900)">
              {resource.title}
            </h2>
            {resource.description && (
              <p className="text-sm text-(--color-neutral600)">
                {resource.description}
              </p>
            )}
          </div>
          {target && (
            <a
              href={target.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-(--color-neutral150) px-3 py-1.5 text-xs font-semibold text-(--color-neutral800) hover:bg-(--color-neutral100)"
            >
              <ResourceTargetLabel kind={target.kind} />
            </a>
          )}
        </div>

        {resource.content && <Markdown markdown={resource.content} />}
      </div>
    </div>
  );
}
