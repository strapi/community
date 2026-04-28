import type { Data } from "@strapi/types";
import { BadgeCheck, Download, Github, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarPile } from "@/components/content/avatar-pile";

type Props = {
  image: {
    src: string;
    alt?: string;
    size: "S" | "M" | "L";
  };
  link: string;
  name: string;
  badge: string;
  badgeColor?: string;
  badgeTextColor?: string;
  description: string;
  githubStars?: number;
  npmDownloads?: number;
  maintainers: Data.ContentType<"plugin::better-auth.user">[];
  labels: Data.Component<"shared.labels">;
};

const imageSizeMap = { S: 80, M: 112, L: 144 };

const ContentCard = (props: Props) => {
  const {
    link,
    image,
    name,
    badge,
    badgeColor,
    badgeTextColor,
    description,
    githubStars,
    npmDownloads,
    maintainers,
    labels,
  } = props;
  const isLarge = image?.size === "L";
  const imgSize = imageSizeMap[image?.size ?? "M"];

  return (
    <Link href={link} className="block no-underline h-full">
      <article className="h-full overflow-hidden rounded-md border border-(--color-neutral150) bg-white shadow-sm">
        {/* Preview area */}
        <div
          className={`relative aspect-video bg-gradient-to-br from-white to-violet-100 ${isLarge ? "" : "flex items-center justify-center"}`}
        >
          {image ? (
            isLarge ? (
              <Image
                src={image.src}
                fill
                alt={image.alt ?? name}
                className="object-cover pl-[8%] pr-[8%] pt-[8%] border-b border-(--color-neutral150)"
              />
            ) : (
              <Image
                src={image.src}
                width={imgSize}
                height={imgSize}
                alt={image.alt ?? name}
                className="object-contain border rounded-sm border-(--color-neutral150)"
              />
            )
          ) : null}
          <span
            className={`absolute -bottom-3 left-3 rounded-md ${badgeColor ? badgeColor : "bg-(--color-primary600)"} px-3 py-1 text-sm font-semibold ${badgeTextColor ? badgeTextColor : "text-white"}`}
          >
            {badge}
          </span>
        </div>

        <div className="p-4">
          {/* Stats */}
          <div className="mb-3 flex items-center justify-end gap-2 text-sm text-(--color-neutral600)">
            {githubStars != null && (
              <span className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {(githubStars / 1000).toFixed(1)}K
              </span>
            )}
            {githubStars != null && npmDownloads != null && (
              <span className="text-(--color-neutral300) select-none">|</span>
            )}
            {npmDownloads != null && (
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {(npmDownloads / 1000).toFixed(1)}K
              </span>
            )}
          </div>

          {/* Title */}
          <div className="mb-1 flex items-center gap-1.5">
            <p className="text-base font-bold text-(--color-neutral800)">
              {name}
            </p>
            {labels?.official && (
              <BadgeCheck className="h-5 w-5 shrink-0 text-green-500" />
            )}
          </div>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-sm leading-5 text-(--color-neutral600)">
            {description}
          </p>

          {/* Avatars */}
          <AvatarPile items={maintainers} />
        </div>
      </article>
    </Link>
  );
};

export { ContentCard };
