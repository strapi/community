import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "./shared";

export function ComingSoonSection({
  title,
  description,
  badge,
  icon: Icon,
}: {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-(--color-neutral150) px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-md bg-(--color-neutral100) text-(--color-neutral700)">
        <Icon className="size-6" />
      </span>
      <Eyebrow className="text-(--color-primary600)">{badge}</Eyebrow>
      <h2 className="text-xl font-semibold text-(--color-neutral900)">
        {title}
      </h2>
      <p className="max-w-md text-sm text-(--color-neutral600)">
        {description}
      </p>
    </div>
  );
}
