"use client";

import { Box } from "@strapi/design-system";
import Container from "@/components/Container";
import Header from "@/components/Header";
import type { OverviewPageData } from "@/features/cms/pages/OverviewPage/page";
import SectionsMapper from "@/features/cms/sections/mapper";

type Props = {
  document: OverviewPageData;
};

export default function OverviewPage({ document }: Props) {
  return (
    <Box>
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
    </Box>
  );
}
