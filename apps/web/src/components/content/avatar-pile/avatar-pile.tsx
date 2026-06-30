import type { Data } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { Owner } from "@/utils/types";

type Props = {
  items: Owner[];
  size?: "S" | "L";
  clickable?: boolean;
  white?: boolean;
};

// Percentage widths per slot (outer → center → outer), relative to the container.
// 5 slots: 18 + 24 + 32 + 24 + 18 = 116%; 4 overlaps × 6% = 24% → net ≈ 92%.
const SLOT_WIDTHS = ["18%", "24%", "32%", "24%", "18%"];

const AvatarLarge = ({ items }: { items: Owner[] }) => {
  const slots = items.filter(Boolean).slice(0, 5);
  const centerIdx = Math.floor((slots.length - 1) / 2);

  return (
    <div className="flex items-center w-full">
      {slots.map((m, i) => {
        const distFromCenter = i - centerIdx;
        const configIdx = 2 + distFromCenter;
        const width = SLOT_WIDTHS[configIdx] ?? "18%";
        const zIndex = 10 - Math.abs(distFromCenter);
        const imageUrl = "image" in m ? m.image : undefined;
        const logoUrl = "logo" in m ? m.logo : undefined;
        const avatarUrl = (imageUrl || logoUrl) as string;

        return (
          <div
            key={m.documentId}
            className="relative aspect-square rounded-full border-3 border-(--color-primary400) overflow-hidden shrink-0"
            style={{
              width,
              zIndex,
              marginLeft: i === 0 ? 0 : "-6%",
            }}
          >
            {avatarUrl ? (
              <Image
                src={cmsImageUrl(avatarUrl)}
                fill
                sizes="(max-width: 360px) 32vw, 115px"
                alt={m.name ?? ""}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-(--color-primary200) text-sm font-medium">
                {m.name?.[0]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AvatarPile = ({ items, clickable, size = "S", white = false }: Props) => {
  if (!items?.length) return null;

  if (size === "L") {
    return <AvatarLarge items={items} />;
  }

  const Wrapper = clickable ? Link : "div";

  return (
    <div className="flex items-center">
      {items
        .filter(Boolean)
        .slice(0, 5)
        .map((m, i) => {
          const imageUrl = "image" in m ? m.image : undefined;
          const logoUrl = "logo" in m ? m.logo : undefined;
          const avatarUrl = (imageUrl || logoUrl) as string;

          return avatarUrl ? (
            <Wrapper
              className="flex items-center"
              href={m.url_alias?.[0]?.url_path!}
              key={m.documentId}
            >
              <Image
                src={cmsImageUrl(avatarUrl)}
                width={28}
                height={28}
                alt={m.name ?? ""}
                className="rounded-full border-2 border-(--color-primary400) object-cover"
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              />
              {items.filter(Boolean).length === 1 && (
                <span className={`pl-2 ${white ? "text-white" : ""}`}>
                  {items.find(Boolean)?.name}
                </span>
              )}
            </Wrapper>
          ) : (
            <Wrapper
              className="flex items-center"
              href={m.url_alias?.[0]?.url_path!}
              key={m.documentId}
            >
              <div
                className="h-7 w-7 text-xs flex items-center justify-center rounded-full border-2 border-(--color-primary400) bg-(--color-primary200)"
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              >
                {m.name?.[0]}
              </div>
              {items.filter(Boolean).length === 1 && (
                <span className={`pl-2 ${white ? "text-white" : ""}`}>
                  {items.find(Boolean)?.name}
                </span>
              )}
            </Wrapper>
          );
        })}
    </div>
  );
};

export { AvatarPile };
