import { Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
  section: Data.Component<"sections.card-grid">;
};

const CardGridSection = ({ section }: Props) => {
  return (
    <Container>
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <article
              key={item.id}
              className="relative min-h-62 overflow-hidden rounded-md border border-(--color-neutral150) bg-(--color-primary100) p-6"
            >
              <div className="relative z-10 max-w-[56%]">
                <h3 className="flex items-center gap-2 text-[29px] font-semibold leading-9 text-(--color-card-grid-title)">
                  <span className="text-base text-(--color-primary600)">⌁</span>
                  {item.title}
                </h3>
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
                  src={`${process.env.NEXT_PUBLIC_CMS_URL}${item.image.url}`}
                  alt={item.image.alternativeText || item.title || "Card image"}
                  width={290}
                  height={180}
                  className={`pointer-events-none absolute -right-4 -bottom-6 z-0 h-auto w-[48%] object-contain ${
                    index % 2 === 0 ? "rotate-[-11deg]" : "rotate-10"
                  }`}
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
