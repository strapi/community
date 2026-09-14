import Image from "next/image";
import Link from "next/link";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { SubmissionSummary, SubmissionType } from "../../lib/types";

/** Only worth calling out while it's still in flux — an approved (or unset) status is just the normal state. */
const NOTEWORTHY_STATUSES = new Set([
  "submitted",
  "under_review",
  "changes_requested",
  "rejected",
]);

function StatusBadge({ status }: { status?: string | null }) {
  if (!status || !NOTEWORTHY_STATUSES.has(status)) return null;
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full bg-(--color-neutral100) px-2 py-0.5 text-xs font-medium text-(--color-neutral700) capitalize">
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SubmissionRow({
  item,
  type,
  editHrefFor,
}: {
  item: SubmissionSummary;
  type: SubmissionType;
  editHrefFor: (type: SubmissionType, documentId: string) => string;
}) {
  const image = type === "package" ? item.icon : item.preview_image;

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3 border-b border-(--color-neutral150) py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {image?.url ? (
          <Image
            src={cmsImageUrl(image.url)}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-md border border-(--color-neutral150) object-contain"
          />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-md bg-(--color-neutral100)" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--color-neutral900)">
            {item.name}
          </p>
          {item.description && (
            <p className="truncate text-xs text-(--color-neutral600)">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={item.overall_status} />
        <Link
          href={editHrefFor(type, item.documentId)}
          className="shrink-0 rounded-md border border-(--color-neutral150) px-3 py-1.5 text-xs font-semibold text-(--color-neutral800) hover:bg-(--color-neutral100)"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

function SubmissionSection({
  title,
  items,
  type,
  editHrefFor,
}: {
  title: string;
  items: SubmissionSummary[];
  type: SubmissionType;
  editHrefFor: (type: SubmissionType, documentId: string) => string;
}) {
  return (
    <div className="w-full min-w-0 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-(--color-neutral900)">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-(--color-neutral600)">Nothing here yet.</p>
      ) : (
        <div className="min-w-0">
          {items.map((item) => (
            <SubmissionRow
              key={item.documentId}
              item={item}
              type={type}
              editHrefFor={editHrefFor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The "Submissions" tab's main list — everything owned or maintained, split by content type. */
export function SubmissionList({
  packages,
  templates,
  editHrefFor,
}: {
  packages: SubmissionSummary[];
  templates: SubmissionSummary[];
  editHrefFor: (type: SubmissionType, documentId: string) => string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 md:gap-6">
      <SubmissionSection
        title="Plugins, providers & tools"
        items={packages}
        type="package"
        editHrefFor={editHrefFor}
      />
      <SubmissionSection
        title="Templates"
        items={templates}
        type="template"
        editHrefFor={editHrefFor}
      />
    </div>
  );
}
