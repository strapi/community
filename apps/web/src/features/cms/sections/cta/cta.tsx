import { Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import Image from "next/image";
import { AvatarPile } from "@/components/content/avatar-pile";
import { Button } from "@/components/ui/button";
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
  const { cta } = section;

  const isCommunity = cta?.illustration === "community_members";

  const users = isCommunity
    ? await cmsClient.collection("plugin::better-auth.user").find({
        limit: 5,
        populate: {
          profile: {
            populate: {
              avatar: true,
            },
          },
        },
      })
    : null;

  if (cta?.size === "S") {
    return (
      <div className="py-16 border-y border-(--color-neutral300)">
        <Container>
          <section>
            <div
              className="relative rounded-lg border border-(--color-cta-border) px-8 py-10 text-white!"
              style={sharedWrapperStyle}
            >
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="lg:w-[40%]">
                  <h3 className="text-[43px] font-bold leading-tight text-white">
                    {cta.title}
                  </h3>
                  <p className="mt-2 text-[16px] leading-5 text-(--color-cta-muted)">
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

                <div className="w-full lg:w-[55%] flex justify-start lg:justify-end align-center">
                  {isCommunity && users?.data && users.data.length > 0 ? (
                    <CommunityPile users={users.data} />
                  ) : (
                    cta.image?.url && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_CMS_URL}${cta.image.url}`}
                        alt={
                          cta.image.alternativeText || cta.title || "CTA image"
                        }
                        width={260}
                        height={160}
                        className="pointer-events-none h-auto object-contain"
                      />
                    )
                  )}
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
            className="relative overflow-hidden rounded-lg border border-(--color-cta-border) px-6 py-8 sm:px-12 sm:py-16 lg:px-20 lg:py-29 text-white flex flex-col items-center md:flex-row md:items-center"
            style={sharedWrapperStyle}
          >
            <div className="relative z-10 w-full md:w-[55%]">
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

            {isCommunity && users?.data && users.data.length > 0 ? (
              <div className="mt-6 md:mt-0 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 md:w-[360px]">
                <CommunityPile users={users.data} />
              </div>
            ) : (
              cta?.image?.url && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_CMS_URL}${cta.image.url}`}
                  alt={cta.image.alternativeText || cta?.title || "CTA image"}
                  width={420}
                  height={220}
                  className="pointer-events-none h-auto w-[70%] md:w-[40%] object-contain mt-6 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2"
                />
              )
            )}
          </div>
        </section>
      </Container>
    </div>
  );
};

export { CTASection };
