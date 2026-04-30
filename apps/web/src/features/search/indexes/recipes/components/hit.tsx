import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"api::recipe.recipe", { populate: "*" }>;
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
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.title!}
      badge="Recipe"
      description={hit.description!}
      maintainers={[]}
      labels={null as any}
      image={image as any}
    />
  );
};

export { Hit };
