import { Button, Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import {
  AppWindow,
  CalendarDays,
  ExternalLink,
  Github,
  Globe,
  LayoutGrid,
  MapPin,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContentCard } from "@/components/content/card";
import { Markdown } from "@/components/content/markdown";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Hero, HeroSection } from "@/components/layout/hero";
import { Navigation } from "@/components/layout/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CommunityCTAData } from "@/features/cms/lib/community-cta";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { OrganizationPageData } from "@/features/cms/pages/organization/page";
import { CTASection } from "@/features/cms/sections/cta/cta";
import type { RelatedContentItems } from "@/utils/types";

type Props = {
  document: OrganizationPageData;
  relatedContent: RelatedContentItems;
  members: Data.ContentType<"plugin::better-auth.user">[];
  communityCta?: CommunityCTAData | null;
};

const OrganizationTemplate = ({
  document,
  members,
  relatedContent,
  communityCta,
}: Props) => {
  const { templates, packages } = relatedContent;
  const noRelatedContent = templates.length === 0 && packages.length === 0;

  return (
    <>
      <Navigation theme="dark" />
      <Hero>
        <HeroSection>
          <div className="px-4 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-26">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            {/* Logo + Name */}
            <div className="mb-6 sm:flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-(--color-primary600) bg-white">
                {document.logo ? (
                  <Image
                    src={cmsImageUrl(document.logo)}
                    width={118}
                    height={118}
                    alt={document.name ?? ""}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-(--color-neutral900)">
                    {document.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-[48px] mt-2 sm:mt-0 font-semibold text-white!">
                  {document.name}
                </h1>
                {document.profile?.subtitle && (
                  <p className="mt-1 text-[19px] text-(--color-hero-muted)">
                    {document.profile.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div>
              {/* Description */}
              {document.profile?.bio && (
                <p className="mb-6 max-w-xl text-md leading-6 text-(--color-hero-muted)">
                  {document.profile.bio}
                </p>
              )}
            </div>
            <div>
              {/* Metadata */}
              <div className="mb-8 md:flex flex-wrap items-center gap-6 text-md text-(--color-hero-nav-muted)">
                {document.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Joined:{" "}
                    {new Date(document.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {document.profile?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {document.profile.location}
                  </span>
                )}
                {document.profile?.github && (
                  <Link
                    href={document.profile.github}
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                )}
              </div>

              {/* Website button */}
              {document.profile?.website && (
                <Button asChild variant="secondary">
                  <Link
                    href={document.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </HeroSection>
      </Hero>

      <Container>
        <Tabs
          defaultValue={noRelatedContent ? "about" : "content"}
          className="w-full"
        >
          <TabsList className="border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-4 sm:py-6 lg:py-10">
            {!noRelatedContent && (
              <TabsTrigger
                value="content"
                icon={<LayoutGrid className="h-4 w-4" />}
              >
                Published Content
              </TabsTrigger>
            )}
            <TabsTrigger value="about" icon={<AppWindow className="h-4 w-4" />}>
              About {document.name}
            </TabsTrigger>
            {members.length > 0 && (
              <TabsTrigger value="people" icon={<Users className="h-4 w-4" />}>
                People
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content">
            {templates.length > 0 && (
              <section className="border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18">
                <h2 className="mb-6 sm:mb-10 lg:mb-14 text-[21px] font-semibold text-(--color-primary600)">
                  Templates
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {templates.map((template) => (
                    <ContentCard
                      key={template.documentId}
                      image={{
                        src: template.preview_image
                          ? cmsImageUrl(template.preview_image.url)
                          : "/template-fallback-preview.png",
                        alt: template.preview_image?.alternativeText ?? "",
                        size: "L",
                      }}
                      description={template.description ?? ""}
                      link={template.url_alias?.[0]?.url_path!}
                      badge="Template"
                      name={template.name!}
                      owner={template.owner!}
                      labels={template.labels!}
                    />
                  ))}
                </div>
              </section>
            )}

            {packages.length > 0 && (
              <section className="border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18">
                <h2 className="mb-6 sm:mb-10 lg:mb-14 text-[21px] font-semibold text-(--color-primary600)">
                  Packages
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {packages.map((pkg) => (
                    <ContentCard
                      key={pkg.documentId}
                      image={{
                        src: pkg.icon
                          ? cmsImageUrl(pkg.icon.url)
                          : "/package-fallback-icon.png",
                        alt: pkg.icon?.alternativeText ?? "",
                        size: "S",
                      }}
                      description={pkg.description ?? ""}
                      link={pkg.url_alias?.[0]?.url_path!}
                      badge="Package"
                      name={pkg.name!}
                      owner={pkg.owner!}
                      labels={pkg.labels!}
                    />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent
            value="about"
            className="overflow-hidden border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18"
          >
            <h2 className="mb-6 sm:mb-10 lg:mb-14 text-[21px] font-semibold text-(--color-neutral900)">
              About {document.name}
            </h2>
            {document.profile?.readme ? (
              <Markdown markdown={document.profile.readme} />
            ) : (
              <p className="text-md text-(--color-neutral600)">
                No description provided.
              </p>
            )}
          </TabsContent>

          <TabsContent
            value="people"
            className="overflow-hidden border-(--color-neutral300) border-l border-r border-b px-4 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-10 pt-8 sm:pt-12 lg:pt-18"
          >
            <h2 className="mb-6 sm:mb-10 lg:mb-14 text-[21px] font-semibold text-(--color-neutral900)">
              People
            </h2>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {members.map((member) => {
                  const avatarUrl = member?.image;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border border-(--color-neutral150) p-4"
                    >
                      {avatarUrl ? (
                        <Image
                          src={cmsImageUrl(avatarUrl)}
                          width={40}
                          height={40}
                          alt={member?.name ?? ""}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-(--color-primary200)" />
                      )}
                      <div>
                        <p className="text-md font-semibold text-(--color-neutral900)">
                          {member?.name}
                        </p>
                        {member?.profile?.subtitle && (
                          <p className="text-xs text-(--color-neutral600)">
                            {member.profile.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-md text-(--color-neutral600)">
                No members listed.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </Container>
      {communityCta && (
        <CTASection
          section={
            { cta: communityCta } as unknown as Data.Component<"sections.cta">
          }
        />
      )}
    </>
  );
};

export { OrganizationTemplate };
