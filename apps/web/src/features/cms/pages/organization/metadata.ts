import type { Metadata } from "next";
import { cmsClient } from "@/features/cms/lib/strapi";

export const organizationMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await cmsClient
    .collection("plugin::better-auth.organization")
    .findOne(documentId);

  return {
    title: document.data?.name,
    description: document.data?.metadata,
  };
};
