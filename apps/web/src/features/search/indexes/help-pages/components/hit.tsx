import type { Modules } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";
import { cmsImageUrl } from "@/features/cms/lib/image-url";

type Props = {
  hit: Modules.Documents.Result<"api::help-page.help-page", { populate: "*" }>;
};

const Hit = ({ hit }: Props) => {
  const link = hit.url_alias?.[0]?.url_path ?? "#";

  return (
    <Link href={link} className="block no-underline h-full group">
      <article className="h-full overflow-hidden rounded-md border border-(--color-neutral150) bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-video bg-gradient-to-br from-white to-violet-50 flex items-center justify-center overflow-hidden">
          {hit.image ? (
            <Image
              src={cmsImageUrl(hit.image.url)}
              fill
              alt={hit.image.alternativeText ?? hit.title ?? ""}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-(--color-strapi-purple-400)"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-base font-bold text-(--color-neutral800) group-hover:text-(--color-primary600) transition-colors">
            {hit.title}
          </p>
          {hit.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-(--color-neutral600)">
              {hit.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
};

export { Hit };
