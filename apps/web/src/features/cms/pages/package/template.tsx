import { Button, StrapiFooter, StrapiNavbar } from "@repo/strapi-ui";
import { Download, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarPile } from "@/components/content/avatar-pile";
import { GitProviderLogo } from "@/components/content/git-provider-logo";
import { Markdown } from "@/components/content/markdown";
import { RegistryLogo } from "@/components/content/registry-logo";
import { SidebarSection } from "@/components/content/sidebar-section";
import { VersionSecurityBadge } from "@/components/content/version-info";
import { Container } from "@/components/layout/container";
import { Navigation } from "@/components/layout/navigation";
import type { PackagePageData } from "@/features/cms/pages/package";
import type { Owner } from "@/utils/types";

type Props = {
  document: PackagePageData;
  owner: Owner;
};

const PackageTemplate = ({ document, owner }: Props) => {
  const categories = (document.categories ?? []) as {
    documentId: string;
    name: string;
  }[];
  const maintainers = document.maintainers ?? [];
  const githubStars = document.stars;
  const npmDownloads = document.monthly_downloads;

  return (
    <>
      <StrapiNavbar />
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
                    document.icon
                      ? `${process.env.NEXT_PUBLIC_CMS_URL}${document.icon.url}`
                      : "/package-fallback-icon.png"
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
                <p>
                  By{" "}
                  <Link
                    href={owner.url_alias?.[0]?.url_path!}
                    className="items-center gap-1.5 text-sm font-medium text-(--color-primary700) hover:underline"
                  >
                    {owner.name}
                  </Link>
                </p>
              </div>
            </div>

            {document.description && (
              <p className="text-lg text-(--color-neutral700)">
                {document.description}
              </p>
            )}

            {/* Latest version & security check */}
            <h3 className="mb-2 font-semibold">Latest version</h3>
            <VersionSecurityBadge
              version={document.version_info?.version!}
              checkedAt={document.version_info?.published_at!}
              status="pending"
              command={document.version_info?.install_command!}
            />

            {/* README */}
            {document.readme && <Markdown markdown={document.readme} />}
          </section>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6">
              {/* Stats */}
              {(githubStars != null || npmDownloads != null) && (
                <SidebarSection title="Stats">
                  <div className="space-y-2 text-sm text-(--color-neutral700)">
                    {githubStars != null && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>{githubStars.toLocaleString()} GitHub stars</span>
                      </div>
                    )}
                    {npmDownloads != null && (
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 shrink-0 text-(--color-neutral500)" />
                        <span>
                          {npmDownloads.toLocaleString()} monthly downloads
                        </span>
                      </div>
                    )}
                  </div>
                </SidebarSection>
              )}

              {/* Useful links */}
              {(document.package_location || document.git_repository) && (
                <SidebarSection title="Useful Links">
                  <div className="space-y-2 flex flex-col">
                    {document.package_location && (
                      <RegistryLogo url={document.package_location} />
                    )}
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
                      <span
                        key={cat.documentId}
                        className="rounded-md border border-(--color-neutral200) px-2.5 py-1 text-xs text-(--color-neutral700)"
                      >
                        {cat.name}
                      </span>
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
      <StrapiFooter />
    </>
  );
};

export { PackageTemplate };
