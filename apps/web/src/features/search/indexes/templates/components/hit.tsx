import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";

type Props = {
  hit: Modules.Documents.Result<"api::template.template", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  const image = hit.preview_image
    ? {
        src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.preview_image.url}`,
        alt: hit.preview_image.alternativeText ?? hit.name ?? "",
        size: "L" as const,
      }
    : undefined;

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge="Template"
      description={hit.description!}
      maintainers={hit.maintainers || []}
      labels={hit.labels!}
      image={image as any}
    />
  );
};

export { Hit };
