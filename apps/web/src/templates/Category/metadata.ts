import type { Metadata } from "next";
import { client } from "@/lib/strapi";

export const categoryMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await client
    .collection("api::category.category")
    .findOne(documentId, {
      fields: ["name", "description"],
    });

  return {
    title: document.data.name,
    description: document.data.description,
  };
};
