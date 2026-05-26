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

interface PluginFormFields extends BaseFormFields {
  plugin_name: string;
  package_location: string;
  readme: string;
}

const INITIAL: PluginFormFields = {
  plugin_name: "",
  package_location: "",
  repository_url: "",
  description: "",
  logo_file: null,
  categories_list: [],
  readme: "",
  submission_notes: "",
  owner_name: "",
  owner_email: "",
  agreed: false,
};

function validate(f: PluginFormFields): FieldErrors<PluginFormFields> {
  const e: FieldErrors<PluginFormFields> = {};
  if (!f.plugin_name.trim()) e.plugin_name = "Plugin name is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  if (!f.repository_url.trim())
    e.repository_url = "Repository URL is required.";
  else if (!URL_RE.test(f.repository_url.trim()))
    e.repository_url = "Must be a valid https:// URL.";
  if (!f.owner_name.trim()) e.owner_name = "Owner name is required.";
  if (!f.owner_email.trim()) e.owner_email = "Contact email is required.";
  else if (!EMAIL_RE.test(f.owner_email.trim()))
    e.owner_email = "Must be a valid email address.";
  if (!f.agreed) e.agreed = "You must agree to the terms to continue.";
  return e;
}

function buildFormData(
  fields: PluginFormFields,
  recaptchaToken: string,
): FormData {
  const form = new FormData();
  form.append("plugin_name", fields.plugin_name.trim());
  form.append("package_location", fields.package_location.trim());
  form.append("repository_url", fields.repository_url.trim());
  form.append("description", fields.description.trim());
  form.append("readme", fields.readme.trim());
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
    title: "Business review",
    body: "We check your repo is public, MIT-licensed, has a README, and lists Strapi as a peer dependency.",
  },
  {
    title: "Security review",
    body: "We scan dependencies for known vulnerabilities and flag security concerns before listing.",
  },
];

export function SubmitPluginForm({
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
    apiEndpoint: "/api/submit-plugin",
    recaptchaAction: "submit_plugin",
    buildFormData,
  });

  return (
    <SubmitFormShell
      title="Submit a Plugin"
      subtitle={
        <>
          Share your Strapi plugin with the community. All submissions go
          through a business and security review before being listed in the
          marketplace. We&rsquo;ll reach out if we need more information.{" "}
          <Link
            href="/community"
            className="underline underline-offset-2 hover:text-(--color-primary600)"
          >
            Community Guidelines
          </Link>
        </>
      }
      reviewSteps={REVIEW_STEPS}
      contentType="plugin"
      success={success}
      submitting={submitting}
      submitLabel="Submit Plugin"
      formError={errors._form}
      onSubmit={handleSubmit}
    >
      <div className="mb-5">
        <Label htmlFor="plugin_name" required>
          Plugin Name
        </Label>
        <Input
          id="plugin_name"
          value={fields.plugin_name}
          onChange={(e) => set("plugin_name", e.target.value)}
          placeholder="e.g. Strapi Plugin SEO"
          className={errors.plugin_name ? "border-red-400" : ""}
          autoComplete="off"
        />
        <FieldError message={errors.plugin_name} />
      </div>

      <div className="mb-5">
        <Label htmlFor="package_location">Registry URL</Label>
        <Input
          id="package_location"
          value={fields.package_location}
          onChange={(e) => set("package_location", e.target.value)}
          placeholder="https://www.npmjs.com/package/your-plugin"
          autoComplete="off"
        />
        <Hint>
          Full URL to your published package on npm, Packagist, PyPI, RubyGems,
          or NuGet. Leave blank if not yet published.
        </Hint>
      </div>

      <div className="mb-5">
        <Label htmlFor="repository_url" required>
          Repository URL
        </Label>
        <Input
          id="repository_url"
          type="url"
          value={fields.repository_url}
          onChange={(e) => set("repository_url", e.target.value)}
          placeholder="https://github.com/org/repo or https://gitlab.com/org/repo"
          className={errors.repository_url ? "border-red-400" : ""}
        />
        <FieldError message={errors.repository_url} />
        <Hint>GitHub, GitLab, Bitbucket, or any public repository URL.</Hint>
      </div>

      <div className="mb-5">
        <Label htmlFor="description" required>
          Plugin Description
        </Label>
        <Textarea
          id="description"
          value={fields.description}
          onChange={(v) => set("description", v)}
          placeholder="Tell us about your plugin — what it does and why it's useful."
          rows={4}
          hasError={!!errors.description}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="mb-5">
        <Label htmlFor="logo_file">Plugin Logo / Icon</Label>
        <ImageUpload
          file={fields.logo_file}
          onChange={(f) => set("logo_file", f)}
          hasError={!!errors.logo_file}
        />
        <FieldError message={errors.logo_file as string} />
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

      <div className="mb-5">
        <Label htmlFor="readme">README / Documentation</Label>
        <Textarea
          id="readme"
          value={fields.readme}
          onChange={(v) => set("readme", v)}
          placeholder="Paste your plugin's README or any additional documentation here."
          rows={6}
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
          className="flex cursor-pointer items-start gap-3"
          htmlFor="agreed"
        >
          <Checkbox
            id="agreed"
            checked={fields.agreed}
            onCheckedChange={(checked) => set("agreed", checked === true)}
            className={errors.agreed ? "border-red-400" : ""}
          />
          <span className="text-sm leading-relaxed text-(--color-neutral700)">
            I confirm this plugin is open-source, MIT-licensed, and compliant
            with the{" "}
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
