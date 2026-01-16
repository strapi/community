"use client";

import { Flex, Grid, Table, Tbody } from "@strapi/design-system";
import { Download } from "@strapi/icons";
import Image from "next/image";
import TimeAgo from "react-timeago";

import stylesPluginList from "@/components/List/styles.module.css";
import styles from "./page.module.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { ActionCard } from "@/components/ActionCard";
import BackLink from "@/components/BackLink";
import TableListItem from "@/components/List";
import type { UserPageData } from "@/features/cms/pages/User/page";

type Props = {
  document: UserPageData;
};

const UserTemplate = ({ document }: Props) => {
  const { profile } = document;

  const packages = (document.packages || []).filter(
    (pkg) => pkg.publishedAt != null,
  );

  const aggregatedDownloads = packages
    .map((pkg) => pkg.npm_downloads)
    .reduce((sum, downloads) => sum + parseInt(String(downloads), 10), 0);

  const mostRecentItem = packages.reduce((latest, current) => {
    return new Date(current.updatedAt || "") > new Date(latest?.updatedAt || "")
      ? current
      : latest;
  }, packages[0]);

  return (
    <>
      <Grid.Item
        col={9}
        gap={"32px"}
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
              alt="Logo plugin"
            />
            <Flex width={"100%"} direction={"column"} alignItems={"flex-start"}>
              <h1 className={styles.pluginTitle}>{profile?.full_name} </h1>
              <p className={styles.plugingShortDescription}>
                {profile?.headline}
              </p>
            </Flex>
          </Flex>
        </Flex>
        <Flex width={"100%"} className={stylesPluginList.pluginListElement}>
          <Table colCount={3} rowCount={10} className={styles.pluginListTable}>
            <Tbody>
              {packages.map((pkg) => (
                <TableListItem
                  key={pkg.id}
                  name={pkg.name || ""}
                  description={pkg.description || ""}
                  downloads={Number(pkg.npm_downloads) || 0}
                  link={pkg.url_alias?.[0]?.url_path || ""}
                  stars={Number(pkg.github_stars) || 0}
                  icon={{
                    url: pkg.icon?.url || "/default-plugin-icon.png",
                    alternativeText: pkg.icon?.alternativeText || "icon",
                  }}
                />
              ))}
            </Tbody>
          </Table>
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
            <p>Cumulated downloads</p>
            <Flex direction={"row"} gap={"4px"}>
              <Download width={12} height={12} color={"#666687"} />
              <p className={styles.valueItem}>
                {aggregatedDownloads.toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={"100%"}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <p>Published packages</p>
            <p className={styles.valueItem}>{packages.length}</p>
          </Flex>
          {mostRecentItem?.updatedAt && (
            <Flex
              className={styles.listItem}
              width={"100%"}
              direction={"row"}
              justifyContent={"space-between"}
            >
              <p>Last update</p>
              <p className={styles.valueItem}>
                <TimeAgo date={mostRecentItem?.updatedAt} />
              </p>
            </Flex>
          )}

          <ActionCard
            className={styles.actionCard}
            title="Contribute"
            text="Develop your own plugin and submit it to the marketplace!"
            type="success"
            link="https://example.com"
          />
        </Flex>
      </Grid.Item>
    </>
  );
};

export default UserTemplate;
