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
      <section className="border-(--color-neutral300) border-l border-r border-b px-6 py-10 pt-18">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <article
              key={item.id}
              className="relative min-h-62 overflow-hidden rounded-md border border-(--color-neutral150) bg-(--color-primary100) p-6"
            >
              <div className="relative z-10 max-w-[56%]">
                <div className="flex items-center">
                  {item.icon && (
                    <span className="mr-2">
                      {renderIcon(item.icon, {
                        size: 24,
                        className: "text-(--color-primary700)",
                      })}
                    </span>
                  )}
                  <h3 className="flex items-center gap-2 text-[29px] font-semibold leading-9 text-(--color-card-grid-title)">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-(--color-neutral700)">
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
                  className={`pointer-events-none absolute -right-4 -bottom-6 z-0 h-auto w-[48%] object-contain rotate-[-11deg]`}
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
