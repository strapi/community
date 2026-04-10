import type { Metadata, NextPage } from "next";
import { findPage, findUrlAliases } from "@/features/cms/lib/webtools";
import { CategoryPage, categoryMetadata } from "@/features/cms/pages/category";
import { HomePage, homeMetadata } from "@/features/cms/pages/home";
import {
  OverviewPage,
  overviewPageMetadata,
} from "@/features/cms/pages/overview-page";
import { PackagePage, packageMetadata } from "@/features/cms/pages/package";
import { TemplatePage, templateMetadata } from "@/features/cms/pages/template";
import { UserPage, userMetadata } from "@/features/cms/pages/user";

// Regenerate static pages periodically.
export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const Router: NextPage<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const path = `/${slug?.join("/") || ""}`;
  const page = await findPage({
    path,
    status: "published",
    fields: ["documentId"],
  });

  if (!page) {
    return null;
  }

  switch (page.contentType) {
    case "api::package.package": {
      return <PackagePage documentId={page.documentId} />;
    }
    case "plugin::better-auth.user": {
      return <UserPage documentId={page.documentId} />;
    }
    case "api::template.template": {
      return <TemplatePage documentId={page.documentId} />;
    }
    case "api::category.category": {
      return <CategoryPage documentId={page.documentId} />;
    }
    case "api::overview-page.overview-page": {
      return <OverviewPage documentId={page.documentId} />;
    }
    case "api::home.home": {
      return <HomePage />;
    }
    default: {
      return `No template for content type ${page.contentType}`;
    }
  }
};

export async function generateStaticParams() {
  const pages = await findUrlAliases();
  const removeEmptyElements = (array: string[]) => array.filter((a) => a);

  if (!pages) {
    return [];
  }

  return pages
    .map((page) => {
      if (!page.url_path) {
        return null;
      }
      return {
        slug: removeEmptyElements(page.url_path.split("/")),
      };
    })
    .filter(Boolean);
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const path = `/${slug?.join("/") || ""}`;
  const page = await findPage({
    path,
    status: "published",
    fields: ["documentId"],
  });

  if (!page) {
    return {};
  }

  switch (page.contentType) {
    case "api::package.package": {
      return packageMetadata(page.documentId);
    }
    case "plugin::better-auth.user": {
      return userMetadata(page.documentId);
    }
    case "api::template.template": {
      return templateMetadata(page.documentId);
    }
    case "api::category.category": {
      return categoryMetadata(page.documentId);
    }
    case "api::overview-page.overview-page": {
      return overviewPageMetadata(page.documentId);
    }
    case "api::home.home": {
      return homeMetadata();
    }
    default: {
      return {};
    }
  }
};

export default Router;
