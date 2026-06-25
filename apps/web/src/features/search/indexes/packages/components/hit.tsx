import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"api::package.package", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  const image = {
    src: hit.icon ? cmsImageUrl(hit.icon.url) : "/package-fallback-icon.png",
    alt: hit.icon?.alternativeText ?? hit.name ?? "",
    size: "S" as const,
  };

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge="Package"
      description={hit.description!}
      owner={hit.owner!}
      labels={hit.labels!}
      image={image as any}
    />
  );
};

export { Hit };
