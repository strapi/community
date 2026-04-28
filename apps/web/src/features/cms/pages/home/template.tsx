import { HomeHero } from "@/components/layout/hero";
import type {
  HomePackages,
  HomePageData,
  HomeTemplates,
} from "@/features/cms/pages/home";
import { SectionsMapper } from "@/features/cms/sections/mapper";

type Props = {
  document: HomePageData;
  templates: HomeTemplates;
  packages: HomePackages;
};

const HomeTemplate = async ({ document, templates, packages }: Props) => {
  return (
    <div>
      <HomeHero
        title={document.title!}
        subtitle={document.subtitle!}
        ctaText={document.cta_text!}
        ctaTitle={document.cta_title!}
        ctaButtons={document.cta_buttons || []}
        packages={packages}
        templates={templates}
      />
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

export { HomeTemplate };
