import type { API } from "@strapi/client";
import type { Modules, UID } from "@strapi/types";
import { notFound } from "next/navigation";
import qs from "qs";
import { cache } from "react";
import { cmsClient } from "@/features/cms/lib/strapi";

export const findUrlAliases = async (): Promise<
  Modules.Documents.Result<"plugin::webtools.url-alias">[]
> => {
  return await cmsClient
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
  const params = qs.stringify(query, { encode: false });
  return await cmsClient
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

/**
 * Resolves the published page at `path`. Memoized per request so
 * generateMetadata and the page itself share a single CMS round trip.
 */
export const findPublishedPage = cache((path: string) =>
  findPage({ path, status: "published", fields: ["documentId"] }),
);
