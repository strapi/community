import type { Modules } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";
import {
  FeaturedBadge,
  OfficialBadge,
  PaidBadge,
} from "@/components/content/badge";
import { MaintainersList } from "@/components/content/maintainers-list";

type Props = {
  hit: Modules.Documents.Result<"api::package.package", { populate: "*" }>;
};

const PackageCard = ({ hit }: Props) => {
  return (
    <Link
      className="block h-full w-full text-black no-underline"
      href={hit.url_alias?.[0]?.url_path as string}
    >
      <div className="h-full rounded-md border border-transparent bg-white p-4 shadow-[0_1px_4px_var(--color-neutral150)] transition-colors hover:border-(--color-primary200) hover:bg-(--color-primary100)">
        <div className="flex flex-col">
          <div className="flex w-full items-start">
            <Image
              src={
                hit.icon
                  ? `${process.env.NEXT_PUBLIC_CMS_URL}${hit.icon.url}`
                  : "/logo-plugin.png"
              }
              width={100}
              height={100}
              alt={hit.name || ""}
            />
            <div className="ml-auto flex flex-col items-end gap-2">
              {hit.labels?.featured && <FeaturedBadge />}
              {hit.labels?.paid && <PaidBadge />}
              {hit.labels?.official && <OfficialBadge />}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex flex-col items-start">
              <p className="max-w-full truncate text-base font-bold text-(--color-neutral900)">
                {hit.name}
              </p>
              <p className="text-sm text-(--color-neutral600)">
                {hit.description}
              </p>
              {hit.maintainers && (
                <div className="mt-4 w-full">
                  <MaintainersList maintainers={hit.maintainers} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { PackageCard };
