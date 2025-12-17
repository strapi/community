import type { API } from "@strapi/client";
import type { Modules, UID } from "@strapi/types";
import { notFound } from "next/navigation";
import qs from "qs";
import { client } from "@/lib/strapi";

export const findUrlAliases = async (): Promise<
  Modules.Documents.Result<"plugin::webtools.url-alias">[]
> => {
  return await client
    .fetch("/webtools/url-alias")
    .then((response) => response.json())
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error);
    });
};

type QueryParams = API.BaseQueryParams & {
  path: string;
};

export const findPage = async (
  query: QueryParams,
): Promise<
  Modules.Documents.AnyDocument & { contentType: UID.ContentType }
> => {
  const params = qs.stringify(query);
  return await client
    .fetch(`/webtools/router?${params}`)
    .then((response) => response.json())
    .then((response) => response.data)
    .catch((error) => {
      if (error.response.status === 404) {
        notFound();
      }
      throw new Error(error);
    });
};
