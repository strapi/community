"use client";

import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { Flex, Grid } from "@strapi/design-system";
import { Download, ExternalLink, Star } from "@strapi/icons";
import Image from "next/image";

import Link from "next/link";
import TimeAgo from "react-timeago";
import { ActionCard } from "@/components/ActionCard/actionCard";
import BackLink from "@/components/BackLink/backLink";
import type { PackagePageData } from "@/templates/Package/page";
import styles from "./page.module.css";

type Props = {
  document: PackagePageData;
};

const PackageTemplate = ({ document }: Props) => {
  const { author } = document;

  return (
    <>
      <Grid.Item
        col={9}
        direction={"column"}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
      >
        <Flex
          width={"100%"}
          gap={"32px"}
          direction={"column"}
          className={styles.leftSection}
        >
          <Flex width={"100%"}>
            <BackLink to={"/"} />
          </Flex>

          <Flex
            width={"100%"}
            gap={"24px"}
            direction={"row"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
          >
            <Image
              src="/logo-plugin.png"
              width={60}
              height={60}
              alt="Logo of the plugin"
            />
            <Flex width={"100%"} direction={"column"} alignItems={"flex-start"}>
              <h1 className={styles.pluginTitle}>{document.name} </h1>
              <p className={styles.plugingShortDescription}>
                {document.description}
              </p>
            </Flex>
          </Flex>
          {document.content && (
            <Flex width={"100%"} direction={"row"}>
              <BlocksRenderer
                content={document.content}
                blocks={{
                  // You can use the default components to set class names...
                  paragraph: ({ children }) => (
                    <p className={styles.paragraph}>{children}</p>
                  ),
                }}
              />
            </Flex>
          )}
        </Flex>
      </Grid.Item>
      <Grid.Item
        col={3}
        direction={"column"}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
      >
        <h3 className={`${styles.detailsTitle} ${styles.rightSection}`}>
          Details
        </h3>
        <Flex width={"100%"} direction={"column"}>
          <Flex
            className={styles.listItem}
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <p>Downloads</p>
            <Flex direction={"row"} gap={"4px"}>
              <Download width={12} height={12} color={"#666687"} />
              <p className={styles.valueItem}>
                {document.downloads?.toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <p>GitHub stars</p>
            <Flex direction={"row"} gap={"4px"}>
              <Image
                src="/logo-github.svg"
                width={12}
                height={12}
                alt="Logo GitHub"
              />
              <Star width={12} height={12} color={"#E4A33F"} />
              <p className={styles.valueItem}>
                {document.stars?.toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <p>Author</p>
            {author?.username && author.url_alias?.[0]?.url_path ? (
              <Link
                href={author.url_alias?.[0]?.url_path}
                className={`${styles.valueItem} ${styles.authorName}`}
              >
                {author.username}
              </Link>
            ) : (
              <p className={`${styles.valueItem} ${styles.authorName}`}>
                Unknown
              </p>
            )}
          </Flex>
          <Flex
            className={styles.listItem}
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <p>Compatible version</p>
            <p className={styles.valueItem}>{document.version || "Unknown"}</p>
          </Flex>
          {document.updatedAt && (
            <Flex
              className={styles.listItem}
              width={"100%"}
              direction={"row"}
              justifyContent={"space-between"}
            >
              <p>Last update</p>
              <p className={styles.valueItem}>
                <TimeAgo date={document.updatedAt} />
              </p>
            </Flex>
          )}
          {document.npm_package && (
            <Flex
              className={styles.listItem}
              width={"100%"}
              direction={"row"}
              justifyContent={"space-between"}
            >
              <p>npm package</p>
              <p className={styles.valueItem}>
                <Link className={styles.linkDetail} href={document.npm_package}>
                  See{" "}
                  <ExternalLink
                    className={styles.actionCardIcon}
                    width={"12px"}
                    height={"12px"}
                  />
                </Link>
              </p>
            </Flex>
          )}
          {document.git_repository && (
            <Flex
              className={styles.listItem}
              width={"100%"}
              direction={"row"}
              justifyContent={"space-between"}
            >
              <p>Repository</p>
              <p className={styles.valueItem}>
                <Link
                  className={styles.linkDetail}
                  href={document.git_repository}
                >
                  See{" "}
                  <ExternalLink
                    className={styles.actionCardIcon}
                    width={"12px"}
                    height={"12px"}
                  />
                </Link>
              </p>
            </Flex>
          )}
          <ActionCard
            className={styles.actionCard}
            title="Found an issue?"
            text="Something is wrong or doesn’t work as expected? Report the issue to the author."
            link="https://example.com"
            type="danger"
          />
        </Flex>
      </Grid.Item>
    </>
  );
};

export default PackageTemplate;
