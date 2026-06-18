import { Button, Container } from "@repo/strapi-ui";

export default function NotFound() {
  return (
    <main>
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-neutral100)">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8 text-(--color-neutral600)"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-(--color-neutral600) uppercase">
            404
          </p>
          <h1 className="mb-3 text-2xl font-bold text-(--color-neutral800)">
            Page not found
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-(--color-neutral600)">
            We couldn&apos;t find the page you were looking for. It may have
            been moved, deleted, or never existed.
          </p>
          <Button href="/" variant="secondary">
            Back to Marketplace
          </Button>
        </div>
      </Container>
    </main>
  );
}
