"use client";

import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import type { HomePageData } from "@/features/cms/pages/home";

type Props = {
  document: HomePageData;
};

const HomeTemplate = ({ document }: Props) => {
  return (
    <div>
      <Header
        title={document.title as string}
        description={document.description as string}
      />
      <Container>test</Container>
    </div>
  );
};

export { HomeTemplate };
