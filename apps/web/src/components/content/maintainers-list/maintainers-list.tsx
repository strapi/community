import type { Modules } from "@strapi/types";
import Image from "next/image";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  maintainers: Modules.Documents.Result<
    "plugin::better-auth.user",
    { populate: ["profile.avatar"] }
  >[];
};

const MaintainersList = ({ maintainers }: Props) => {
  if (maintainers.length === 1) {
    return (
      <div className="flex items-center">
        <Image
          style={{ borderRadius: "50%" }}
          src={cmsImageUrl(maintainers?.[0]?.profile?.avatar.url)}
          width={32}
          height={32}
          alt={maintainers?.[0]?.profile?.avatar.alternativeText}
        />
        <span className="ml-3 text-sm font-medium text-(--color-neutral800)">
          {maintainers?.[0]?.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex">
      {maintainers.map((maintainer, index) => (
        <Image
          key={maintainer.id}
          style={{
            borderRadius: "50%",
            border: "2px solid white",
            marginLeft: index === 0 ? "0" : "-8px",
          }}
          src={cmsImageUrl(maintainer?.profile?.avatar.url)}
          width={32}
          height={32}
          alt={maintainer?.profile?.avatar.alternativeText || ""}
        />
      ))}
    </div>
  );
};

export { MaintainersList };
