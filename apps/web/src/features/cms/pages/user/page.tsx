import type { GetQueryParams } from "@repo/strapi-client";
import type { Modules, UID } from "@strapi/types";
import { fetchCommunityCTA } from "@/features/cms/lib/community-cta";
import { cmsClient } from "@/features/cms/lib/strapi";
import { UserTemplate } from "@/features/cms/pages/user";
import type { GithubContributions } from "@/features/cms/pages/user/github-contributions";
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

/** How long a profile's GitHub contributions are cached. */
const GITHUB_CONTRIBUTIONS_REVALIDATE = 30 * 60;

/**
 * Fetches a user's GitHub contributions through Next's data cache, so
 * GitHub is only hit once per user per `GITHUB_CONTRIBUTIONS_REVALIDATE`
 * — the catch-all route is `force-dynamic`, which only leaves fetches
 * uncached when they set no cache options of their own. A plain `fetch`
 * rather than `cmsClient.fetch`, which rebuilds the request internally and
 * drops the `next` option. Only 200 responses are cached; the CMS answers
 * a GitHub failure with a 502, so that's retried on the next render.
 */
async function fetchGithubContributions(
  userId: number | string,
): Promise<GithubContributions | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CMS_URL}/api/users/${userId}/github-contributions`,
      {
        headers: { Authorization: `Bearer ${process.env.CMS_BEARER_TOKEN}` },
        next: { revalidate: GITHUB_CONTRIBUTIONS_REVALIDATE },
      },
    );
    if (!res.ok) return null;

    const body = (await res.json()) as { data: GithubContributions | null };
    return body.data;
  } catch {
    // Optional extra — a GitHub/CMS hiccup shouldn't take the page down.
    return null;
  }
}

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
