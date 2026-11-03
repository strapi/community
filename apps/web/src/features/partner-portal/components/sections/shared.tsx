import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const cardClassName =
  "w-full min-w-0 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm";

export function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-(--color-neutral900)">
          {title}
        </h2>
        <p className="text-sm text-(--color-neutral600)">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-(--color-neutral600)",
        className,
      )}
    >
      {children}
    </span>
  );
}
