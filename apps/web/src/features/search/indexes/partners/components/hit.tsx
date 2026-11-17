import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { getPartnerBadgeColors } from "@/lib/partner-levels";

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

  const badgeColors = getPartnerBadgeColors(hit.partner_level);

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge={hit.partner_level!}
      badgeColor={badgeColors?.badgeColor}
      badgeTextColor={badgeColors?.badgeTextColor}
      description={(hit.profile as any)?.bio ?? ""}
      labels={null as any}
      image={image as any}
    />
  );
};

export { Hit };
