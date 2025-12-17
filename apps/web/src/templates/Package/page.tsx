
import * as React from 'react';
import { client } from '@/lib/strapi';
import type { Modules } from '@strapi/types';
import type { GetQueryParams } from '@repo/strapi-client';
import PackageTemplate from '@/templates/Package/template';

const contentType = 'api::package.package';

const query = {
  populate: {
    screenshots: {
      fields: ['url', 'width', 'height', 'alternativeText']
    },
    author: {
      populate: {
        url_alias: true,
      }
    },
  }
} satisfies GetQueryParams<typeof contentType>;

export type PackagePageData = Modules.Documents.Result<typeof contentType, typeof query>;

type Props = {
  documentId: string;
}

const PackagePage = async ({ documentId }: Props) => {
  const document = await client.collection(contentType).findOne(documentId, query);

  return <PackageTemplate document={document.data} />
}

export default PackagePage;
