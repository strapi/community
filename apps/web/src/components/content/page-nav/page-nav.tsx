"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PageNavItem = {
  id: string;
  label: string;
};

type PageNavProps = {
  // Provide items explicitly (e.g. known page sections)
  items?: PageNavItem[];
  // OR: ID of a content container to scan for h2/h3 headings automatically
  contentId?: string;
  title?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const PageNav = ({
  items,
  contentId,
  title = "On this page",
}: PageNavProps) => {
  const [navItems, setNavItems] = useState<PageNavItem[]>(items ?? []);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Auto-scan for headings when contentId is provided
  useEffect(() => {
    if (!contentId || items?.length) return;

    const container = document.getElementById(contentId);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3"));
    const discovered: PageNavItem[] = headings
      .filter((el) => el.textContent?.trim())
      .map((el) => {
        if (!el.id) {
          el.id = slugify(el.textContent ?? "");
        }
        return { id: el.id, label: el.textContent?.trim() ?? "" };
      });

    setNavItems(discovered);
  }, [contentId, items]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (!navItems.length) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0% -60% 0%", threshold: 0 },
    );

    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [navItems]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  if (!navItems.length) return null;

  return (
    <div className="sticky top-20">
      <div className="rounded-md mb-2 bg-(--color-neutral100) border border-(--color-neutral150) px-5 py-4">
        <p className="mb-3 text-[13px] font-bold uppercase tracking-wider text-(--color-grey700)">
          {title}
        </p>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "block text-sm transition-colors",
                  activeId === item.id
                    ? "font-medium text-(--color-primary600)"
                    : "text-(--color-neutral500) hover:text-(--color-primary600)",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export type { PageNavItem };
export { PageNav };
