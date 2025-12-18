import { Flex } from "@strapi/design-system";
import { Download, Star } from "@strapi/icons";
import Image from "next/image";
import Link from "next/link";
import { formatDownloads, formatStars } from "@/utils/numbers";
import styles from "./styles.module.css";

type Props = {
  name: string;
  description: string;
  stars: number;
  downloads: number;
  slug: string;
};

export default function HighlightCard({
  name = "App Version",
  description = "Simple plugin for Strapi 4 to show the app version from package.json in the Settings page",
  stars = 1993,
  downloads = 10,
  slug,
}: Props) {
  return (
    <Link href={`/plugin/${slug}`} className={`${styles.highlightCard}`}>
      <Flex direction={"column"} alignItems={"flex-start"} gap={"8px"}>
        <Flex
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"flex-start"}
          width={"100%"}
        >
          <Image
            src="/logo-plugin.png"
            width={60}
            height={60}
            alt="Logo Plugin"
          />
          <Flex
            direction={"row"}
            className={styles.highlightCardInfo}
            gap={"8px"}
          >
            <span>
              <Flex direction={"row"} alignItems={"center"} gap={"4px"}>
                <Image
                  src="/logo-github.svg"
                  width={12}
                  height={12}
                  alt="Logo GitHub"
                />
                <Star width={12} height={12} color={"#E4A33F"} />
                {formatStars(stars)}
              </Flex>
            </span>
            <span>
              <Flex direction={"row"} alignItems={"center"} gap={"4px"}>
                <Download width={12} height={12} color={"#666687"} />
                {formatDownloads(downloads)}
              </Flex>
            </span>
          </Flex>
        </Flex>
        <h3 className={styles.highlightCardTitle}>{name}</h3>
        <p className={styles.highlightCardText}>{description}</p>
      </Flex>
    </Link>
  );
}
