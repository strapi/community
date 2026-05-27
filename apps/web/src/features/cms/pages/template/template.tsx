import { Button, Container } from "@repo/strapi-ui";
import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarPile } from "@/components/content/avatar-pile";
import { GitProviderLogo } from "@/components/content/git-provider-logo";
import { Markdown } from "@/components/content/markdown";
import { SidebarSection } from "@/components/content/sidebar-section/sidebar-section";
import { Navigation } from "@/components/layout/navigation";
import { cmsImageUrl } from "@/features/cms/lib/image-url";
import type { TemplatePageData } from "@/features/cms/pages/template/page";
import type { Owner } from "@/utils/types";

type Props = {
  document: TemplatePageData;
};

const TemplateTemplate = ({ document }: Props) => {
  const categories = (document.categories ?? []) as {
    documentId: string;
    name: string;
    url_alias?: { url_path?: string }[];
  }[];
  const owner = document.owner as Owner;
  const maintainers = document.maintainers ?? [];
  const githubStars = document.stars;

  return (
    <>
      <Navigation theme="light" />
      <Container>
        <div className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-12 mt-10">
          {/* ── Left column ── */}
          <section className="lg:col-span-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-5">
              <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden border border-(--color-neutral150) bg-white flex items-center justify-center">
                <Image
                  src={
                    document.preview_image
                      ? cmsImageUrl(document.preview_image.url)
                      : "/template-fallback-image.png"
                  }
                  width={64}
                  height={64}
                  alt={document.name ?? ""}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-3xl font-bold text-(--color-primary700)">
                    {document.name}
                  </h1>
                </div>
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
            </div>

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
            <div className="sticky top-25">
              {/* Preview link */}
              {document.preview_link && (
                <Button
                  asChild
                  size="lg"
                  className="w-full justify-center mb-4"
                >
                  <Link
                    href={document.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview Template
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}

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
                      <AvatarPile key={m.documentId} items={[m]} />
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
    </>
  );
};

export { TemplateTemplate };
