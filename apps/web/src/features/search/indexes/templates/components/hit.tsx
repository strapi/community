import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"api::template.template", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  const image = {
    src: hit.preview_image
      ? cmsImageUrl(hit.preview_image.url)
      : "/template-fallback-preview.png",
    alt: hit.preview_image?.alternativeText ?? hit.name ?? "",
    size: "L" as const,
  };

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge="Template"
      description={hit.description!}
      owner={hit.owner!}
      labels={hit.labels!}
      image={image as any}
    />
  );
};

export { Hit };
