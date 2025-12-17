
import * as React from 'react';
import { client } from '@/lib/strapi';
import type { Modules } from '@strapi/types';
import type { GetQueryParams } from '@repo/strapi-client';
import UserTemplate from '@/templates/User/template';

const contentType = 'plugin::users-permissions.user';

const query = {
  populate: {
    packages: {
      populate: {
        url_alias: true,
        icon: true,
      }
    }
  }
} satisfies GetQueryParams<typeof contentType>;

export type UserPageData = Modules.Documents.Result<typeof contentType, typeof query>;

type Props = {
  id: number;
}

const UserPage = async ({ id }: Props) => {
  const document = await client.collection(contentType).findOne(String(id), query);

  return <UserTemplate document={document} />
}

export default UserPage;
