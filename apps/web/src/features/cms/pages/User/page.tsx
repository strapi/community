import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules } from "@strapi/types";
import { client } from "@/features/cms/lib/strapi";
import UserTemplate from "@/features/cms/pages/User/template";

const contentType = "plugin::better-auth.user";

const query = {
  populate: {
    profile: true,
    packages: {
      populate: {
        url_alias: true,
        icon: true,
      },
    },
  },
} satisfies GetQueryParams<typeof contentType>;

export type UserPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  id: number;
};

const UserPage = async ({ id }: Props) => {
  const document = await client
    .collection(contentType)
    .findOne(String(id), query);

  return <UserTemplate document={document.data} />;
};

export default UserPage;
