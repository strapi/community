"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  BookOpen,
  Check,
  ChevronUp,
  ExternalLink,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import type { RoadmapItem, RoadmapRelease } from "./data";
import { StatusBadge } from "./labels";
import {
  formatDate,
  type GithubLink,
  githubLinkLabel,
  githubLinks,
  type PublicStatus,
  stringList,
} from "./types";

const STATE_LABEL: Record<NonNullable<GithubLink["state"]>, string> = {
  open: "Open",
  closed: "Closed",
  merged: "Merged",
};

function githubLabel(link: GithubLink): string {
  const { label, ref } = githubLinkLabel(link);
  return `${label} ${ref}`;
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-md border border-(--color-neutral150) bg-(--color-neutral100) px-4 py-3">
    <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-(--color-grey700)">
      {title}
    </h3>
    {children}
  </section>
);

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked (insecure context / permissions): no-op.
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-(--color-neutral150) px-3 py-1.5 text-sm font-medium text-(--color-neutral700) hover:border-(--color-primary500)"
    >
      {copied ? (
        <Check className="h-4 w-4 text-(--color-success600)" aria-hidden />
      ) : (
        <LinkIcon className="h-4 w-4" aria-hidden />
      )}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
};

const ItemBody = ({
  item,
  release,
}: {
  item: RoadmapItem;
  release: RoadmapRelease | undefined;
}) => {
  const areas = stringList(item.squads);
  const tags = stringList(item.tags);
  const links = githubLinks(item.github_links);
  const shipped = item.public_status === "shipped";
  const updated = formatDate(item.last_synced_at ?? item.updatedAt);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pr-10">
        <StatusBadge status={item.public_status as PublicStatus} />
        {item.release && (
          <span className="rounded-md border border-(--color-primary200) bg-(--color-primary100) px-2 py-0.5 font-mono text-xs text-(--color-primary700)">
            {item.release}
          </span>
        )}
      </div>
      <DialogPrimitive.Title className="mt-3 text-2xl font-bold text-(--color-primary700)">
        {item.public_title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="mt-3 whitespace-pre-line text-(--color-neutral700)">
        {item.public_description}
      </DialogPrimitive.Description>

      {shipped && item.release && (
        <p className="mt-4 text-sm text-(--color-neutral700)">
          <span className="font-semibold text-(--color-neutral900)">
            Shipped in{" "}
            {release?.url ? (
              <a
                href={release.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-(--color-primary600) hover:underline"
              >
                {item.release}
              </a>
            ) : (
              <span className="font-mono">{item.release}</span>
            )}
          </span>
          {release?.released_at
            ? ` on ${formatDate(release.released_at)}.`
            : "."}
        </p>
      )}
      {!shipped && (item.release || item.delivery_quarter) && (
        <p className="mt-4 text-sm text-(--color-neutral700)">
          <span className="font-semibold text-(--color-neutral900)">
            Target:{" "}
            {[item.release && `release ${item.release}`, item.delivery_quarter]
              .filter(Boolean)
              .join(" · ")}
            .
          </span>{" "}
          That's when we expect to ship it, not a promise.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {item.canny_url && (
          <Section title="Feedback">
            <p className="flex items-center gap-1.5 text-sm text-(--color-neutral700)">
              <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
              {(item.canny_votes ?? 0).toLocaleString()}{" "}
              {item.canny_votes === 1 ? "vote" : "votes"}
              {item.canny_status ? ` · ${item.canny_status}` : ""}
            </p>
            <a
              href={item.canny_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-primary600) hover:underline"
            >
              Vote or comment
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </Section>
        )}

        {links.length > 0 && (
          <Section title="Development">
            <ul className="space-y-1.5 text-sm">
              {links.map((link) => (
                <li
                  key={link.url}
                  className="flex items-center justify-between gap-3"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-(--color-primary600) hover:underline"
                  >
                    {githubLabel(link)}
                  </a>
                  {link.state && (
                    <span className="shrink-0 text-xs text-(--color-neutral600)">
                      {STATE_LABEL[link.state]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {item.docs_link && (
          <Section title="Documentation">
            <a
              href={item.docs_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-(--color-primary600) hover:underline"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Read the docs
            </a>
          </Section>
        )}

        {(areas.length > 0 || tags.length > 0) && (
          <Section title="Details">
            <dl className="space-y-1.5 text-sm text-(--color-neutral700)">
              {areas.length > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-(--color-neutral600)">Area</dt>
                  <dd className="text-right">{areas.join(", ")}</dd>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-(--color-neutral600)">Type</dt>
                  <dd className="text-right">{tags.join(", ")}</dd>
                </div>
              )}
            </dl>
          </Section>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--color-neutral150) pt-4">
        <p className="text-xs text-(--color-neutral600)">
          {updated ? `Last updated ${updated}` : null}
        </p>
        <CopyLinkButton />
      </div>
    </>
  );
};

const RoadmapItemDialog = ({
  item,
  release,
  onClose,
}: {
  item: RoadmapItem | null;
  release?: RoadmapRelease;
  onClose: () => void;
}) => (
  <DialogPrimitive.Root
    open={item !== null}
    onOpenChange={(open) => !open && onClose()}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-(--color-neutral150) bg-white p-6 shadow-lg focus:outline-none sm:p-8">
        {item && <ItemBody item={item} release={release} />}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-md p-1.5 text-(--color-neutral600) hover:bg-(--color-neutral100) hover:text-(--color-neutral900)"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export { RoadmapItemDialog };
