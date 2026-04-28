import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";

type Props = {
  hit:
    | Modules.Documents.Result<"api::package.package", { populate: "*" }>
    | Modules.Documents.Result<"api::template.template", { populate: "*" }>;
};

const getImageUrl = (hit: Props["hit"]) => {
  if ("preview_image" in hit && hit.preview_image) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.preview_image.url}`,
      alt: hit.preview_image.alternativeText ?? hit.name ?? "",
      size: "L" as const,
    };
  }
  if ("icon" in hit && hit.icon) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.icon.url}`,
      alt: hit.icon.alternativeText ?? hit.name ?? "",
      size: "S" as const,
    };
  }
};

const Hit = ({ hit }: Props) => {
  const image = getImageUrl(hit);

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge={"preview_link" in hit ? "Template" : "Package"}
      description={hit.description!}
      maintainers={hit.maintainers || []}
      labels={hit.labels!}
      image={image as any}
    />
  );
};

export { Hit };
