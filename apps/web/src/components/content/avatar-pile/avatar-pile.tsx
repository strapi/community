import type { Data } from "@strapi/types";
import Image from "next/image";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  items: Data.ContentType<"plugin::better-auth.user">[];
  size?: "S" | "L";
};

// Percentage widths per slot (outer → center → outer), relative to the container.
// 5 slots: 18 + 24 + 32 + 24 + 18 = 116%; 4 overlaps × 6% = 24% → net ≈ 92%.
const SLOT_WIDTHS = ["18%", "24%", "32%", "24%", "18%"];

const AvatarLarge = ({
  items,
}: {
  items: Data.ContentType<"plugin::better-auth.user">[];
}) => {
  const slots = items.slice(0, 5);
  const centerIdx = Math.floor((slots.length - 1) / 2);

  return (
    <div className="flex items-center w-full">
      {slots.map((m, i) => {
        const distFromCenter = i - centerIdx;
        const configIdx = 2 + distFromCenter;
        const width = SLOT_WIDTHS[configIdx] ?? "18%";
        const zIndex = 10 - Math.abs(distFromCenter);
        const avatarUrl = m.profile?.avatar?.url;

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
                alt={m.profile?.avatar?.alternativeText ?? ""}
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

const AvatarPile = ({ items, size = "S" }: Props) => {
  if (!items?.length) return null;

  if (size === "L") {
    return <AvatarLarge items={items} />;
  }

  return (
    <div className="flex items-center">
      {items.slice(0, 5).map((m, i) => {
        const avatarUrl = m.profile?.avatar?.url;
        return avatarUrl ? (
          <Image
            key={m.documentId}
            src={cmsImageUrl(avatarUrl)}
            width={28}
            height={28}
            alt={m.profile?.avatar?.alternativeText ?? ""}
            className="rounded-full border-2 border-(--color-primary400) object-cover"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          />
        ) : (
          <div
            key={m.documentId}
            className="h-7 w-7 text-xs flex items-center justify-center rounded-full border-2 border-(--color-primary400) bg-(--color-primary200)"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          >
            {m.name?.[0]}
          </div>
        );
      })}
      {items.length === 1 && <span className="pl-2">{items?.[0]?.name}</span>}
    </div>
  );
};

export { AvatarPile };
