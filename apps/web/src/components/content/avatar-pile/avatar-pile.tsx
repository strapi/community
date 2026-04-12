import type { Data } from "@strapi/types";
import Image from "next/image";

type Props = {
  items: Data.ContentType<"plugin::better-auth.user">[];
};

const AvatarPile = ({ items }: Props) => {
  if (!items?.length) return null;

  return (
    <div className="flex items-center">
      {items.slice(0, 3).map((m, i) => {
        const avatarUrl = m.profile?.avatar?.url;
        return avatarUrl ? (
          <Image
            key={m.documentId}
            src={`${process.env.NEXT_PUBLIC_CMS_URL}${avatarUrl}`}
            width={28}
            height={28}
            alt={m.profile?.avatar?.alternativeText ?? ""}
            className="rounded-full border-2 border-white"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          />
        ) : (
          <div
            key={m.documentId}
            className="h-7 w-7 text-xs flex items-center justify-center rounded-full border-2 border-white bg-(--color-primary200)"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          >
            <span>{m.name?.[0]}</span>
          </div>
        );
      })}
      {items.length === 1 && <span className="pl-2">{items?.[0]?.name}</span>}
    </div>
  );
};

export { AvatarPile };
