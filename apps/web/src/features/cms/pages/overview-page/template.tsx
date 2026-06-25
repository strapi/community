import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { OverviewPageData } from "@/features/cms/pages/overview-page";
import { SectionsMapper } from "@/features/cms/sections/mapper";

type Props = {
  document: OverviewPageData;
};

const OverviewPageTemplate = ({ document }: Props) => {
  console.log(document.sections);
  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="flex flex-col md:flex-row">
            <div className="px-14 py-14 md:py-26 max-w-150">
              <div className="mb-5">
                <Breadcrumbs />
              </div>
              <h1 className="text-[48px] mt-2 md:mt-0 font-semibold text-white!">
                {document.title}
              </h1>
              <p className="text-[17px] text-(--color-hero-muted)">
                {document.description}
              </p>
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
