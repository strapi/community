import type { Modules } from "@strapi/types";
import { UserCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"plugin::better-auth.user", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  return (
    <UserCard
      profileUrl={hit.url_alias?.[0]?.url_path!}
      name={hit.name!}
      bio={hit.profile?.bio!}
      avatarUrl={
        hit.profile?.avatar ? cmsImageUrl(hit.profile.avatar.url) : undefined
      }
    />
  );
};

export { Hit };
