"use client";

import Container from "@/components/Container";
import Header from "@/components/Header";
import type { OverviewPageData } from "@/features/cms/pages/OverviewPage/page";
import SectionsMapper from "@/features/cms/sections/mapper";

type Props = {
  document: OverviewPageData;
};

export default function OverviewPage({ document }: Props) {
  return (
    <div>
      <Header
        title={document.title as string}
        description={document.description as string}
      />

      {document.sections?.map((section) => {
        if (section.__component === "sections.card-grid") {
          return (
            <section
              key={section.id}
              className="border-y border-(--color-neutral150) bg-(--color-neutral100) py-10 md:py-12"
            >
              <Container>
                <SectionsMapper section={section} id={section.__component} />
              </Container>
            </section>
          );
        }

        if (section.__component === "sections.cta") {
          return (
            <section key={section.id} className="py-10 md:py-12">
              <Container>
                <SectionsMapper section={section} id={section.__component} />
              </Container>
            </section>
          );
        }

        return (
          <Container key={section.id}>
            <SectionsMapper section={section} id={section.__component} />
          </Container>
        );
      })}
    </div>
  );
}
