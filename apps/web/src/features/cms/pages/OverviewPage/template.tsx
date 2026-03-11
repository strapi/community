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
      <Container>
        {document.sections?.map((section) => (
          <SectionsMapper
            key={section.id}
            section={section}
            id={section.__component}
          />
        ))}
      </Container>
    </div>
  );
}
