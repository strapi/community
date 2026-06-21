"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbsVariant = "full" | "short";

type BreadcrumbsProps = {
  variant?: BreadcrumbsVariant;
};

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Breadcrumbs = ({ variant = "full" }: BreadcrumbsProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const allCrumbs = [
    { label: "Strapi Community Hub", href: "/" },
    ...segments.map((segment, index) => ({
      label: slugToLabel(segment),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];

  // "short" variant: home + direct parent + current (skip intermediate segments)
  const crumbs =
    variant === "short" && allCrumbs.length > 3
      ? [
          allCrumbs[0],
          allCrumbs[allCrumbs.length - 2],
          allCrumbs[allCrumbs.length - 1],
        ]
      : allCrumbs;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm font-semibold text-(--color-primary500)"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        if (!crumb) return null;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 opacity-50"
                aria-hidden="true"
              />
            )}
            {isLast ? (
              <span>{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-white"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export { Breadcrumbs };
