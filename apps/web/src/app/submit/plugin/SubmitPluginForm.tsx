"use client";

// TODO: Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env (v3 site key from https://www.google.com/recaptcha/admin)

import { Button, Container } from "@repo/strapi-ui";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRef, useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    // reCAPTCHA Enterprise exposes grecaptcha.enterprise, not grecaptcha directly
    grecaptcha: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (
          siteKey: string,
          options: { action: string },
        ) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-(--color-neutral800)"
    >
      {children}
      {required && (
        <span className="ml-0.5 text-(--color-primary600)" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-(--color-neutral600)">{children}</p>;
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  hasError,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hasError?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "flex w-full resize-y rounded-md border bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200)",
        hasError ? "border-red-400" : "border-(--color-neutral150)",
      )}
    />
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-(--color-neutral150)" />
      </div>
      <div className="relative flex justify-start">
        <span className="bg-white pr-3 text-xs font-semibold uppercase tracking-widest text-(--color-neutral600)">
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Logo upload field
// ---------------------------------------------------------------------------

function LogoUpload({
  file,
  onChange,
  hasError,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0] ?? null;
    onChange(f);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id="logo_file"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-sm transition-colors",
          dragOver
            ? "border-(--color-primary600) bg-(--color-primary100)"
            : hasError
              ? "border-red-400 bg-red-50"
              : "border-(--color-neutral150) bg-(--color-neutral100) hover:border-(--color-primary200) hover:bg-(--color-primary100)",
        )}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <Image
              src={preview}
              alt="Logo preview"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-contain"
              unoptimized
            />
            <span className="text-xs text-(--color-neutral600)">
              {file?.name}{" "}
              <span className="text-(--color-primary600) underline">
                Change
              </span>
            </span>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-8 w-8 text-(--color-neutral400)"
            >
              <title>Upload a File</title>
              <path
                d="M12 16V8m0 0-3 3m3-3 3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-(--color-neutral700)">
              Upload a File
            </span>
            <span className="text-xs text-(--color-neutral500)">
              Drag and drop or click to browse — PNG, JPEG, SVG, WebP · max 2 MB
            </span>
          </>
        )}
      </button>

      {/* Clear button */}
      {file && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 text-xs text-(--color-neutral600) hover:text-red-600"
        >
          Remove logo
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category pills
// ---------------------------------------------------------------------------

function CategoryPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary100) px-3 py-1 text-xs font-medium text-(--color-primary700)">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-(--color-primary200)"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormFields {
  plugin_name: string;
  package_location: string;
  repository_url: string;
  description: string;
  logo_file: File | null;
  categories_list: string[];
  readme: string;
  submission_notes: string;
  owner_name: string;
  owner_email: string;
  agreed: boolean;
}

const INITIAL: FormFields = {
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

type FieldErrors = Partial<Record<keyof FormFields | "_form", string>>;

function validate(f: FormFields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.plugin_name.trim()) e.plugin_name = "Plugin name is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  if (!f.repository_url.trim()) {
    e.repository_url = "Repository URL is required.";
  } else if (!/^https?:\/\//i.test(f.repository_url.trim())) {
    e.repository_url = "Must be a valid https:// URL.";
  }
  if (!f.owner_name.trim()) e.owner_name = "Owner name is required.";
  if (!f.owner_email.trim()) {
    e.owner_email = "Contact email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.owner_email.trim())) {
    e.owner_email = "Must be a valid email address.";
  }
  if (!f.agreed) e.agreed = "You must agree to the terms to continue.";
  return e;
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------

