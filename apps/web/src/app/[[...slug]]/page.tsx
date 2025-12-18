import type { Metadata, NextPage } from "next";
import { findPage, findUrlAliases } from "@/lib/webtools";
import { categoryMetadata } from "@/templates/Category/metadata";
import CategoryPage from "@/templates/Category/page";
import { homeMetadata } from "@/templates/Home/metadata";
import HomePage from "@/templates/Home/page";
import { packageMetadata } from "@/templates/Package/metadata";
import PackagePage from "@/templates/Package/page";
import { templateMetadata } from "@/templates/Template/metadata";
import TemplatePage from "@/templates/Template/page";
import { userMetadata } from "@/templates/User/metadata";
import UserPage from "@/templates/User/page";

const Router: NextPage<PageProps<"/[[...slug]]">> = async ({ params }) => {
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
    case "plugin::users-permissions.user": {
      return <UserPage id={page.id} />;
    }
    case "api::template.template": {
      return <TemplatePage documentId={page.documentId} />;
    }
    case "api::category.category": {
      return <CategoryPage documentId={page.documentId} />;
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
}: PageProps<"/[[...slug]]">): Promise<Metadata> => {
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
    case "plugin::users-permissions.user": {
      return userMetadata(page.id);
    }
    case "api::template.template": {
      return templateMetadata(page.documentId);
    }
    case "api::category.category": {
      return categoryMetadata(page.documentId);
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
