import {
  Box,
  Card,
  CardBody,
  CardContent,
  Flex,
  Typography,
} from "@strapi/design-system";
import type { Modules } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";
import FeaturedBadge from "@/components/Bades/FeaturedBadge";
import OfficialBadge from "@/components/Bades/OfficialBadge";
import PaidBadge from "@/components/Bades/PaidBadge";
import MaintainersListSmall from "@/components/MaintainersList/Small";

type Props = {
  hit: Modules.Documents.Result<"api::package.package", { populate: "*" }>;
};

const PackageCard = ({ hit }: Props) => {
  return (
    <Link
      style={{
        color: "black",
        textDecoration: "none",
        width: "100%",
        height: "100%",
      }}
      href={hit.url_alias?.[0]?.url_path as string}
    >
      <Card width="100%" padding="16px" height="100%">
        <CardBody direction="column">
          <Flex width="100%" alignItems="start">
            <Image
              src={
                hit.icon
                  ? `${process.env.NEXT_PUBLIC_CMS_URL}${hit.icon.url}`
                  : "/logo-plugin.png"
              }
              width={100}
              height={100}
              alt={hit.name || ""}
            />
            <Flex gap={2} marginLeft="auto" direction="column" alignItems="end">
              {hit.labels?.featured && <FeaturedBadge />}
              {hit.labels?.paid && <PaidBadge />}
              {hit.labels?.official && <OfficialBadge />}
            </Flex>
          </Flex>
          <CardContent marginTop="24px">
            <Flex direction="column" alignItems="start">
              <Typography variant="delta" fontWeight="bold" ellipsis={true}>
                {hit.name}
              </Typography>
              <Typography>{hit.description}</Typography>
              {hit.maintainers && (
                <Box marginTop="16px" width="100%">
                  <MaintainersListSmall maintainers={hit.maintainers} />
                </Box>
              )}
            </Flex>
          </CardContent>
        </CardBody>
      </Card>
    </Link>
  );
};

export default PackageCard;
