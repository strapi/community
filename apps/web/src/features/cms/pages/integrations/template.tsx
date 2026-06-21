import { Button, Container } from "@repo/strapi-ui";
import Image from "next/image";
import Link from "next/link";
import { ContentCard } from "@/components/content/card/card";
import { Markdown } from "@/components/content/markdown";
import { PageNav } from "@/components/content/page-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { IntegrationPageData } from "@/features/cms/pages/integrations";

type Props = {
  document: IntegrationPageData;
};

const IntegrationTemplate = ({ document }: Props) => {
  const hasPackages = (document.packages?.length ?? 0) > 0;
  const hasTemplates = (document.templates?.length ?? 0) > 0;

  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="flex items-center">
            <div className="px-14 py-26 max-w-150">
              <div className="mb-5">
                <Breadcrumbs />
              </div>
              <h1 className="text-[48px] mt-2 sm:mt-0 font-semibold text-white!">
                {document.name}
              </h1>
              <p className="text-[17px] text-(--color-hero-muted)">
                {document.description}
              </p>
            </div>
            {document.logo && (
              <Image
                src={cmsImageUrl(document.logo.url)}
                alt={document.name!}
                width={150}
                height={150}
                className="mt-10 mr-14 h-fit rounded-lg object-cover ml-auto"
              />
            )}
          </div>
        </HeroSection>
      </Hero>
      <Container>
        <div className="border-x border-(--color-neutral150)">
          {hasPackages && (
            <div
              id="packages"
              className="border-(--color-neutral150) border-b px-8 sm:px-16 py-12"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[21px] font-semibold text-(--color-neutral900)">
                  Packages built for {document.name}
                </h2>
                <Button asChild>
                  <Link
                    href={`/marketplace?packages:monthly_downloads:desc[refinementList][integrations.name][0]=${document.name}&tab=packages`}
                    className="text-(--color-primary600)"
                  >
                    See more
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {document.packages?.map((pkg) => (
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
                ))}
              </div>
            </div>
          )}
          {hasTemplates && (
            <div
              id="templates"
              className="border-(--color-neutral150) border-b px-8 sm:px-16 py-12"
            >
              <h2 className="mb-10 text-[21px] font-semibold text-(--color-neutral900)">
                Templates built with {document.name}
              </h2>
              <div className="grid gap-4 grid-cols-3">
                {document.templates?.map((tpl) => (
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
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-x border-(--color-neutral150) px-8 sm:px-16 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div id="integration-content" className="lg:col-span-8">
              {document.content && (
                <div id="overview">
                  <Markdown markdown={document.content} />
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <PageNav contentId="integration-content" title="On this page" />
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
};

export { IntegrationTemplate };
