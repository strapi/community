import { Button, Container } from "@repo/strapi-ui";
import Image from "next/image";
import Link from "next/link";
import { ContentCard } from "@/components/content/card/card";
import { Markdown } from "@/components/content/markdown";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { IntegrationPageData } from "@/features/cms/pages/integrations";

type Props = {
  document: IntegrationPageData;
};

const IntegrationTemplate = ({ document }: Props) => {
  return (
    <div>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="flex items-center">
            <div className="px-14 py-26 max-w-150">
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
        {document.packages && document.packages.length > 0 && (
          <div className="overflow-hidden border-(--color-neutral300) border-l border-r border-b px-16 py-10 pt-18">
            <div className="flex items-center justify-between mb-14">
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
        {document.templates && document.templates.length > 0 && (
          <div className="overflow-hidden border-(--color-neutral300) border-l border-r border-b px-16 py-10 pt-18">
            <h2 className="mb-14 text-[21px] font-semibold text-(--color-neutral900)">
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
        <div className="overflow-hidden border-(--color-neutral300) border-l border-r border-b px-16 py-10 pt-18">
          <Markdown markdown={document.content!} />
        </div>
      </Container>
    </div>
  );
};

export { IntegrationTemplate };
