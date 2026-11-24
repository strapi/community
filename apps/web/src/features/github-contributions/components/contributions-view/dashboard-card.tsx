import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Inline links in the section's copy. */
export const linkClassName =
  "font-semibold text-(--color-primary600) underline-offset-2 hover:underline";

/** A settings-style card — a block of the "Community points" section. */
export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "flex w-full scroll-mt-6 flex-col gap-5 rounded-md border border-(--color-neutral150) bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-(--color-neutral900)">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-(--color-neutral600)">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
