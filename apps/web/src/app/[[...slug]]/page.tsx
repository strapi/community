import type { Metadata, NextPage } from "next";
import { findPublishedPage } from "@/features/cms/lib/webtools";
import { HelpPagePage, helpPageMetadata } from "@/features/cms/pages/help-page";
import { HomePage, homeMetadata } from "@/features/cms/pages/home";
import { integrationMetadata } from "@/features/cms/pages/integrations/metadata";
import { IntegrationPage } from "@/features/cms/pages/integrations/page";
import {
  OrganizationPage,
  organizationMetadata,
} from "@/features/cms/pages/organization";
import {
  OverviewPage,
  overviewPageMetadata,
} from "@/features/cms/pages/overview-page";
import { PackagePage, packageMetadata } from "@/features/cms/pages/package";
import {
  PackageCategoryPage,
  packageCategoryMetadata,
} from "@/features/cms/pages/package-category";
import { TemplatePage, templateMetadata } from "@/features/cms/pages/template";
import {
  TemplateCategoryPage,
  templateCategoryMetadata,
} from "@/features/cms/pages/template-category";
import { UserPage, userMetadata } from "@/features/cms/pages/user";

// Pages are rendered on first request, cached, and regenerated in the
// background at most once every 60 seconds (ISR).
export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const Router: NextPage<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const path = `/${slug?.join("/") || ""}`;
  const page = await findPublishedPage(path);

  if (!page) {
    return null;
  }

  switch (page.contentType) {
    case "plugin::better-auth.organization": {
      return <OrganizationPage documentId={page.documentId} />;
    }
    case "api::package.package": {
      return <PackagePage documentId={page.documentId} />;
    }
    case "api::integration.integration": {
      return <IntegrationPage documentId={page.documentId} />;
    }
    case "plugin::better-auth.user": {
      return <UserPage documentId={page.documentId} />;
    }
    case "api::template.template": {
      return <TemplatePage documentId={page.documentId} />;
    }
    case "api::overview-page.overview-page": {
      return <OverviewPage documentId={page.documentId} />;
    }
    case "api::package-category.package-category": {
      return <PackageCategoryPage documentId={page.documentId} />;
    }
    case "api::template-category.template-category": {
      return <TemplateCategoryPage documentId={page.documentId} />;
    }
    case "api::help-page.help-page": {
      return <HelpPagePage documentId={page.documentId} />;
    }
    case "api::home.home": {
      return <HomePage />;
    }
    default: {
      return `No template for content type ${page.contentType}`;
    }
  }
};

// Nothing is prerendered at build time; returning an empty list (instead of
// opting into `force-dynamic`) keeps on-demand ISR for every path.
export async function generateStaticParams() {
  return [];
}

const resolveMetadata = (
  page: Awaited<ReturnType<typeof findPublishedPage>>,
): Promise<Metadata> | Metadata => {
  switch (page.contentType) {
    case "plugin::better-auth.organization": {
      return organizationMetadata(page.documentId);
    }
    case "api::package.package": {
      return packageMetadata(page.documentId);
    }
    case "api::integration.integration": {
      return integrationMetadata(page.documentId);
    }
    case "plugin::better-auth.user": {
      return userMetadata(page.documentId);
    }
    case "api::template.template": {
      return templateMetadata(page.documentId);
    }
    case "api::overview-page.overview-page": {
      return overviewPageMetadata(page.documentId);
    }
    case "api::package-category.package-category": {
      return packageCategoryMetadata(page.documentId);
    }
    case "api::template-category.template-category": {
      return templateCategoryMetadata(page.documentId);
    }
    case "api::help-page.help-page": {
      return helpPageMetadata(page.documentId);
    }
    case "api::home.home": {
      return homeMetadata();
    }
    default: {
      return {};
    }
  }
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const path = `/${slug?.join("/") || ""}`;
  const page = await findPublishedPage(path);

  if (!page) {
    return {};
  }

  const metadata = await resolveMetadata(page);

  // Every page is canonical at its own URL alias (resolved against
  // metadataBase), unless the content type or CMS sets one explicitly.
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: metadata.alternates?.canonical ?? path,
    },
    openGraph: {
      ...metadata.openGraph,
      url: metadata.openGraph?.url ?? path,
    } as Metadata["openGraph"],
  };
};

export default Router;
