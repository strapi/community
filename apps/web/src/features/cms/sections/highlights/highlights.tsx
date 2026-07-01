import { Button, Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { ContentCard, UserCard } from "@/components/content/card";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import { cmsClient } from "@/features/cms/lib/strapi";

type Props = {
  section: Data.Component<"sections.highlights">;
};

const gridColsMap: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
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
        owner: true,
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
        owner: true,
      },
    });
    return { type: "template" as const, items: res.data ?? [] };
  }

  if (query.startsWith("integrations_")) {
    const res = await cmsClient
      .collection("api::integration.integration")
      .find({
        ...featuredFilter,
        sort: ["createdAt:desc"],
        pagination: { limit: amount },
        populate: {
          logo: true,
          url_alias: true,
          labels: true,
        },
      });
    return { type: "integration" as const, items: res.data ?? [] };
  }

  if (query.startsWith("community_")) {
    const res = await cmsClient.collection("plugin::better-auth.user").find({
      sort: [query === "community_newest" ? "createdAt:desc" : "name:asc"],
      pagination: { limit: amount },
      populate: {
        url_alias: true,
        profile: true,
      },
    });
    return { type: "user" as const, items: res.data ?? [] };
  }

  return { type: "unknown" as const, items: [] };
}

const HighlightsSection = async ({ section }: Props) => {
  const { title, query, amount, grid, button } = section;

  let result: Awaited<ReturnType<typeof fetchItems>>;

  if (query === "packages_selection") {
    result = {
      type: "package" as const,
      items:
        (section.packages as Data.ContentType<"api::package.package">[]) ?? [],
    };
  } else if (query === "templates_selection") {
    result = {
      type: "template" as const,
      items:
        (section.templates as Data.ContentType<"api::template.template">[]) ??
        [],
    };
  } else if (query === "integrations_selection") {
    result = {
      type: "integration" as const,
      items:
        (section.integrations as Data.ContentType<"api::integration.integration">[]) ??
        [],
    };
  } else {
    result = await fetchItems(query!, amount!);
  }

  const { type, items } = result;

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
                        ? cmsImageUrl(pkg.icon.url)
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
                    owner={pkg.owner!}
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
                        ? cmsImageUrl(tpl.preview_image.url)
                        : "/template-fallback-preview.png",
                      alt: tpl.preview_image?.alternativeText ?? "",
                      size: "L",
                    }}
                    link={tpl.url_alias?.[0]?.url_path ?? "#"}
                    badge="Template"
                    name={tpl.name!}
                    description={tpl.description ?? ""}
                    owner={tpl.owner!}
                    labels={tpl.labels!}
                  />
                ),
              )}

            {type === "integration" &&
              (items as Data.ContentType<"api::integration.integration">[]).map(
                (integration) => (
                  <ContentCard
                    key={integration.documentId}
                    image={{
                      src: integration.logo
                        ? cmsImageUrl(integration.logo.url)
                        : "/logo-plugin.png",
                      alt: integration.logo?.alternativeText ?? "",
                      size: "S",
                    }}
                    link={integration.url_alias?.[0]?.url_path ?? "#"}
                    badge="Integration"
                    name={integration.name!}
                    description={integration.description ?? ""}
                    labels={integration.labels?.[0]}
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
                    avatarUrl={user.image ? cmsImageUrl(user.image) : undefined}
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
