import { Container } from "@repo/strapi-ui";
import { ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/content/markdown";
import { PageNav } from "@/components/content/page-nav";
import { Navigation } from "@/components/layout/navigation";
import { SectionsMapper } from "@/features/cms/sections/mapper";
import type { HelpPageData } from "./page";

type Props = {
  document: HelpPageData;
};

type BreadcrumbItem = {
  title: string;
  url: string;
};

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="Breadcrumb" className="mb-8">
    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-(--color-neutral500)">
      <li>
        <Link
          href="/help"
          className="hover:text-(--color-primary600) transition-colors"
        >
          Help Center
        </Link>
      </li>
      {items.map((item, index) => (
        <li key={item.url} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {index === items.length - 1 ? (
            <span className="text-(--color-neutral800) font-medium">
              {item.title}
            </span>
          ) : (
            <Link
              href={item.url}
              className="hover:text-(--color-primary600) transition-colors"
            >
              {item.title}
            </Link>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const buildBreadcrumbs = (document: HelpPageData): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];
  const grandparentTitle = document.parent?.parent?.title;
  const grandparentAlias = document.parent?.parent?.url_alias?.[0]?.url_path;
  const parentTitle = document.parent?.title;
  const parentAlias = document.parent?.url_alias?.[0]?.url_path;

  if (grandparentTitle && grandparentAlias) {
    breadcrumbs.push({ title: grandparentTitle, url: grandparentAlias });
  }
  if (parentTitle && parentAlias) {
    breadcrumbs.push({ title: parentTitle, url: parentAlias });
  }
  breadcrumbs.push({
    title: document.title ?? "",
    url: document.url_alias?.[0]?.url_path ?? "#",
  });

  return breadcrumbs;
};

const HelpPageTemplate = ({ document }: Props) => {
  const children = (document.children ?? []) as {
    documentId: string;
    title: string;
    url_alias?: { url_path?: string }[];
  }[];

  const breadcrumbs = buildBreadcrumbs(document);

  return (
    <>
      <Navigation theme="light" />
      <Container>
        <div className="border-x border-(--color-neutral150) px-8 sm:px-16 py-12">
          <Breadcrumb items={breadcrumbs} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-primary100) text-(--color-primary600)">
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-wider text-(--color-primary600)">
                  Help Center
                </p>
              </div>

              <h1 className="text-3xl font-bold text-(--color-neutral800) mb-3">
                {document.title}
              </h1>

              {document.description && (
                <p className="text-(--color-neutral600) mb-8">
                  {document.description}
                </p>
              )}

              {children.length > 0 && (
                <div className="mb-8 rounded-md border border-(--color-neutral150) bg-white shadow-sm overflow-hidden">
                  {children.map((child) => (
                    <Link
                      key={child.documentId}
                      href={child.url_alias?.[0]?.url_path ?? "#"}
                      className="flex items-center justify-between gap-4 border-b border-(--color-neutral150) last:border-b-0 py-4 px-4 text-(--color-neutral800) hover:text-(--color-primary600) hover:bg-(--color-neutral50) transition-colors"
                    >
                      <span className="font-medium">{child.title}</span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-(--color-neutral400)"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              )}

              {document.content && (
                <div id="article-content" className="prose max-w-none mb-8">
                  <Markdown markdown={document.content} />
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <PageNav contentId="article-content" />
            </aside>
          </div>
        </div>
      </Container>
      {document.sections?.map((section) => (
        <SectionsMapper
          key={section.id}
          section={section}
          id={section.__component}
        />
      ))}
    </>
  );
};

export { HelpPageTemplate };
