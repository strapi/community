import type { Data } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";

type Props = {
  section: Data.Component<"sections.card-grid">;
};

const CardGridSection = ({ section }: Props) => {
  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {section.items?.map((item) => (
          <article
            key={item.id}
            className="relative overflow-hidden rounded-md border border-(--color-neutral150) bg-(--color-primary100) p-6 shadow-sm"
          >
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-[32px] font-semibold leading-tight text-(--color-card-grid-title)">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-(--color-neutral600)">
                {item.content}
              </p>
              <Link
                href={item.button?.link || "#"}
                className="mt-6 inline-flex rounded-md border border-(--color-primary200) bg-white px-4 py-2 text-sm font-semibold text-(--color-primary700) transition-colors hover:bg-(--color-primary100)"
              >
                {item.button?.label || "Submit"}
              </Link>
            </div>
            {item.image?.url && (
              <Image
                src={`${process.env.NEXT_PUBLIC_CMS_URL}${item.image.url}`}
                alt={item.image.alternativeText || item.title || "Card image"}
                width={260}
                height={160}
                className="pointer-events-none absolute -bottom-2 right-0 z-0 h-auto w-[45%] rotate-[-10deg] object-contain"
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default CardGridSection;
