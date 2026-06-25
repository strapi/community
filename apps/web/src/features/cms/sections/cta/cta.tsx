import { Button, Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import Image from "next/image";
import { AvatarPile } from "@/components/content/avatar-pile";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

type Props = {
  section: Data.Component<"sections.cta">;
};

type CommunityPileProps = {
  users: Data.ContentType<"plugin::better-auth.user">[];
};

const CommunityPile = ({ users }: CommunityPileProps) => (
  <div className="relative w-full max-w-85 mt-10 lg:mt-0">
    <Image
      src="/star-graphic.svg"
      width={70}
      height={70}
      alt=""
      aria-hidden
      className="hidden lg:block absolute top-5 -left-35 pointer-events-none z-10"
    />
    <Image
      src="/star-graphic.svg"
      width={116}
      height={116}
      alt=""
      aria-hidden
      className="absolute hidden lg:block -top-24 -left-20 pointer-events-none z-10"
    />
    <Image
      src="/star-graphic.svg"
      width={70}
      height={70}
      alt=""
      aria-hidden
      className="w-13 lg:w-17.5 absolute -right-2 -top-13 lg:top-auto lg:-bottom-18 lg:right-10 pointer-events-none z-10"
    />
    <Image
      src="/star-graphic.svg"
      width={52}
      height={52}
      alt=""
      aria-hidden
      className="w-9 lg:w-13 absolute -top-6 right-12 lg:top-auto lg:-bottom-5 lg:-right-12 pointer-events-none z-10"
    />
    <div className="relative">
      <AvatarPile items={users} size="L" />
    </div>
  </div>
);

const sharedWrapperStyle: React.CSSProperties = {
  backgroundImage:
    "var(--bg-dotted-pattern-image), linear-gradient(90deg, var(--color-cta-from), var(--color-cta-to))",
  backgroundSize: "var(--bg-dotted-pattern-size), auto",
};

const CTASection = async ({ section }: Props) => {
  const cta = section.cta!;

  if (cta?.size === "S") {
    return (
      <div className="py-16 border-y border-(--color-neutral300)">
        <Container>
          <section>
            <div
              className="relative overflow-hidden rounded-lg border border-(--color-cta-border) text-white!"
              style={sharedWrapperStyle}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
                <div className="md:w-[90%] min-w-75 px-8 py-10">
                  <h3 className="font-bold leading-tight text-white!">
                    {cta.title}
                  </h3>
                  <p className="mt-4 text-[16px] leading-5 text-(--color-cta-muted)">
                    {cta.content}
                  </p>
                  {cta.button?.link && (
                    <Button
                      href={cta.button.link}
                      variant="primary"
                      className="mt-5 bg-(--color-primary600) text-white hover:bg-(--color-cta-button-hover)"
                    >
                      {cta.button.label}
                    </Button>
                  )}
                </div>

                <div className="w-full flex justify-start md:justify-end items-center md:items-stretch">
                  <Image
                    src={cmsImageUrl(cta.image.url)}
                    alt={cta.image.alternativeText || cta.title || "CTA image"}
                    width={600}
                    height={300}
                    className="md:hidden pointer-events-none w-full h-auto object-contain"
                  />
                  <div className="hidden md:block relative w-full">
                    <Image
                      src={cmsImageUrl(cta.image.url)}
                      alt={
                        cta.image.alternativeText || cta.title || "CTA image"
                      }
                      fill
                      className="pointer-events-none object-contain object-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16 border-y border-(--color-neutral300)">
      <Container>
        <section>
          <div
            className="relative overflow-hidden rounded-lg border border-(--color-cta-border) text-white flex flex-col md:flex-row md:items-stretch"
            style={sharedWrapperStyle}
          >
            <div className="relative z-10 w-full md:w-[55%] px-6 py-8 sm:px-12 sm:py-16 lg:px-20 lg:py-29">
              <h3 className="text-[43px] font-bold leading-tight text-white!">
                {cta?.title}
              </h3>
              <p className="mt-3 text-[16px] leading-6 text-(--color-cta-muted)">
                {cta?.content}
              </p>
              {cta?.button?.link && (
                <Button
                  href={cta.button.link}
                  variant="primary"
                  className="mt-6 bg-(--color-primary600) text-white hover:bg-(--color-cta-button-hover)"
                >
                  {cta.button.label}
                </Button>
              )}
            </div>
            <div className="w-full md:w-[45%] flex items-center md:items-stretch">
              <Image
                src={cmsImageUrl(cta.image.url)}
                alt={cta.image.alternativeText || cta?.title || "CTA image"}
                width={600}
                height={300}
                className="md:hidden pointer-events-none w-full h-auto object-contain mt-6"
              />
              <div className="hidden md:block relative w-full">
                <Image
                  src={cmsImageUrl(cta.image.url)}
                  alt={cta.image.alternativeText || cta?.title || "CTA image"}
                  fill
                  className="pointer-events-none object-contain object-right"
                />
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export { CTASection };
