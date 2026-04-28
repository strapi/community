import type { Modules } from "@strapi/types";
import { ContentCard } from "@/components/content/card";

type Props = {
  hit: Modules.Documents.Result<
    "api::integration.integration",
    { populate: "*" }
  >;
};

const Hit = ({ hit }: Props) => {
  const image = hit.logo
    ? {
        src: `${process.env.NEXT_PUBLIC_CMS_URL}${hit.logo.url}`,
        alt: hit.logo.alternativeText ?? hit.name ?? "",
        size: "S" as const,
      }
    : undefined;

  return (
    <ContentCard
      link={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      badge="Integration"
      description={hit.description!}
      maintainers={[]}
      labels={null as any}
      image={image as any}
    />
  );
};

export { Hit };
