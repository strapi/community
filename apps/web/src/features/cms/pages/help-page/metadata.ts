import type { Metadata } from "next";
import { cmsClient } from "@/features/cms/lib/strapi";

export const helpPageMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("api::help-page.help-page")
    .findOne(documentId, {
      fields: ["title", "description"],
    });

  return {
    title: document.data.title,
    description: document.data.description ?? undefined,
  };
};
