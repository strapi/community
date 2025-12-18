import { Button, Flex, Td, Tr } from "@strapi/design-system";
import { Download, Star } from "@strapi/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDownloads, formatStars } from "@/utils/numbers";

import styles from "./styles.module.css";

type Props = {
  name: string;
  description: string;
  stars: number;
  downloads: number;
  link: string;
  icon: {
    url: string;
    alternativeText: string | null;
  };
};

export default function TableListItem(props: Props) {
  const router = useRouter();

  return (
    <Tr
      key={`pluginList_${props.link}`}
      className={styles.pluginListRow}
      onClick={() => router.push(`${props.link}`)}
    >
      <Td className={styles.pluginListElementFirstItem}>
        <Image
          className={styles.pluginListRowIcon}
          src={process.env.NEXT_PUBLIC_CMS_URL + props.icon.url}
          width={30}
          height={30}
          alt={props.icon.alternativeText || "icon"}
        />
      </Td>
      <Td className={styles.pluginListRowMain}>
        <h4 className={styles.pluginListRowTitle}>{props.name}</h4> —{" "}
        {props.description}
      </Td>
      <Td className={styles.pluginListElementStats}>
        <Flex
          direction={"row"}
          className={styles.highlightCardInfo}
          gap={"8px"}
          justifyContent={"end"}
        >
          <span>
            <Flex
              direction={"row"}
              alignItems={"center"}
              gap={"4px"}
              justifyContent={"end"}
            >
              <Image
                src="/logo-github.svg"
                width={12}
                height={12}
                alt="Logo GitHub"
              />
              <Star width={12} height={12} color={"#E4A33F"} />
              {formatStars(props.stars)}
            </Flex>
          </span>
          <span>
            <Flex
              direction={"row"}
              alignItems={"center"}
              gap={"4px"}
              justifyContent={"end"}
            >
              <Download width={12} height={12} color={"#666687"} />
              {formatDownloads(props.downloads)}
            </Flex>
          </span>
        </Flex>
      </Td>
      <Td className={styles.pluginListElementLastItem}>
        <Button
          variant={"tertiary"}
          size={"S"}
          onClick={() => router.push(`${props.link}`)}
        >
          More
        </Button>
      </Td>
    </Tr>
  );
}
