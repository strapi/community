"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/features/search/components/search-dialog";

type Props = {
  theme: "light" | "dark";
};

const Navigation = ({ theme }: Props) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <nav
        className={`border-b ${theme === "light" ? "border-(--color-neutral300)" : "border-(--color-grey700)"} ${theme === "light" ? "bg-(--background)" : "bg-(--color-hero-bg)"}`}
        style={{
          backgroundImage: `${theme === "light" ? "var(--bg-dotted-pattern-image-light)" : "var(--bg-dotted-pattern-image)"}`,
          backgroundSize: "var(--bg-dotted-pattern-size)",
        }}
      >
        <Container>
          <div
            className={`${theme === "light" ? "bg-(--background)" : "bg-(--color-hero-bg)"} flex h-18 items-center justify-between gap-8 border-x ${theme === "light" ? "border-(--color-neutral300)" : "border-(--color-grey700)"} px-4`}
          >
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="rounded-sm bg-(--color-primary600) px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase"
              >
                Marketplace
              </Link>
              <ul
                className={`hidden items-center gap-6 font-normal text-sm ${theme === "light" ? "text-(--color-primary700)" : "text-(--color-hero-nav-muted)"} lg:flex`}
              >
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
              <Button
                variant="secondary"
                size="small"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
                className="h-10 w-10 rounded-md border-(--color-hero-button-border) bg-(--color-hero-button-hover) p-0 text-white hover:border-(--color-hero-button-border) hover:bg-(--color-hero-button-hover) hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </Button>
              <Button
                href="/login"
                variant="secondary"
                className="h-10 rounded-md border-(--color-hero-button-border) bg-(--color-hero-button-hover) px-6 text-sm font-semibold text-white hover:border-(--color-hero-button-border) hover:bg-(--color-hero-button-hover) hover:text-white"
              >
                Login
              </Button>
              <Button
                href="/signup"
                variant="primary"
                className="h-10 rounded-md bg-(--color-primary600) px-6 text-sm font-semibold text-white hover:bg-(--color-cta-button-hover)"
              >
                Signup
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export { Navigation };
