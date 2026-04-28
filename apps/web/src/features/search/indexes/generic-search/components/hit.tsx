import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";

type Props = {
  hit:
    | Modules.Documents.Result<"api::package.package", { populate: "*" }>
    | Modules.Documents.Result<"api::template.template", { populate: "*" }>
    | Modules.Documents.Result<"api::recipe.recipe", { populate: "*" }>
    | Modules.Documents.Result<
        "api::integration.integration",
        { populate: "*" }
      >;
};

const getImageUrl = (hit: Props["hit"]) => {
  if ("preview_image" in hit && hit.preview_image) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.preview_image.url}`,
      alt:
        hit.preview_image.alternativeText ??
        ("name" in hit ? hit.name : "") ??
        "",
      size: "L" as const,
    };
  }
  if ("icon" in hit && hit.icon) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.icon.url}`,
      alt: hit.icon.alternativeText ?? ("name" in hit ? hit.name : "") ?? "",
      size: "S" as const,
    };
  }
  if ("logo" in hit && hit.logo) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.logo.url}`,
      alt: hit.logo.alternativeText ?? ("name" in hit ? hit.name : "") ?? "",
      size: "S" as const,
    };
  }
  if ("image" in hit && hit.image) {
    return {
      src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.image.url}`,
      alt: hit.image.alternativeText ?? ("name" in hit ? hit.name : "") ?? "",
      size: "L" as const,
    };
  }
};

const Hit = ({ hit }: Props) => {
  const image = getImageUrl(hit);
  const hitAny = hit as any;
  const name = (hitAny.name ?? hitAny.title ?? "") as string;

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={name}
      badge={"preview_link" in hit ? "Template" : "Package"}
      description={hit.description!}
      maintainers={"maintainers" in hit ? hit.maintainers || [] : []}
      labels={"labels" in hit ? hit.labels! : (null as any)}
      image={image as any}
    />
  );
};

export { Hit };
