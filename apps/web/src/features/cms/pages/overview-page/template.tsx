import { Button } from "@repo/strapi-ui";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { OverviewPageData } from "@/features/cms/pages/overview-page";
import { SectionsMapper } from "@/features/cms/sections/mapper";
import { RoadmapStats } from "@/features/roadmap";

type Props = {
  document: OverviewPageData;
};

const OverviewPageTemplate = ({ document }: Props) => {
  const hasRoadmap = document.sections?.some(
    (section) => section.__component === "sections.roadmap",
  );

  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="flex flex-col md:flex-row">
            <div className="px-5 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-26 max-w-150">
              <div className="mb-5">
                <Breadcrumbs />
              </div>
              <h1 className="text-4xl sm:text-5xl leading-[1.1] tracking-tight mt-2 md:mt-0 font-semibold text-white!">
                {document.title}
              </h1>
              <p className="mt-4 text-[17px] text-(--color-hero-muted)">
                {document.description}
              </p>
              {document.cta_buttons && document.cta_buttons.length > 0 && (
                <div className="mt-7 flex items-center gap-3">
                  {document.cta_buttons.map((button) => (
                    <Button
                      key={button.id}
                      href={button.link!}
                      variant={button.type}
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {document.image && (
              <Image
                src={cmsImageUrl(document.image.url)}
                alt={document.title!}
                width={480}
                height={480}
                className="rounded-lg object-cover ml-auto md:ml-auto w-full max-w-120 md:max-w-120 md:min-w-0 md:shrink max-h-130"
              />
            )}
            {!document.image && hasRoadmap && <RoadmapStats />}
          </div>
        </HeroSection>
      </Hero>
      {document.sections?.map((section) => {
        return (
          <SectionsMapper
            key={section.id}
            section={section}
            id={section.__component}
          />
        );
      })}
    </div>
  );
};

export { OverviewPageTemplate };
