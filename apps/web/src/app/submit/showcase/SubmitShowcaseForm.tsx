"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CategorySelect } from "@/features/submit/components/category-select";
import {
  FieldError,
  Hint,
  Label,
  SectionDivider,
  Textarea,
} from "@/features/submit/components/field";
import { ImageUpload } from "@/features/submit/components/image-upload";
import { SubmitFormShell } from "@/features/submit/components/submit-form-shell";
import { useSubmitForm } from "@/features/submit/hooks/use-submit-form";
import { EMAIL_RE, URL_RE } from "@/features/submit/lib/validation";
import type { BaseFormFields, FieldErrors } from "@/features/submit/types";

interface ShowcaseFormFields extends BaseFormFields {
  showcase_name: string;
  url: string;
}

const INITIAL: ShowcaseFormFields = {
  showcase_name: "",
  url: "",
  description: "",
  logo_file: null,
  categories_list: [],
  submission_notes: "",
  owner_name: "",
  owner_email: "",
  agreed: false,
};

function validate(f: ShowcaseFormFields): FieldErrors<ShowcaseFormFields> {
  const e: FieldErrors<ShowcaseFormFields> = {};
  if (!f.showcase_name.trim()) e.showcase_name = "Showcase name is required.";
  if (!f.url.trim()) e.url = "Live URL is required.";
  else if (!URL_RE.test(f.url.trim())) e.url = "Must be a valid https:// URL.";
  if (!f.description.trim()) e.description = "Description is required.";
  if (!f.owner_name.trim()) e.owner_name = "Owner name is required.";
  if (!f.owner_email.trim()) e.owner_email = "Contact email is required.";
  else if (!EMAIL_RE.test(f.owner_email.trim()))
    e.owner_email = "Must be a valid email address.";
  if (!f.agreed) e.agreed = "You must agree to the terms to continue.";
  return e;
}

function buildFormData(
  fields: ShowcaseFormFields,
  recaptchaToken: string,
): FormData {
  const form = new FormData();
  form.append("showcase_name", fields.showcase_name.trim());
  form.append("url", fields.url.trim());
  form.append("description", fields.description.trim());
  form.append("submission_notes", fields.submission_notes.trim());
  form.append("owner_name", fields.owner_name.trim());
  form.append("owner_email", fields.owner_email.trim());
  form.append("categories_list", JSON.stringify(fields.categories_list));
  form.append("submitter_agreed_to_terms", "true");
  form.append("recaptcha_token", recaptchaToken);
  if (fields.logo_file)
    form.append("logo_file", fields.logo_file, fields.logo_file.name);
  return form;
}

const REVIEW_STEPS = [
  {
    title: "Quick review",
    body: "We check that it's a real Strapi project with a working live URL and a brief description.",
  },
  {
    title: "Get discovered",
    body: "Approved showcases are listed in the community showcase gallery for everyone to explore.",
  },
];

export function SubmitShowcaseForm({
  initialCategories,
}: {
  initialCategories: string[];
}) {
  const {
    fields,
    errors,
    submitting,
    success,
    set,
    addCategory,
    removeCategory,
    handleSubmit,
  } = useSubmitForm({
    initial: INITIAL,
    validate,
    apiEndpoint: "/api/submit-showcase",
    recaptchaAction: "submit_showcase",
    buildFormData,
  });

  return (
    <SubmitFormShell
      title="Submit a Showcase"
      subtitle={
        <>
          Share something you&rsquo;ve built with Strapi. All submissions go
          through a quick review before appearing in the community showcase
          gallery. We&rsquo;ll reach out if we need more information.{" "}
          <Link
            href="/community"
            className="underline underline-offset-2 hover:text-(--color-primary600)"
          >
            Community Guidelines
          </Link>
        </>
      }
      reviewSteps={REVIEW_STEPS}
      contentType="showcase"
      success={success}
      submitting={submitting}
      submitLabel="Submit Showcase"
      formError={errors._form}
      onSubmit={handleSubmit}
    >
      <div className="mb-5">
        <Label htmlFor="showcase_name" required>
          Project Name
        </Label>
        <Input
          id="showcase_name"
          value={fields.showcase_name}
          onChange={(e) => set("showcase_name", e.target.value)}
          placeholder="e.g. My Strapi Blog"
          className={errors.showcase_name ? "border-red-400" : ""}
          autoComplete="off"
        />
        <FieldError message={errors.showcase_name} />
      </div>

      <div className="mb-5">
        <Label htmlFor="url" required>
          Live URL
        </Label>
        <Input
          id="url"
          type="url"
          value={fields.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://my-strapi-project.com"
          className={errors.url ? "border-red-400" : ""}
        />
        <FieldError message={errors.url} />
        <Hint>The publicly accessible URL of your project.</Hint>
      </div>

      <div className="mb-5">
        <Label htmlFor="description" required>
          Description
        </Label>
        <Textarea
          id="description"
          value={fields.description}
          onChange={(v) => set("description", v)}
          placeholder="Tell us about your project — what it does, how Strapi powers it, and what makes it interesting."
          rows={4}
          hasError={!!errors.description}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="mb-5">
        <Label htmlFor="logo_file">Screenshot</Label>
        <ImageUpload
          file={fields.logo_file}
          onChange={(f) => set("logo_file", f)}
          hasError={!!errors.logo_file}
        />
        <FieldError message={errors.logo_file as string} />
        <Hint>A screenshot or hero image of your project.</Hint>
      </div>

      <div className="mb-5">
        <Label htmlFor="category_select">Categories</Label>
        <CategorySelect
          allCategories={initialCategories}
          selected={fields.categories_list}
          onAdd={addCategory}
          onRemove={removeCategory}
        />
      </div>

      <SectionDivider label="Owner" />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="owner_name" required>
            Owner / Author Name
          </Label>
          <Input
            id="owner_name"
            value={fields.owner_name}
            onChange={(e) => set("owner_name", e.target.value)}
            placeholder="Your name or organisation"
            className={errors.owner_name ? "border-red-400" : ""}
          />
          <FieldError message={errors.owner_name} />
        </div>
        <div>
          <Label htmlFor="owner_email" required>
            Contact Email
          </Label>
          <Input
            id="owner_email"
            type="email"
            value={fields.owner_email}
            onChange={(e) => set("owner_email", e.target.value)}
            placeholder="you@example.com"
            className={errors.owner_email ? "border-red-400" : ""}
          />
          <FieldError message={errors.owner_email} />
        </div>
      </div>

      <div className="mb-5">
        <Label htmlFor="submission_notes">Notes for Reviewers</Label>
        <Textarea
          id="submission_notes"
          value={fields.submission_notes}
          onChange={(v) => set("submission_notes", v)}
          placeholder="Anything you'd like the review team to know."
          rows={3}
        />
      </div>

      <SectionDivider label="Terms" />

      <div className="mb-6">
        <label
          htmlFor="agreed"
          className="flex cursor-pointer items-start gap-3"
        >
          <Checkbox
            id="agreed"
            checked={fields.agreed}
            onCheckedChange={(checked) => set("agreed", checked === true)}
            className={errors.agreed ? "border-red-400" : ""}
          />
          <span className="text-sm leading-relaxed text-(--color-neutral700)">
            I confirm this project is mine to submit and compliant with the{" "}
            <Link
              href="/community"
              className="underline underline-offset-2 hover:text-(--color-primary600)"
            >
              Community Guidelines
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.agreed} />
      </div>
    </SubmitFormShell>
  );
}
