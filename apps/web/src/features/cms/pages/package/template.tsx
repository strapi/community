import Image from "next/image";
import Link from "next/link";
import TimeAgo from "react-timeago";
import { Markdown } from "@/components/content/markdown";
import { Container } from "@/components/layout/container";
import type { PackagePageData } from "@/features/cms/pages/package";
import styles from "./page.module.css";

type Props = {
  document: PackagePageData;
};

const PackageTemplate = ({ document }: Props) => {
  const { owner } = document;

  return (
    <Container maxWidth="1120px">
      <div className="w-full">
        <nav className="flex items-center gap-2 py-6 text-base">
          <Link className="text-(--color-primary700)" href="/">
            Marketplace
          </Link>
          <span className="text-(--color-divider-muted)">/</span>
          <Link className="text-(--color-primary700)" href="/plugins">
            Tools & Plugins
          </Link>
          <span className="text-(--color-divider-muted)">/</span>
          <span className="text-(--color-neutral800)">{document.name}</span>
        </nav>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className={`${styles.leftSection} flex w-full flex-col gap-8`}>
            <div className="flex w-full items-start justify-start gap-6">
              <Image
                src={
                  document.icon
                    ? `${process.env.NEXT_PUBLIC_CMS_URL}${document.icon.url}`
                    : "/logo-plugin.png"
                }
                width={100}
                height={100}
                alt={document.name || ""}
              />
              <div className="flex w-full flex-col items-start">
                <h1 className={styles.pluginTitle}>{document.name} </h1>
                <p className={styles.plugingShortDescription}>
                  {document.description}
                </p>
              </div>
            </div>
            <div className="markdown">
              {document.readme && <Markdown markdown={document.readme} />}
            </div>
          </div>
        </section>
        <aside className="lg:col-span-4">
          <h3 className={`${styles.detailsTitle} ${styles.rightSection}`}>
            Details
          </h3>
          <div className="flex w-full flex-col">
            <div
              className={`${styles.listItem} flex w-full items-center justify-between`}
            >
              <p>Downloads</p>
              <span className="flex items-center gap-1">
                {/* <Download width={12} height={12} color={"var(--color-neutral600)"} /> */}
                <p className={styles.valueItem}>
                  {document.npm_downloads?.toLocaleString()}
                </p>
              </span>
            </div>
            <div
              className={`${styles.listItem} flex w-full items-center justify-between`}
            >
              <p>GitHub stars</p>
              <span className="flex items-center gap-1">
                <Image
                  src="/logo-github.svg"
                  width={12}
                  height={12}
                  alt="Logo GitHub"
                />
                {/* <Star width={12} height={12} color={"var(--color-warning500)"} /> */}
                <p className={styles.valueItem}>
                  {document.github_stars?.toLocaleString()}
                </p>
              </span>
            </div>
            <div
              className={`${styles.listItem} flex w-full items-center justify-between`}
            >
              <p>Author</p>
              {owner?.username && owner.url_alias?.[0]?.url_path ? (
                <Link
                  href={owner.url_alias?.[0]?.url_path}
                  className={`${styles.valueItem} ${styles.authorName}`}
                >
                  {owner.username}
                </Link>
              ) : (
                <p className={`${styles.valueItem} ${styles.authorName}`}>
                  Unknown
                </p>
              )}
            </div>
            {document.updatedAt && (
              <div
                className={`${styles.listItem} flex w-full items-center justify-between`}
              >
                <p>Last update</p>
                <p className={styles.valueItem}>
                  <TimeAgo date={document.updatedAt} />
                </p>
              </div>
            )}
            {document.package_location && (
              <div
                className={`${styles.listItem} flex w-full items-center justify-between`}
              >
                <p>Package location</p>
                <p className={styles.valueItem}>
                  <Link
                    className={styles.linkDetail}
                    href={document.package_location}
                  >
                    See{" "}
                    {/* <ExternalLink
                      className={styles.actionCardIcon}
                      width={"12px"}
                      height={"12px"}
                    /> */}
                  </Link>
                </p>
              </div>
            )}
            {document.git_repository && (
              <div
                className={`${styles.listItem} flex w-full items-center justify-between`}
              >
                <p>Repository</p>
                <p className={styles.valueItem}>
                  <Link
                    className={styles.linkDetail}
                    href={document.git_repository}
                  >
                    See{" "}
                    {/* <ExternalLink
                      className={styles.actionCardIcon}
                      width={"12px"}
                      height={"12px"}
                    /> */}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
};

export { PackageTemplate };
