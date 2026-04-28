import Image from "next/image";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import type { OverviewPageData } from "@/features/cms/pages/overview-page";
import { SectionsMapper } from "@/features/cms/sections/mapper";

type Props = {
  document: OverviewPageData;
};

const OverviewPageTemplate = ({ document }: Props) => {
  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="flex">
            <div className="px-14 py-26 max-w-150">
              <h1 className="text-[48px] mt-2 sm:mt-0 font-semibold text-white!">
                {document.title}
              </h1>
              <p className="text-[17px] text-(--color-hero-muted)">
                {document.description}
              </p>
            </div>
            {document.image && (
              <Image
                src={`${process.env.NEXT_PUBLIC_CMS_URL}${document.image.url}`}
                alt={document.title!}
                width={480}
                height={480}
                className="mt-10 rounded-lg object-cover ml-auto"
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
