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
    <tr
      key={`pluginList_${props.link}`}
      className={styles.pluginListRow}
      onClick={() => router.push(`${props.link}`)}
    >
      <td className={styles.pluginListElementFirstItem}>
        <Image
          className={styles.pluginListRowIcon}
          src={process.env.NEXT_PUBLIC_CMS_URL + props.icon.url}
          width={30}
          height={30}
          alt={props.icon.alternativeText || "icon"}
        />
      </td>
      <td className={styles.pluginListRowMain}>
        <h4 className={styles.pluginListRowTitle}>{props.name}</h4> —{" "}
        {props.description}
      </td>
      <td className={styles.pluginListElementStats}>
        <div className={`${styles.highlightCardInfo} flex justify-end gap-2`}>
          <span>
            <span className="flex items-center justify-end gap-1">
              <Image
                src="/logo-github.svg"
                width={12}
                height={12}
                alt="Logo GitHub"
              />
              {/* <Star width={12} height={12} color={"var(--color-warning500)"} /> */}
              {formatStars(props.stars)}
            </span>
          </span>
          <span>
            <span className="flex items-center justify-end gap-1">
              {/* <Download width={12} height={12} color={"var(--color-neutral600)"} /> */}
              {formatDownloads(props.downloads)}
            </span>
          </span>
        </div>
      </td>
      <td className={styles.pluginListElementLastItem}>
        <button
          type="button"
          className="rounded border border-(--color-primary200) px-3 py-1 text-xs font-semibold text-(--color-primary700) hover:bg-(--color-primary100)"
          onClick={() => router.push(`${props.link}`)}
        >
          More
        </button>
      </td>
    </tr>
  );
}
