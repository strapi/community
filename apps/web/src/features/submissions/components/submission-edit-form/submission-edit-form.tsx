"use client";

import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/content/markdown-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import {
  FieldError,
  Hint,
  Label,
  SectionDivider,
  Textarea,
} from "@/features/submit/components/field";
import { ImageUpload } from "@/features/submit/components/image-upload";
import { cn } from "@/lib/utils";
import {
  getSubmission,
  updateSubmission,
  uploadSubmissionImage,
} from "../../lib/submission-edit";
import type {
  SubmissionCategory,
  SubmissionDetail,
  SubmissionMaintainer,
  SubmissionType,
} from "../../lib/types";
import {
  DESCRIPTION_MAX_LENGTH,
  type SubmissionFormValues,
  validateSubmissionForm,
} from "../../lib/validation";
import { CategoryPicker } from "./category-picker";
import { DangerZone } from "./danger-zone";
import { MaintainerPicker } from "./maintainer-picker";

const READ_ONLY_COPY: Record<SubmissionType, string> = {
  package: "We do not support updating this at the moment.",
  template: "We do not support updating this at the moment.",
};

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-(--color-neutral700) hover:text-(--color-primary600)"
    >
      <ArrowLeftIcon className="size-4" />
      Back to submissions
    </Link>
  );
}

/** Links to the live public marketplace page — `null` until it's been approved and published. */
function ViewPageLink({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-(--color-neutral700) hover:text-(--color-primary600)"
    >
      View live page
      <ArrowUpRightIcon className="size-4" />
    </Link>
  );
}

