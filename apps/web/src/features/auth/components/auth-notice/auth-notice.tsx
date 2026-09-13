import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AuthNoticeProps = {
  icon: LucideIcon;
  children: ReactNode;
};

/**
 * A small informational banner rendered above an auth view's card (e.g.
 * sign-in/sign-up) — for surfacing context the underlying
 * `@daveyplate/better-auth-ui` view doesn't provide on its own, such as why
 * the visitor landed there. Sized by its parent rather than a width of its
 * own, so it lines up with whatever auth card it sits above.
 */
export function AuthNotice({ icon: Icon, children }: AuthNoticeProps) {
  return (
    <div
      role="status"
      className="flex w-full items-start gap-3 rounded-md border border-(--color-primary200) bg-(--color-primary100) px-4 py-3 text-(--color-primary800) text-sm"
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
