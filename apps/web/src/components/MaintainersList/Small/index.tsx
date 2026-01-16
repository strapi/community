import { Flex, Typography } from "@strapi/design-system";
import type { Modules } from "@strapi/types";
import Image from "next/image";

type Props = {
  maintainers: Modules.Documents.Result<
    "plugin::better-auth.user",
    { populate: ["profile.avatar"] }
  >[];
};

const MaintainersListSmall = ({ maintainers }: Props) => {
  if (maintainers.length === 1) {
    return (
      <Flex>
        <Image
          style={{ borderRadius: "50%" }}
          src={`${process.env.NEXT_PUBLIC_CMS_URL}${maintainers?.[0]?.profile?.avatar.url}`}
          width={32}
          height={32}
          alt={maintainers?.[0]?.profile?.avatar.alternativeText}
        />
        <Typography variant="omega" marginLeft="12px">
          {maintainers?.[0]?.profile?.full_name}
        </Typography>
      </Flex>
    );
  }

  return (
    <Flex>
      {maintainers.map((maintainer, index) => (
        <Image
          key={maintainer.id}
          style={{
            borderRadius: "50%",
            border: "2px solid white",
            marginLeft: index === 0 ? "0" : "-8px",
          }}
          src={`${process.env.NEXT_PUBLIC_CMS_URL}${maintainer?.profile?.avatar.url}`}
          width={32}
          height={32}
          alt={maintainer?.profile?.avatar.alternativeText || ""}
        />
      ))}
    </Flex>
  );
};

export default MaintainersListSmall;