export function SubmissionEditForm({
  type,
  documentId,
  allCategories,
  backHref,
}: {
  type: SubmissionType;
  documentId: string;
  allCategories: SubmissionCategory[];
  backHref: string;
}) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState<SubmissionFormValues>({
    name: "",
    description: "",
    preview_link: "",
  });
  const [readme, setReadme] = useState("");
  const [readmeAutoSync, setReadmeAutoSync] = useState(true);
  const [categories, setCategories] = useState<SubmissionCategory[]>([]);
  const [maintainers, setMaintainers] = useState<SubmissionMaintainer[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [touched, setTouched] = useState<
    Partial<Record<keyof SubmissionFormValues, boolean>>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    getSubmission(type, documentId).then((fetched) => {
      if (!active || !fetched) {
        setLoading(false);
        return;
      }

      setDetail(fetched);
      setValues({
        name: fetched.name ?? "",
        description: fetched.description ?? "",
        preview_link: fetched.preview_link ?? "",
      });
      setReadme(fetched.readme ?? "");
      // Syncing is the default — `readme_auto_sync` is `null` for anything
      // created before this field existed, and that must default to
      // synced, not to "manual edit".
      setReadmeAutoSync(fetched.readme_auto_sync !== false);
      setCategories(fetched.categories ?? []);
      setMaintainers(fetched.maintainers ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [type, documentId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink href={backHref} />
        <div className="rounded-md border border-(--color-neutral150) bg-white p-6 text-sm text-(--color-neutral600)">
          Loading…
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink href={backHref} />
        <div className="rounded-md border border-(--color-neutral150) bg-white p-6 text-sm text-(--color-neutral600)">
          This submission couldn't be loaded.
        </div>
      </div>
    );
  }

  const isOwner = detail.isOwner;
  const errors = validateSubmissionForm(type, values);
  const currentImageUrl =
    type === "package" ? detail.icon?.url : detail.preview_image?.url;

  const markTouched = (name: keyof SubmissionFormValues) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isOwner) return;

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      setTouched({ name: true, description: true, preview_link: true });
      return;
    }

    setSubmitting(true);

    if (logoFile) {
      const url = await uploadSubmissionImage(type, documentId, logoFile);
      if (!url) {
        setSubmitting(false);
        return;
      }
      setLogoFile(null);
      // The core `update` route's response below doesn't populate media
      // relations, so reflect the new image immediately here rather than
      // waiting on a reload to show it.
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              ...(type === "package"
                ? { icon: { url } }
                : { preview_image: { url } }),
            }
          : prev,
      );
    }

    const updated = await updateSubmission(type, documentId, {
      name: values.name.trim(),
      description: values.description.trim(),
      categories: categories.map((category) => category.documentId),
      maintainers: maintainers.map((maintainer) => maintainer.documentId),
      readme,
      readme_auto_sync: readmeAutoSync,
      ...(type === "template" && { preview_link: values.preview_link.trim() }),
    });

    setSubmitting(false);

    if (updated) {
      setDetail((prev) => (prev ? { ...prev, ...updated, isOwner } : prev));
      toast.success("Submission updated.");
    }
  };

  const disabled = !isOwner || submitting;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={backHref} />
        <ViewPageLink url={detail.url} />
      </div>

      {!isOwner && (
        <div className="rounded-md border border-(--color-neutral150) bg-(--color-neutral100) px-4 py-3 text-sm text-(--color-neutral700)">
          You don't own this {type} (or manage its owning organization), so
          these fields are read-only.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            id="name"
            value={values.name}
            disabled={disabled}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, name: e.target.value }))
            }
            onBlur={() => markTouched("name")}
            className={
              (touched.name || submitAttempted) && errors.name
                ? "border-red-400"
                : ""
            }
          />
          {(touched.name || submitAttempted) && (
            <FieldError message={errors.name} />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" required={type === "package"}>
              Description
            </Label>
            <span
              className={cn(
                "text-xs text-(--color-neutral600)",
                values.description.length > DESCRIPTION_MAX_LENGTH &&
                  "text-red-600",
              )}
            >
              {values.description.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="description"
            value={values.description}
            disabled={disabled}
            onChange={(v) => setValues((prev) => ({ ...prev, description: v }))}
            rows={3}
            hasError={Boolean(
              (touched.description || submitAttempted) && errors.description,
            )}
          />
          {(touched.description || submitAttempted) && (
            <FieldError message={errors.description} />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image_file">
            {type === "package" ? "Logo" : "Preview image"}
          </Label>
          <div className="flex items-start gap-4">
            {!logoFile && currentImageUrl && (
              <Image
                src={cmsImageUrl(currentImageUrl)}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-lg border border-(--color-neutral150) object-contain"
              />
            )}
            <div
              className={cn(
                "min-w-0 flex-1",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              {/* `display: contents` keeps the fieldset out of the flex
                  layout while still propagating `disabled` to every
                  descendant form control inside `ImageUpload` (its hidden
                  file input and buttons) — the opacity/pointer-events
                  styling above lives on the normal-box wrapper instead,
                  since a `display: contents` element renders no box of
                  its own to apply them to. */}
              <fieldset disabled={disabled} className="contents">
                <ImageUpload file={logoFile} onChange={setLogoFile} />
              </fieldset>
            </div>
          </div>
        </div>

        {type === "template" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preview_link">Preview URL</Label>
            <Input
              id="preview_link"
              value={values.preview_link}
              disabled={disabled}
              placeholder="https://example.com"
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  preview_link: e.target.value,
                }))
              }
              onBlur={() => markTouched("preview_link")}
              className={
                (touched.preview_link || submitAttempted) && errors.preview_link
                  ? "border-red-400"
                  : ""
              }
            />
            {(touched.preview_link || submitAttempted) && (
              <FieldError message={errors.preview_link} />
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category_select">Categories</Label>
          <CategoryPicker
            allCategories={allCategories}
            selected={categories}
            onChange={setCategories}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maintainer_search">Maintainers</Label>
          <MaintainerPicker
            selected={maintainers}
            onAdd={(maintainer) =>
              setMaintainers((prev) => [...prev, maintainer])
            }
            onRemove={(id) =>
              setMaintainers((prev) => prev.filter((m) => m.documentId !== id))
            }
            disabled={disabled}
          />
        </div>

        <SectionDivider label="Readme" />

        <div className="flex flex-col gap-3">
          <label
            className={cn(
              "flex items-start gap-3",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
            htmlFor="readme_auto_sync"
          >
            <Checkbox
              id="readme_auto_sync"
              checked={!readmeAutoSync}
              disabled={disabled}
              onCheckedChange={(checked) => setReadmeAutoSync(checked !== true)}
            />
            <span className="text-sm leading-relaxed text-(--color-neutral700)">
              Edit the readme manually instead of syncing it automatically from
              the {type === "package" ? "registry/repository" : "repository"}.
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="readme">Readme</Label>
            {readmeAutoSync ? (
              <Hint>
                Automatically kept in sync with the{" "}
                {type === "package" ? "package registry" : "git repository"}.
                Check the box above to edit it here instead.
              </Hint>
            ) : null}
            <MarkdownEditor
              id="readme"
              value={readme}
              onChange={setReadme}
              disabled={disabled || readmeAutoSync}
            />
          </div>
        </div>

        <SectionDivider label="Registry & repository" />

        <p className="text-xs text-(--color-neutral600)">
          {READ_ONLY_COPY[type]}
        </p>

        {type === "package" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="package_location">Registry location</Label>
            <Input
              id="package_location"
              value={detail.package_location ?? ""}
              disabled
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="git_repository">Git repository</Label>
          <Input
            id="git_repository"
            value={detail.git_repository ?? ""}
            disabled
          />
        </div>

        {isOwner && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={disabled}
              className="rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </form>

      {isOwner && (
        <DangerZone
          type={type}
          documentId={documentId}
          name={detail.name}
          backHref={backHref}
        />
      )}
    </div>
  );
}
