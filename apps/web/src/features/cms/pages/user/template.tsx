import Image from "next/image";
import TimeAgo from "react-timeago";

import styles from "./page.module.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { UserPageData } from "@/features/cms/pages/user";

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
        <div>content</div>
      </section>
      <aside className="lg:col-span-3">
        <h3 className={`${styles.detailsTitle} ${styles.rightSection}`}>
          Details
        </h3>
        <div className="flex w-full flex-col">
          <div
            className={`${styles.listItem} flex w-full items-center justify-between`}
          >
            <p>Cumulated downloads</p>
            <span className="flex items-center gap-1">
              {/* <Download width={12} height={12} color={"var(--color-neutral600)"} /> */}
              <p className={styles.valueItem}>
                {aggregatedDownloads.toLocaleString()}
              </p>
            </span>
          </div>
          <div
            className={`${styles.listItem} flex w-full items-center justify-between`}
          >
            <p>Published packages</p>
            <p className={styles.valueItem}>{packages.length}</p>
          </div>
          {mostRecentItem?.updatedAt && (
            <div
              className={`${styles.listItem} flex w-full items-center justify-between`}
            >
              <p>Last update</p>
              <p className={styles.valueItem}>
                <TimeAgo date={mostRecentItem?.updatedAt} />
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export { UserTemplate };
