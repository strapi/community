import { Button, Container } from "@repo/strapi-ui";
import type { Data } from "@strapi/types";
import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarPile } from "@/components/content/avatar-pile";
import { GitProviderLogo } from "@/components/content/git-provider-logo";
import { ContentLabels } from "@/components/content/label-icons";
import { Markdown } from "@/components/content/markdown";
import { SidebarSection } from "@/components/content/sidebar-section/sidebar-section";
import { Navigation } from "@/components/layout/navigation";
import type { CommunityCTAData } from "@/features/cms/lib/community-cta";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { TemplatePageData } from "@/features/cms/pages/template/page";
import { CTASection } from "@/features/cms/sections/cta/cta";
import { EditContentButton } from "@/features/submissions/components/edit-content-button";
import type { Owner } from "@/utils/types";

type Props = {
  document: TemplatePageData;
  communityCta?: CommunityCTAData | null;
};

const TemplateTemplate = ({ document, communityCta }: Props) => {
  const categories = (document.categories ?? []) as {
    documentId: string;
    name: string;
    url_alias?: { url_path?: string }[];
  }[];
  const owner = document.owner as Owner;
  const maintainers = document.maintainers ?? [];
  const githubStars = document.stars;

  const priceLabel = document.price && (
    <span className="text-sm font-medium text-(--color-neutral700)">
      {document.price}
    </span>
  );

  const ctaButtons = (
    <>
      {document.buy_link && (
        <div className="mb-4">
          <Button asChild size="lg" className="w-full justify-center">
            <Link
              href={document.buy_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Purchase
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-center text-sm leading-snug text-(--color-neutral600)">
            This takes you to an external site. Strapi isn't affiliated with the
            seller and isn't responsible for issues with their product.{" "}
            <Link
              href="/help/paid-plugins"
              className="underline hover:text-(--color-neutral700)"
            >
              Learn more
            </Link>
            .
          </p>
        </div>
      )}

      {document.preview_link && (
        <Button
          asChild
          variant={document.buy_link ? "secondary" : "default"}
          size="lg"
          className="w-full justify-center mb-4"
        >
          <Link href={document.preview_link} target="_blank" rel="noopener">
            Preview Template
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <>
      <Navigation theme="light" />
      <Container>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 pb-8 sm:pb-12 lg:pb-16 lg:grid-cols-12 mt-6 sm:mt-10">
          {/* ── Left column ── */}
          <section className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-(--color-primary700)">
                  {document.name}
                </h1>
                {owner && (
                  <p>
                    By{" "}
                    <Link
                      href={owner.url_alias?.[0]?.url_path!}
                      className="items-center gap-1.5 text-sm font-medium text-(--color-primary700) hover:underline"
                    >
                      {owner.name}
                    </Link>
                  </p>
                )}
              </div>
              <div className="flex items-start gap-3 mt-3">
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <ContentLabels labels={document.labels} />
                  </div>
                  {priceLabel}
                </div>
                <EditContentButton
                  type="template"
                  documentId={document.documentId}
                />
              </div>
            </div>

            {/* CTA buttons — shown here on mobile, above the description; on lg+ they move into the sidebar */}
            <div className="lg:hidden">{ctaButtons}</div>

            {document.description && (
              <p className="text-lg text-(--color-neutral700)">
                {document.description}
              </p>
            )}

            <Image
              src={
                document.preview_image
                  ? cmsImageUrl(document.preview_image.url)
                  : "/template-fallback-image.png"
              }
              width={1000}
              height={1000}
              alt={document.name ?? ""}
              className="object-contain"
            />

            {/* README */}
            {document.readme && <Markdown markdown={document.readme} />}
          </section>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28">
              {/* CTA buttons — hidden on mobile, where they're shown above the description instead */}
              <div className="hidden lg:block">{ctaButtons}</div>

              {/* Stats */}
              {githubStars != null && (
                <SidebarSection title="Stats">
                  <div className="space-y-2 text-sm text-(--color-neutral700)">
                    {githubStars != null && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>{githubStars.toLocaleString()} GitHub stars</span>
                      </div>
                    )}
                  </div>
                </SidebarSection>
              )}

              {/* Useful links */}
              {document.git_repository && (
                <SidebarSection title="Useful Links">
                  <div className="space-y-2 flex flex-col">
                    {document.git_repository && (
                      <GitProviderLogo url={document.git_repository} />
                    )}
                  </div>
                </SidebarSection>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <SidebarSection title="Categories">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.documentId}
                        href={cat.url_alias?.[0]?.url_path ?? "#"}
                        className="rounded-md border border-(--color-neutral200) px-2.5 py-1 text-xs text-(--color-neutral700) hover:border-(--color-neutral400) hover:text-(--color-neutral900) transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </SidebarSection>
              )}

              {/* Maintainers */}
              {maintainers.length > 0 && (
                <SidebarSection title="Maintainers">
                  <div className="space-y-3">
                    {maintainers.map((m) => (
                      <AvatarPile clickable key={m.documentId} items={[m]} />
                    ))}
                  </div>
                </SidebarSection>
              )}

              {/* Report an issue */}
              {document.git_repository && (
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="mt-2 w-full justify-center"
                >
                  <Link
                    href={`${document.git_repository}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Report an issue
                  </Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
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

export { TemplateTemplate };
