import type { Data } from "@strapi/types";
import Image from "next/image";
import Link from "next/link";

type Props = {
  section: Data.Component<"sections.cta">;
};

const CTASection = ({ section }: Props) => {
  const { cta } = section;

  return (
    <section>
      <div
        className="relative overflow-hidden rounded-lg border border-(--color-cta-border) bg-linear-to-r from-(--color-cta-from) to-(--color-cta-to) px-8 py-8 text-white"
        style={{
          backgroundImage:
            "var(--bg-dotted-pattern-image), linear-gradient(90deg, var(--color-cta-from), var(--color-cta-to))",
          backgroundSize: "var(--bg-dotted-pattern-size), auto",
        }}
      >
        <div className="relative z-10 max-w-lg">
          <h3 className="text-4xl font-semibold leading-tight">{cta?.title}</h3>
          <p className="mt-3 text-sm leading-6 text-(--color-cta-muted)">
            {cta?.content}
          </p>
          {cta?.button?.link && (
            <Link
              href={cta.button.link}
              className="mt-6 inline-flex rounded-md bg-(--color-primary600) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-cta-button-hover)"
            >
              {cta.button.label}
            </Link>
          )}
        </div>
        {cta?.image?.url && (
          <Image
            src={`${process.env.NEXT_PUBLIC_CMS_URL}${cta.image.url}`}
            alt={cta.image.alternativeText || cta.title || "CTA image"}
            width={420}
            height={220}
            className="pointer-events-none absolute -right-3 bottom-0 hidden h-auto w-[48%] object-contain md:block"
          />
        )}
      </div>
    </section>
  );
};

export default CTASection;
