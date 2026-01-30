import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import HomeTemplate from "@/features/cms/pages/Home/template";

const contentType = "api::home.home";

const query = {} satisfies GetQueryParams<typeof contentType>;

export type HomePageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

const HomePage = async () => {
  const document = await client.single(contentType).find(query);

  return <HomeTemplate document={document.data} />;
};

export default HomePage;
