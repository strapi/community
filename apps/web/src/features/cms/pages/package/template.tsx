import {
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarPile } from "@/components/content/avatar-pile";
import { CodeBlock } from "@/components/content/code-block";
import { GitProviderLogo } from "@/components/content/git-provider-logo";
import { Markdown } from "@/components/content/markdown";
import { RegistryLogo } from "@/components/content/registry-logo";
import { Container } from "@/components/layout/container";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import type { PackagePageData } from "@/features/cms/pages/package";
import type { Owner } from "@/utils/types";

type Props = {
  document: PackagePageData;
  owner: Owner;
};

const SidebarSection = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md mb-2 bg-(--color-neutral100) border-b border-(--color-neutral150) px-5 py-4 last:border-b-0">
    {title && (
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-neutral500)">
        {title}
      </p>
    )}
    {children}
  </div>
);

const SECURITY_STYLES = {
  passed: {
    wrapper: "border-blue-200 bg-blue-50",
    icon: <ShieldCheck className="h-8 w-8 shrink-0 text-blue-500" />,
    badge: "bg-blue-100 text-blue-700",
    label: "Security check passed",
  },
  failed: {
    wrapper: "border-red-200 bg-red-50",
    icon: <ShieldX className="h-8 w-8 shrink-0 text-red-500" />,
    badge: "bg-red-100 text-red-700",
    label: "Security check failed",
  },
  pending: {
    wrapper: "border-(--color-neutral200) bg-(--color-neutral50)",
    icon: (
      <ShieldCheck className="h-8 w-8 shrink-0 text-(--color-neutral400)" />
    ),
    badge: "bg-(--color-neutral150) text-(--color-neutral600)",
    label: "Security check pending",
  },
};

const VersionSecurityBadge = ({
  version,
  checkedAt,
  status,
  command,
}: {
  version: string;
  command: string;
  checkedAt: Date | string;
  status: "passed" | "failed" | "pending";
}) => {
  const styles = SECURITY_STYLES[status];
  const date = new Date(checkedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-5 py-4 ${styles.wrapper}`}
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-(--color-neutral800)">
            v{version}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
          >
            {styles.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-(--color-neutral500)">
          {status === "pending"
            ? "Check in progress"
            : `Last checked on ${date}`}
        </p>
        <CodeBlock language="bash" value={command} copyable />
      </div>
    </div>
  );
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
                      : "/plugin-fallback-icon.png"
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
              status="passed"
              command={document.version_info?.install_command!}
            />

            {/* README */}
            {document.readme && <Markdown markdown={document.readme} />}
          </section>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6">
              {/* Buy CTA */}
              {document.labels?.paid && document.labels?.buy_link && (
                <div className="p-4 border-b border-(--color-neutral150)">
                  <Button
                    href={document.labels.buy_link}
                    variant="primary"
                    className="w-full justify-between"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {document.labels.price
                      ? `Buy for $${document.labels.price}`
                      : "Buy Now"}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}

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
              <div className="px-5 py-4 text-center">
                <Link
                  href={
                    document.git_repository
                      ? `${document.git_repository}/issues`
                      : "#"
                  }
                  target={document.git_repository ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-sm text-(--color-neutral500) hover:text-(--color-neutral800) transition-colors"
                >
                  Report an issue
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
};

export { PackageTemplate };
