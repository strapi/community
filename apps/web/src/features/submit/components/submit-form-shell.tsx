import { Button, Container } from "@repo/strapi-ui";
import Link from "next/link";
import Script from "next/script";
import { Navigation } from "@/components/layout/navigation";
import { RECAPTCHA_SITE_KEY } from "../lib/recaptcha";

interface ReviewStep {
  title: string;
  body: string;
}

interface SubmitFormShellProps {
  title: string;
  subtitle: React.ReactNode;
  reviewSteps: ReviewStep[];
  contentType: string;
  success: boolean;
  submitting: boolean;
  submitLabel: string;
  formError?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

function SuccessScreen({ contentType }: { contentType: string }) {
  return (
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
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-(--color-primary800)">
            Submission received!
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-(--color-neutral600)">
            Thank you for submitting your {contentType}. Our team will review it
            and reach out at the email address you provided.
          </p>
          <Button href="/" variant="secondary">
            Back to Marketplace
          </Button>
        </div>
      </Container>
    </main>
  );
}

export function SubmitFormShell({
  title,
  subtitle,
  reviewSteps,
  contentType,
  success,
  submitting,
  submitLabel,
  formError,
  onSubmit,
  children,
}: SubmitFormShellProps) {
  if (success) return <SuccessScreen contentType={contentType} />;

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      )}

      <main className="pb-24">
        <Container>
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
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Submit other content
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2 lg:pt-2">
              <p className="mb-2 text-sm text-(--color-neutral600)">
                Submit your content
              </p>
              <h1 className="mb-4 text-4xl font-bold leading-tight text-(--color-primary800)">
                {title}
              </h1>
              <p className="text-sm leading-7 text-(--color-neutral700)">
                {subtitle}
              </p>

              <div className="mt-8 space-y-3">
                {reviewSteps.map(({ title: stepTitle, body }) => (
                  <div
                    key={stepTitle}
                    className="flex gap-3 rounded-lg border border-(--color-neutral150) bg-(--color-neutral100) px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-primary600) text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--color-neutral800)">
                        {stepTitle}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-(--color-neutral600)">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <form
                onSubmit={onSubmit}
                noValidate
                className="rounded-xl border border-(--color-neutral150) bg-white p-8 shadow-sm"
              >
                {formError && (
                  <div
                    role="alert"
                    className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {formError}
                  </div>
                )}

                {children}

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
                  {submitting ? "Submitting…" : submitLabel}
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
