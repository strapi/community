import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CONTRIBUTION_TYPES, GITHUB_REPO } from "../../lib/config";
import type {
  GithubContributions,
  GithubContributionType,
} from "../../lib/types";
import { GithubContributionsFeed } from "../github-contributions-feed";

/** A GitHub search for all of the user's `strapi/strapi` items of a type. */
function searchUrl(login: string, type: GithubContributionType) {
  const { qualifier, searchType } = CONTRIBUTION_TYPES[type];
  const query = [`author:${login}`, `repo:${GITHUB_REPO}`, qualifier]
    .filter(Boolean)
    .join(" ");

  return `https://github.com/search?${new URLSearchParams({
    q: query,
    type: searchType,
  })}`;
}

const GithubContributionsSection = ({
  contributions,
}: {
  contributions: GithubContributions;
}) => {
  const { login, totals, items } = contributions;

  return (
    <section className="border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18">
      <div className="mb-6 sm:mb-10 lg:mb-14">
        <h2 className="text-[21px] font-semibold text-(--color-neutral900)">
          GitHub Contributions
        </h2>
        <p className="mt-2 text-md text-(--color-neutral600)">
          Issues, pull requests and discussions by{" "}
          <Link
            href={`https://github.com/${login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--color-primary600) hover:underline"
          >
            @{login}
          </Link>{" "}
          in the{" "}
          <Link
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--color-primary600) hover:underline"
          >
            {GITHUB_REPO}
          </Link>{" "}
          repository.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(Object.keys(CONTRIBUTION_TYPES) as GithubContributionType[]).map(
          (type) => {
            const { label, icon: Icon, total } = CONTRIBUTION_TYPES[type];

            return (
              <Link
                key={type}
                href={searchUrl(login, type)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-md border border-(--color-neutral150) bg-white p-5 transition-colors hover:border-(--color-primary600)"
              >
                <Icon className="h-6 w-6 shrink-0 text-(--color-primary600)" />
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold text-(--color-neutral900)">
                    {total(totals).toLocaleString("en-US")}
                  </span>
                  <span className="text-sm text-(--color-neutral600)">
                    {label}
                  </span>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-(--color-neutral600) opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          },
        )}
      </div>

      <h3 className="mb-4 text-base font-semibold text-(--color-neutral900)">
        Recent activity
      </h3>
      <GithubContributionsFeed items={items} />
    </section>
  );
};

export { GithubContributionsSection };
