"use client";

import { Button, Container } from "@repo/strapi-ui";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthNavigation } from "@/features/auth/components/auth-navigation";
import { isAuthEnabled } from "@/features/auth/lib/is-enabled";
import { cn } from "@/lib/utils";

interface NavLink {
  id: string | number;
  label?: string | null;
  link?: string | null;
}

interface MobileNavProps {
  navLinks: NavLink[];
  ctaLinks: NavLink[];
  theme: "light" | "dark";
  currentPath: string;
}

const MobileNav = ({
  navLinks,
  ctaLinks,
  theme,
  currentPath,
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = () => {
    const nav = triggerRef.current?.closest("nav");
    setPanelTop(nav ? nav.getBoundingClientRect().bottom : 0);
    setIsOpen(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={cn(
          "lg:hidden rounded-md p-2 transition-colors",
          isDark
            ? "text-(--color-hero-muted) hover:text-white"
            : "text-(--color-neutral700) hover:text-(--color-primary800)",
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 w-full cursor-default bg-black/30 lg:hidden"
            style={{ top: panelTop }}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
          <div
            style={{ top: panelTop }}
            className={cn(
              "fixed inset-x-0 z-20 border-b lg:hidden",
              isDark
                ? "border-(--color-grey700) bg-(--color-hero-bg)"
                : "border-(--color-neutral300) bg-(--background)",
            )}
          >
            <Container>
              <div
                className={cn(
                  "border-x px-4 py-3",
                  isDark
                    ? "border-(--color-grey700)"
                    : "border-(--color-neutral300)",
                )}
              >
                <ul className="flex flex-col">
                  {navLinks.map((link) => {
                    const isActive =
                      currentPath === link.link ||
                      currentPath.startsWith(`${link.link}/`);

                    return (
                      <li key={link.id}>
                        <Link
                          href={link.link!}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                            isDark
                              ? "text-(--color-hero-muted) hover:bg-white/5 hover:text-white"
                              : "text-(--color-primary700) hover:bg-(--color-neutral100) hover:text-(--color-primary900)",
                            isActive &&
                              (isDark
                                ? "text-white"
                                : "font-semibold text-(--color-primary900)"),
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div
                  className={cn(
                    "mt-4 flex flex-col gap-3 border-t pb-5 pt-5",
                    isDark
                      ? "border-(--color-grey700)"
                      : "border-(--color-neutral300)",
                  )}
                >
                  {isAuthEnabled ? (
                    <AuthNavigation theme={theme} />
                  ) : (
                    ctaLinks.map((link) => (
                      <Button key={link.id} asChild>
                        <Link
                          href={link.link!}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export { MobileNav };
