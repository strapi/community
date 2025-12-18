import { type API, type Config, strapi } from "@strapi/client";
import type { Modules, UID } from "@strapi/types";
import pluralize from "pluralize";

export interface Document {
  documentId: string;
  // biome-ignore lint/suspicious/noExplicitAny: <any> is needed here
  [key: string]: any;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ResponseMeta {
  pagination?: Pagination;
}

export interface DocumentResponse<T extends Document = Document> {
  data: T;
  meta: ResponseMeta;
}

export interface DocumentResponseCollection<T extends Document = Document> {
  data: T[];
  meta: ResponseMeta;
}

// Strapi client does not export thoses types for now:  { ClientCollectionOptions, SingleCollectionOptions }
type CollectionOptions = {
  path: string;
};

type SingleCollectionOptions = CollectionOptions;
type ClientCollectionOptions = CollectionOptions;

export type GetQueryParams<
  TContentTypeUID extends UID.ContentType = UID.ContentType,
> = Modules.Documents.Params.Pick<TContentTypeUID, keyof API.BaseQueryParams>;

export type GetAttributes<TContentTypeUID extends UID.ContentType> =
  Modules.Documents.GetValues<TContentTypeUID> & API.Document;

export const createTypedStrapiClient = (config: Config) => {
  const client = strapi(config);

  return {
    fetch: client.fetch.bind(client),
    baseURL: client.baseURL,
    files: client.files,

    single: <TContentTypeUID extends UID.ContentType>(
      resource: TContentTypeUID,
      options?: SingleCollectionOptions,
    ) => {
      const [, resourceInfo] = resource.split("::") as [string, string];
      const [, contentTypeName] = resourceInfo.split(".") as [string, string];
      const clientCollection = client.single(contentTypeName, options);

      return {
        find: <const TParams extends GetQueryParams<TContentTypeUID>>(
          queryParams?: TParams,
        ) => {
          return clientCollection.find(
            queryParams as API.BaseQueryParams,
          ) as Promise<
            DocumentResponse<Modules.Documents.Result<TContentTypeUID, TParams>>
          >;
        },
        update: <const TParams extends GetQueryParams<TContentTypeUID>>(
          document: Partial<GetAttributes<TContentTypeUID>>,
          queryParams?: TParams,
        ) => {
          return clientCollection.update(
            document,
            queryParams as API.BaseQueryParams,
          ) as Promise<
            DocumentResponse<Modules.Documents.Result<TContentTypeUID, TParams>>
          >;
        },
        delete: <const TParams extends GetQueryParams<TContentTypeUID>>(
          queryParams?: TParams,
        ): Promise<void> => {
          return clientCollection.delete(queryParams as API.BaseQueryParams);
        },
      };
    },

    collection: <TContentTypeUID extends UID.ContentType>(
      resource: TContentTypeUID,
      options?: ClientCollectionOptions,
    ) => {
      const [, resourceInfo] = resource.split("::") as [string, string];
      const [, contentTypeName] = resourceInfo.split(".") as [string, string];
      const clientCollection = client.collection(
        pluralize(contentTypeName),
        options,
      );

      return {
        find: <const TParams extends GetQueryParams<TContentTypeUID>>(
          queryParams?: TParams,
        ) => {
          return clientCollection.find(
            queryParams as API.BaseQueryParams,
          ) as TContentTypeUID extends "plugin::users-permissions.user"
            ? Promise<Modules.Documents.Result<TContentTypeUID, TParams>[]>
            : Promise<
                DocumentResponseCollection<
                  Modules.Documents.Result<TContentTypeUID, TParams>
                >
              >;
        },
        findOne: <const TParams extends GetQueryParams<TContentTypeUID>>(
          documentID: string,
          queryParams?: TParams,
        ) => {
          return clientCollection.findOne(
            documentID,
            queryParams as API.BaseQueryParams,
          ) as TContentTypeUID extends "plugin::users-permissions.user"
            ? Promise<Modules.Documents.Result<TContentTypeUID, TParams>>
            : Promise<
                DocumentResponse<
                  Modules.Documents.Result<TContentTypeUID, TParams>
                >
              >;
        },
        create: <const TParams extends GetQueryParams<TContentTypeUID>>(
          document: Partial<GetAttributes<TContentTypeUID>>,
          queryParams?: TParams,
        ) => {
          return clientCollection.create(
            document,
            queryParams as API.BaseQueryParams,
          ) as TContentTypeUID extends "plugin::users-permissions.user"
            ? Promise<Modules.Documents.Result<TContentTypeUID, TParams>>
            : Promise<
                DocumentResponse<
                  Modules.Documents.Result<TContentTypeUID, TParams>
                >
              >;
        },
        update: <const TParams extends GetQueryParams<TContentTypeUID>>(
          documentID: string,
          document: Partial<GetAttributes<TContentTypeUID>>,
          queryParams?: TParams,
        ) => {
          return clientCollection.update(
            documentID,
            document,
            queryParams as API.BaseQueryParams,
          ) as TContentTypeUID extends "plugin::users-permissions.user"
            ? Promise<Modules.Documents.Result<TContentTypeUID, TParams>>
            : Promise<
                DocumentResponse<
                  Modules.Documents.Result<TContentTypeUID, TParams>
                >
              >;
        },
        delete: <const TParams extends GetQueryParams<TContentTypeUID>>(
          documentID: string,
          queryParams?: TParams,
        ): Promise<void> => {
          return clientCollection.delete(
            documentID,
            queryParams as API.BaseQueryParams,
          );
        },
      };
    },
  };
};
