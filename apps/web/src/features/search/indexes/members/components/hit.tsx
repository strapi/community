import type { Modules } from "@strapi/types";
import { UserCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"plugin::better-auth.user", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  console.log("hit", hit);
  return (
    <UserCard
      profileUrl={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      bio={hit.profile?.bio!}
      avatarUrl={hit.image ? cmsImageUrl(hit.image) : undefined}
    />
  );
};

export { Hit };
