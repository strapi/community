import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";

type Props = {
  hit: Modules.Documents.Result<
    "plugin::better-auth.organization",
    { populate: "*" }
  >;
};

const Hit = ({ hit }: Props) => {
  const image = hit.profile?.avatar?.url
    ? {
        src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.profile?.avatar?.url}`,
        alt: hit.name ?? "",
        size: "S" as const,
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
      maintainers={[]}
      labels={null as any}
      image={image as any}
    />
  );
};

export { Hit };
