"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { breadcrumbTrail } from "@/lib/breadcrumbs";

type BreadcrumbsVariant = "full" | "short";

type BreadcrumbsProps = {
  variant?: BreadcrumbsVariant;
};

const Breadcrumbs = ({ variant = "full" }: BreadcrumbsProps) => {
  const pathname = usePathname();
  const allCrumbs = breadcrumbTrail(pathname);

  const crumbs =
    variant === "short" && allCrumbs.length > 3
      ? [
          allCrumbs[0],
          allCrumbs[allCrumbs.length - 2],
          allCrumbs[allCrumbs.length - 1],
        ]
      : allCrumbs;

  const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm font-semibold text-(--color-primary500)"
    >
      {/* Mobile: back link to parent */}
      {parent && (
        <Link
          href={parent.href}
          className="flex items-center gap-1 transition-colors hover:text-white md:hidden"
        >
          <ChevronLeft className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
          {parent.label}
        </Link>
      )}

      {/* Desktop: full trail */}
      <div className="hidden items-center gap-1.5 md:flex">
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
      </div>
    </nav>
  );
};

export { Breadcrumbs };
