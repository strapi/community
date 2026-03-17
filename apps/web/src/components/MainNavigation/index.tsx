import Link from "next/link";
import Container from "@/components/Container";

const MainNavigation = () => {
  return (
    <nav className="border-b border-(--color-hero-border) bg-(--color-hero-bg)">
      <Container className="flex h-18 items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded-sm bg-(--color-primary600) px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase"
          >
            Marketplace
          </Link>
          <ul className="hidden items-center gap-6 text-sm text-(--color-hero-nav-muted) lg:flex">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Packages
              </Link>
            </li>
            <li>
              <Link
                href="/templates"
                className="transition-colors hover:text-white"
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                href="/showcases"
                className="transition-colors hover:text-white"
              >
                Showcases
              </Link>
            </li>
            <li>
              <Link
                href="/recipes"
                className="transition-colors hover:text-white"
              >
                Recipes
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                className="transition-colors hover:text-white"
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                href="/help"
                className="font-semibold text-white transition-colors"
              >
                Help
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md border border-(--color-hero-button-border) text-base text-white transition-colors hover:bg-(--color-hero-button-hover)"
            aria-label="Search"
          >
            ⌕
          </button>
          <Link
            href="/login"
            className="rounded-md border border-(--color-hero-button-border) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-hero-button-hover)"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-cta-button-hover)"
          >
            Signup
          </Link>
        </div>
      </Container>
    </nav>
  );
};

export default MainNavigation;
