import { cn } from "@/lib/utils";
import type { displayStatus } from "../lib/types";

type Status = ReturnType<typeof displayStatus>;

const STATUS: Record<Status, { label: string; className: string }> = {
  planned: {
    label: "Planned",
    className: "bg-(--color-neutral150) text-(--color-neutral800)",
  },
  in_progress: {
    label: "In progress",
    className: "bg-(--color-primary100) text-(--color-primary700)",
  },
  beta: {
    label: "Beta",
    className: "bg-(--color-warning100) text-(--color-warning700)",
  },
  shipped: {
    label: "Shipped",
    className: "bg-(--color-success100) text-(--color-success700)",
  },
};

const StatusBadge = ({
  status,
  className,
}: {
  status: Status | null | undefined;
  className?: string;
}) => {
  const config = status ? STATUS[status] : undefined;
  if (!config) return null;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
};

export { StatusBadge };
