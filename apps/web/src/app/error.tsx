"use client";

import { Button, Container } from "@repo/strapi-ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-danger100)">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8 text-red-600"
              aria-hidden="true"
            >
              <path d="m10.29 3.86-8.47 14.67A2 2 0 0 0 3.54 21h16.92a2 2 0 0 0 1.72-3.01L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-red-600 uppercase">
            500
          </p>
          <h1 className="mb-3 text-2xl font-bold text-(--color-neutral800)">
            Something went wrong
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-(--color-neutral600)">
            We ran into an unexpected error on our end. Please try again — if
            the problem keeps happening, feel free to reach out.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
            <Button href="/" variant="outline">
              Back to Marketplace
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
