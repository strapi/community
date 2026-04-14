import type { Metadata } from "next";
import { cmsClient } from "@/features/cms/lib/strapi";

export const categoryMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::category.category")
    .findOne(documentId, {
      fields: ["name", "description"],
    });

  return {
    title: document.data.name,
    description: document.data.description,
  };
};
