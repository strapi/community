import { cn } from "@/lib/utils";

type Props = {
  strapiEmployee?: boolean | null;
  formerStrapiEmployee?: boolean | null;
  className?: string;
};

/**
 * The "Strapi employee" / "Former Strapi employee" tag on a user's profile.
 * `strapi_employee` is membership of the Strapi team's organization;
 * `former_strapi_employee` is set when someone leaves it, or by an admin
 * (see the CMS contributions plugin's `employees` service). Current employment wins when both
 * are set (e.g. someone who came back).
 */
export function EmployeeTag({
  strapiEmployee,
  formerStrapiEmployee,
  className,
}: Props) {
  if (!strapiEmployee && !formerStrapiEmployee) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        strapiEmployee
          ? "border-(--color-primary300) bg-(--color-primary100) text-(--color-primary700)"
          : "border-(--color-success200) bg-(--color-success100) text-(--color-success700)",
        className,
      )}
    >
      {strapiEmployee ? "Strapi employee" : "Former Strapi employee"}
    </span>
  );
}
