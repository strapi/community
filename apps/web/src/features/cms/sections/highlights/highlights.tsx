import { Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { ContentCard, UserCard } from "@/components/content/card";
import { Button } from "@/components/ui/button";
import { cmsClient } from "@/features/cms/lib/strapi";

type Props = {
  section: Data.Component<"sections.highlights">;
};

const gridColsMap: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const maintainersPopulate = {
  populate: {
    profile: {
      populate: { avatar: true },
    },
  },
};

async function fetchItems(query: string, amount: number) {
  const isHighlighted = query.endsWith("_highlighted");
  const featuredFilter = isHighlighted
    ? { filters: { labels: { featured: { $eq: true } } } }
    : {};

  if (query.startsWith("packages_")) {
    const res = await cmsClient.collection("api::package.package").find({
      ...featuredFilter,
      sort: ["createdAt:desc"],
      pagination: { limit: amount },
      populate: {
        icon: true,
        url_alias: true,
        labels: true,
        maintainers: maintainersPopulate,
      },
    });
    return { type: "package" as const, items: res.data ?? [] };
  }

  if (query.startsWith("templates_")) {
    const res = await cmsClient.collection("api::template.template").find({
      ...featuredFilter,
      sort: ["createdAt:desc"],
      pagination: { limit: amount },
      populate: {
        preview_image: true,
        url_alias: true,
        labels: true,
        maintainers: maintainersPopulate,
      },
    });
    return { type: "template" as const, items: res.data ?? [] };
  }

  if (query.startsWith("community_")) {
    const res = await cmsClient.collection("plugin::better-auth.user").find({
      sort: [query === "community_newest" ? "createdAt:desc" : "name:asc"],
      pagination: { limit: amount },
      populate: {
        url_alias: true,
        profile: { populate: { avatar: true } },
      },
    });
    return { type: "user" as const, items: res.data ?? [] };
  }

  return { type: "unknown" as const, items: [] };
}

const HighlightsSection = async ({ section }: Props) => {
  const { title, query, amount, grid, button } = section;

  const { type, items } = await fetchItems(query!, amount!);

  const gridCols = gridColsMap[grid!] ?? gridColsMap[2];

  return (
    <Container>
      <div className="border-x border-t border-(--color-neutral300) px-8 sm:px-16 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--color-neutral900)">
            {title}
          </h2>
          {button?.link && (
            <Button href={button.link} variant="secondary">
              {button.label}
            </Button>
          )}
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className={`grid gap-4 ${gridCols}`}>
            {type === "package" &&
              (items as Data.ContentType<"api::package.package">[]).map(
                (pkg) => (
                  <ContentCard
                    key={pkg.documentId}
                    image={{
                      src: pkg.icon
                        ? `${process.env.NEXT_PUBLIC_CMS_URL}${pkg.icon.url}`
                        : "/package-fallback-icon.png",
                      alt: pkg.icon?.alternativeText ?? "",
                      size: "S",
                    }}
                    link={pkg.url_alias?.[0]?.url_path ?? "#"}
                    badge="Package"
                    name={pkg.name!}
                    description={pkg.description ?? ""}
                    githubStars={pkg.stars || undefined}
                    npmDownloads={pkg.monthly_downloads || undefined}
                    maintainers={pkg.maintainers!}
                    labels={pkg.labels!}
                  />
                ),
              )}

            {type === "template" &&
              (items as Data.ContentType<"api::template.template">[]).map(
                (tpl) => (
                  <ContentCard
                    key={tpl.documentId}
                    image={{
                      src: tpl.preview_image
                        ? `${process.env.NEXT_PUBLIC_CMS_URL}${tpl.preview_image.url}`
                        : "/template-fallback-preview.png",
                      alt: tpl.preview_image?.alternativeText ?? "",
                      size: "L",
                    }}
                    link={tpl.url_alias?.[0]?.url_path ?? "#"}
                    badge="Template"
                    name={tpl.name!}
                    description={tpl.description ?? ""}
                    maintainers={tpl.maintainers!}
                    labels={tpl.labels!}
                  />
                ),
              )}

            {type === "user" &&
              (items as Data.ContentType<"plugin::better-auth.user">[]).map(
                (user) => (
                  <UserCard
                    key={user.documentId}
                    name={user.name!}
                    subtitle={user.profile?.subtitle ?? undefined}
                    bio={user.profile?.bio ?? undefined}
                    avatarUrl={
                      user.profile?.avatar?.url
                        ? `${process.env.NEXT_PUBLIC_CMS_URL}${user.profile.avatar.url}`
                        : undefined
                    }
                    profileUrl={user.url_alias?.[0]?.url_path ?? "#"}
                  />
                ),
              )}
          </div>
        ) : (
          <p className="text-sm text-(--color-neutral500)">No items found.</p>
        )}
      </div>
    </Container>
  );
};

export { HighlightsSection };
