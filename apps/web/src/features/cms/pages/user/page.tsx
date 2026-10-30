import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsClient } from "@/features/cms/lib/strapi";
import { UserTemplate } from "@/features/cms/pages/user";
import { fetchGithubContributions } from "@/features/github-contributions/lib/fetch-github-contributions";
import type { RelatedContentItems } from "@/utils/types";

const contentType = "plugin::better-auth.user" satisfies UID.ContentType;

const query = {
  populate: ["profile"],
} satisfies GetQueryParams<typeof contentType>;

export type UserPageData = Modules.Documents.Result<
  typeof contentType,
  typeof query
>;

type Props = {
  documentId: string;
};

const UserPage = async ({ documentId }: Props) => {
  const [document, communityCta] = await Promise.all([
    cmsClient.collection(contentType).findOne(documentId, query),
    fetchCommunityCTA(),
  ]);

  const [content, githubContributions] = await Promise.all([
    cmsClient
      .fetch(
        `/users/${document.data.id}/related-content?populate=*&status=published`,
      )
      .then((res) => res.json() as Promise<RelatedContentItems>),
    // Checked here too (the CMS also checks), so turning the tab off takes
    // effect right away instead of once the cached response expires.
    document.data.profile?.show_github_contributions === false
      ? null
      : fetchGithubContributions(document.data.id),
  ]);

  return (
    <UserTemplate
      document={document.data}
      relatedContent={content}
      githubContributions={githubContributions}
      communityCta={communityCta}
    />
  );
};

export { UserPage };
