import { ShieldCheck, ShieldEllipsis, ShieldX } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";

const SECURITY_STYLES = {
  passed: {
    wrapper: "border-green-200 bg-green-50",
    icon: <ShieldCheck className="h-8 w-8 shrink-0 text-green-500" />,
    badge: "bg-green-100 text-green-700",
    label: "Security check passed",
  },
  failed: {
    wrapper: "border-red-200 bg-red-50",
    icon: <ShieldX className="h-8 w-8 shrink-0 text-red-500" />,
    badge: "bg-red-100 text-red-700",
    label: "Security check failed",
  },
  pending: {
    wrapper: "border-(--color-primary300) bg-(--color-primary100)",
    icon: (
      <ShieldEllipsis className="h-8 w-8 shrink-0 text-(--color-primary800)" />
    ),
    badge: "bg-(--color-neutral150) text-(--color-neutral600)",
    label: null,
  },
};

const VersionSecurityBadge = ({
  version,
  checkedAt,
  status,
  command,
}: {
  version: string;
  command: string;
  checkedAt: Date | string;
  status: "passed" | "failed" | "pending";
}) => {
  const styles = SECURITY_STYLES[status];
  const date = new Date(checkedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-5 py-4 ${styles.wrapper}`}
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        <div className="flex mb-4 gap-2 items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xl text-(--color-primary800)">
              v{version}
            </span>
            {styles.label && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
              >
                {styles.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-(--color-neutral500)">
            released {date}
          </p>
        </div>
        <CodeBlock language="bash" value={command} copyable />
      </div>
    </div>
  );
};

export { VersionSecurityBadge };
