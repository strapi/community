"use client";

import { Flex, Grid } from "@strapi/design-system";
import type { HomePageData } from "@/templates/Home/page";

type Props = {
  document: HomePageData;
};

export default function Homepage({ document }: Props) {
  return (
    <Grid.Item
      col={9}
      direction={"column"}
      alignItems={"flex-start"}
      justifyContent={"flex-start"}
    >
      <Flex
        width={"100%"}
        gap={"36px"}
        direction={"column"}
        alignItems={"flex-start"}
      >
        <h1>{document.title}</h1>
        <p>{document.description}</p>
        {/* <PluginList params={params} /> */}
      </Flex>
    </Grid.Item>
  );
}