function SuccessScreen() {
  return (
    <>
      <Navigation theme="light" />
      <main>
        <Container>
          <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary100)">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-(--color-primary600)"
              >
                <title>Submission received</title>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-(--color-primary800)">
              Submission received!
            </h1>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-(--color-neutral600)">
              Thank you for submitting your plugin. Our team will review it and
              reach out at the email address you provided.
            </p>
            <Button href="/" variant="secondary">
              Back to Marketplace
            </Button>
          </div>
        </Container>
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export function SubmitPluginForm({
  initialCategories,
}: {
  initialCategories: string[];
}) {
  const [fields, setFields] = useState<FormFields>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories] = useState<string[]>(initialCategories);

  const set = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addCategory = (cat: string) => {
    if (cat && !fields.categories_list.includes(cat)) {
      set("categories_list", [...fields.categories_list, cat]);
    }
  };

  const removeCategory = (cat: string) => {
    set(
      "categories_list",
      fields.categories_list.filter((c) => c !== cat),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey as string)?.focus();
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      let recaptchaToken = "";
      if (
        RECAPTCHA_SITE_KEY &&
        typeof window !== "undefined" &&
        window.grecaptcha?.enterprise
      ) {
        await new Promise<void>((resolve) =>
          window.grecaptcha.enterprise.ready(resolve),
        );
        recaptchaToken = await window.grecaptcha.enterprise.execute(
          RECAPTCHA_SITE_KEY,
          {
            action: "submit_plugin",
          },
        );
      }

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
      if (fields.logo_file) {
        form.append("logo_file", fields.logo_file, fields.logo_file.name);
      }

      const res = await fetch("/api/submit-plugin", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        errors?: string[];
      };

      if (!res.ok) {
        setErrors({
          _form:
            (Array.isArray(data.errors) ? data.errors.join(" ") : data.error) ||
            "Something went wrong. Please try again.",
        });
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({
        _form:
          "Could not submit your plugin. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return <SuccessScreen />;

  const availableCategories = categories.filter(
    (c) => !fields.categories_list.includes(c),
  );

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      )}

      <Navigation theme="light" />

      <main className="pb-24">
        <Container>
          {/* Back link */}
          <div className="py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-(--color-neutral600) transition-colors hover:text-(--color-primary600)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <title>Back to submissions</title>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Submit other content
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* ── Left: intro ── */}
            <div className="lg:col-span-2 lg:pt-2">
              <p className="mb-2 text-sm text-(--color-neutral600)">
                Submit your content
              </p>
              <h1 className="mb-4 text-4xl font-bold leading-tight text-(--color-primary800)">
                Submit a Plugin
              </h1>
              <p className="text-sm leading-7 text-(--color-neutral700)">
                Share your Strapi plugin with the community. All submissions go
                through a business and security review before being listed in
                the marketplace. We&rsquo;ll reach out if we need more
                information.{" "}
                <Link
                  href="/community"
                  className="underline underline-offset-2 hover:text-(--color-primary600)"
                >
                  Community Guidelines
                </Link>
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {
                    title: "Business review",
                    body: "We check your repo is public, MIT-licensed, has a README, and lists Strapi as a peer dependency.",
                  },
                  {
                    title: "Security review",
                    body: "We scan dependencies for known vulnerabilities and flag security concerns before listing.",
                  },
                ].map(({ title, body }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-lg border border-(--color-neutral150) bg-(--color-neutral100) px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-primary600) text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-3 w-3"
                      >
                        <title>Business review</title>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--color-neutral800)">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-(--color-neutral600)">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-xl border border-(--color-neutral150) bg-white p-8 shadow-sm"
              >
                {errors._form && (
                  <div
                    role="alert"
                    className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {errors._form}
                  </div>
                )}

                {/* Plugin Name */}
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

                {/* Registry URL */}
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
                    Full URL to your published package on npm, Packagist, PyPI,
                    RubyGems, or NuGet. Leave blank if not yet published.
                  </Hint>
                </div>

                {/* Repository URL */}
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
                  <Hint>
                    GitHub, GitLab, Bitbucket, or any public repository URL.
                  </Hint>
                </div>

                {/* Description */}
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

                {/* Logo upload */}
                <div className="mb-5">
                  <Label htmlFor="logo_file">Plugin Logo / Icon</Label>
                  <LogoUpload
                    file={fields.logo_file}
                    onChange={(f) => set("logo_file", f)}
                    hasError={!!errors.logo_file}
                  />
                  <FieldError message={errors.logo_file as string} />
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <Label htmlFor="category_select">Categories</Label>
                  {fields.categories_list.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {fields.categories_list.map((c) => (
                        <CategoryPill
                          key={c}
                          label={c}
                          onRemove={() => removeCategory(c)}
                        />
                      ))}
                    </div>
                  )}
                  <select
                    id="category_select"
                    className="flex h-10 w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:border-(--color-primary200)"
                    value=""
                    onChange={(e) => {
                      addCategory(e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">
                      {categories.length === 0
                        ? "No categories available"
                        : availableCategories.length === 0
                          ? "All categories selected"
                          : "Select a category to add…"}
                    </option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* README */}
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

                {/* Owner */}
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

                {/* Notes */}
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

                {/* Terms */}
                <div className="mb-6">
                  <label
                    className="flex cursor-pointer items-start gap-3"
                    htmlFor="agreed"
                  >
                    <Checkbox
                      id="agreed"
                      checked={fields.agreed}
                      onCheckedChange={(checked) =>
                        set("agreed", checked === true)
                      }
                      className={errors.agreed ? "border-red-400" : ""}
                    />
                    <span className="text-sm leading-relaxed text-(--color-neutral700)">
                      I confirm this plugin is open-source, MIT-licensed, and
                      compliant with the{" "}
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

                <p className="mb-6 text-xs leading-relaxed text-(--color-neutral600)">
                  By submitting you agree to our review process. We will contact
                  you if we need additional information. Submissions are
                  reviewed manually and may take a few business days.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit Plugin"}
                </Button>

                <p className="mt-4 text-center text-xs text-(--color-neutral600)">
                  Protected by reCAPTCHA —{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Privacy
                  </a>{" "}
                  &amp;{" "}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Terms
                  </a>
                </p>
              </form>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
