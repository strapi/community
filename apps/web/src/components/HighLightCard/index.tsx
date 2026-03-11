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
      <div className="flex flex-col items-start gap-2">
        <div className="flex w-full items-start justify-between">
          <Image
            src="/logo-plugin.png"
            width={60}
            height={60}
            alt="Logo Plugin"
          />
          <div className={`${styles.highlightCardInfo} flex gap-2`}>
            <span>
              <span className="flex items-center gap-1">
                <Image
                  src="/logo-github.svg"
                  width={12}
                  height={12}
                  alt="Logo GitHub"
                />
                {/* <Star width={12} height={12} color={"var(--color-warning500)"} /> */}
                {formatStars(stars)}
              </span>
            </span>
            <span>
              <span className="flex items-center gap-1">
                {/* <Download width={12} height={12} color={"var(--color-neutral600)"} /> */}
                {formatDownloads(downloads)}
              </span>
            </span>
          </div>
        </div>
        <h3 className={styles.highlightCardTitle}>{name}</h3>
        <p className={styles.highlightCardText}>{description}</p>
      </div>
    </Link>
  );
}
