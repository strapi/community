"use client";

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="lg:col-span-9">
        <div className={`${styles.leftSection} flex w-full flex-col gap-8`}>
          <div className="w-full">
            <BackLink to={"/"} />
          </div>

          <div className="flex w-full items-start justify-start gap-6">
            <Image
              src="/logo-plugin.png"
              width={60}
              height={60}
              alt="Logo plugin"
            />
            <div className="flex w-full flex-col items-start">
              <h1 className={styles.pluginTitle}>{profile?.full_name} </h1>
              <p className={styles.plugingShortDescription}>
                {profile?.headline}
              </p>
            </div>
          </div>
        </div>
        <div className={`${stylesPluginList.pluginListElement} w-full`}>
          <table className={`${styles.pluginListTable} w-full`}>
            <tbody>
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
            </tbody>
          </table>
        </div>
      </section>
      <aside className="lg:col-span-3">
        <h3 className={`${styles.detailsTitle} ${styles.rightSection}`}>
          Details
        </h3>
        <div className="flex w-full flex-col">
          <div className={`${styles.listItem} flex w-full items-center justify-between`}>
            <p>Cumulated downloads</p>
            <span className="flex items-center gap-1">
              {/* <Download width={12} height={12} color={"var(--color-neutral600)"} /> */}
              <p className={styles.valueItem}>
                {aggregatedDownloads.toLocaleString()}
              </p>
            </span>
          </div>
          <div className={`${styles.listItem} flex w-full items-center justify-between`}>
            <p>Published packages</p>
            <p className={styles.valueItem}>{packages.length}</p>
          </div>
          {mostRecentItem?.updatedAt && (
            <div className={`${styles.listItem} flex w-full items-center justify-between`}>
              <p>Last update</p>
              <p className={styles.valueItem}>
                <TimeAgo date={mostRecentItem?.updatedAt} />
              </p>
            </div>
          )}

          <ActionCard
            className={styles.actionCard}
            title="Contribute"
            text="Develop your own plugin and submit it to the marketplace!"
            type="success"
            link="https://example.com"
          />
        </div>
      </aside>
    </div>
  );
};

export default UserTemplate;
