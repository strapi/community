import Image from "next/image";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cn } from "@/lib/utils";
import type { PartnerOrganization } from "../lib/partner-organizations";

/** The organization's logo, falling back to its initials. */
export function OrganizationMark({
  organization,
  size = "default",
}: {
  organization: Pick<PartnerOrganization, "name" | "logo">;
  size?: "default" | "lg";
}) {
  const className = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-(--color-primary100) font-semibold text-(--color-primary600)",
    size === "lg" ? "size-12 text-base" : "size-10 text-sm",
  );

  if (organization.logo) {
    return (
      <span className={className}>
        <Image
          src={cmsImageUrl(organization.logo)}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </span>
    );
  }

  const initials = organization.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return <span className={className}>{initials}</span>;
}
