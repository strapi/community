import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"api::showcase.showcase", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  const image = hit.image
    ? {
        src: cmsImageUrl(hit.image.url),
        alt: hit.image.alternativeText ?? hit.title ?? "",
        size: "L" as const,
      }
    : undefined;

  return (
    <ContentCard
      link={hit.url!}
      name={hit.title!}
      badge={hit.categories?.[0]?.name ?? "Showcase"}
      description={hit.description!}
      image={image as any}
    />
  );
};

export { Hit };
