"use client";

import { Box } from "@strapi/design-system";
import Container from "@/components/Container";
import Header from "@/components/Header";
import type { HomePageData } from "@/features/cms/pages/Home/page";
import SearchPage from "@/features/search/indexes/SearchPage";

type Props = {
  document: HomePageData;
};

export default function Homepage({ document }: Props) {
  return (
    <Box>
      <Header
        title={document.title as string}
        description={document.description as string}
      />
      <Container>
        <SearchPage />
      </Container>
    </Box>
  );
}
