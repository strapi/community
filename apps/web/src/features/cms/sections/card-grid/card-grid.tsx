import { Button, Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import Image from "next/image";
import { cmsImageUrl, renderIcon } from "@/features/cms/lib/image-url";

type Props = {
  section: Data.Component<"sections.card-grid">;
};

const CardGridSection = ({ section }: Props) => {
  return (
    <Container>
      <section className="border-(--color-neutral300) border-l border-r border-b px-4 sm:px-6 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <article
              key={item.id}
              className="relative flex flex-col gap-6 overflow-hidden rounded-md border border-(--color-neutral150) bg-(--color-primary100) p-6 lg:block lg:min-h-62"
            >
              <div className="flex items-center">
                {item.icon && (
                  <span className="mr-2">
                    {renderIcon(item.icon, {
                      size: 24,
                      className: "text-(--color-primary700)",
                    })}
                  </span>
                )}
                <h3 className="flex items-center gap-2 text-[21px] font-semibold leading-9 text-(--color-card-grid-title)">
                  {item.title}
                </h3>
              </div>
              <div className="relative z-10 lg:max-w-[60%]">
                <p className="mt-3 text-sm leading-6 text-[15px] text-(--color-neutral700)">
                  {item.content}
                </p>
                <Button
                  href={item.button?.link || "#"}
                  variant="secondary"
                  className="mt-6 border-(--color-neutral150) bg-white text-(--color-primary700) shadow-[0_1px_1px_rgba(0,0,0,0.06)] hover:bg-(--color-primary100)"
                >
                  {item.button?.label || "Submit"}
                </Button>
              </div>
              {item.image?.url && (
                <Image
                  src={cmsImageUrl(item.image.url)}
                  alt={item.image.alternativeText || item.title || "Card image"}
                  width={290}
                  height={180}
                  className="pointer-events-none absolute -right-20 -bottom-6 z-0 hidden h-auto w-[48%] object-contain rotate-[-11deg] lg:block"
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
};

export { CardGridSection };
