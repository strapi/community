import type { Metadata } from "next";
import { cmsClient } from "@/features/cms/lib/strapi";

export const packageCategoryMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::package-category.package-category")
    .findOne(documentId, {
      fields: ["name", "description"],
    });

  return {
    title: document.data.name,
    description: document.data.description,
  };
};
