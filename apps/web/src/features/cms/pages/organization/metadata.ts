import type { Metadata } from "next";
import { client } from "@/features/cms/lib/strapi";

export const organizationMetadata = async (
  documentId: string,
): Promise<Metadata> => {
  const document = await client
    .collection("plugin::better-auth.organization")
    .findOne(documentId);

  return {
    title: document.data?.name,
    description: document.data?.metadata,
  };
};
