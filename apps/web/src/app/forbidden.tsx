import { Button, Container } from "@repo/strapi-ui";

export default function Forbidden() {
  return (
    <main>
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-warning100)">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8 text-(--color-warning700)"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-(--color-warning700) uppercase">
            403
          </p>
          <h1 className="mb-3 text-2xl font-bold text-(--color-neutral800)">
            Access denied
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-(--color-neutral600)">
            You don&apos;t have permission to view this page. Try signing in, or
            head back to the marketplace.
          </p>
          <Button href="/" variant="secondary">
            Back to Marketplace
          </Button>
        </div>
      </Container>
    </main>
  );
}
