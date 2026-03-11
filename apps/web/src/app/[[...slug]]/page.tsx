import type { Metadata, NextPage } from "next";
import { findPage, findUrlAliases } from "@/features/cms/lib/webtools";
import { categoryMetadata } from "@/features/cms/pages/Category/metadata";
import CategoryPage from "@/features/cms/pages/Category/page";
import { homeMetadata } from "@/features/cms/pages/Home/metadata";
import HomePage from "@/features/cms/pages/Home/page";
import { packageMetadata } from "@/features/cms/pages/Package/metadata";
import PackagePage from "@/features/cms/pages/Package/page";
import { templateMetadata } from "@/features/cms/pages/Template/metadata";
import TemplatePage from "@/features/cms/pages/Template/page";
import { userMetadata } from "@/features/cms/pages/User/metadata";
import UserPage from "@/features/cms/pages/User/page";
import { overviewPageMetadata } from "@/features/cms/pages/OverviewPage/metadata";
import OverviewPage from "@/features/cms/pages/OverviewPage/page";

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
      return <UserPage id={page.id} />;
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
      return userMetadata(page.id);
    }
    case "api::template.template": {
      return templateMetadata(page.documentId);
    }
    case "api::category.category": {
      return categoryMetadata(page.documentId);
    }
    case "api::overview-page.overview-page": {
      return overviewPageMetadata();
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
