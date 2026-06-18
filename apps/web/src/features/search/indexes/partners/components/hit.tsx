import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<
    "plugin::better-auth.organization",
    { populate: "*" }
  >;
};

const Hit = ({ hit }: Props) => {
  const image = hit.logo
    ? {
        src: cmsImageUrl(hit.logo),
        alt: hit.name ?? "",
        size: "M" as const,
      }
    : undefined;

  const getBadgeColors = (level: string) => {
    switch (level) {
      case "Enterprise":
        return {
          badgeColor: "bg-(--color-warning100)",
          badgeTextColor: "text-(--color-warning700)",
        };
      case "Business":
        return {
          badgeColor: "bg-(--color-primary200)",
          badgeTextColor: "text-(--color-primary700)",
        };
      case "Community":
        return {
          badgeColor: "bg-(--color-success100)",
          badgeTextColor: "text-(--color-success700)",
        };
      default:
        return null;
    }
  };

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge={hit.partner_level!}
      badgeColor={getBadgeColors(hit.partner_level!)?.badgeColor}
      badgeTextColor={getBadgeColors(hit.partner_level!)?.badgeTextColor}
      description={(hit.profile as any)?.bio ?? ""}
      labels={null as any}
      image={image as any}
    />
  );
};

export { Hit };
