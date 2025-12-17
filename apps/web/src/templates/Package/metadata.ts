import { client } from "@/lib/strapi";
import type { Metadata } from "next";

export const packageMetadata = async (documentId: string): Promise<Metadata> => {
  const document = await client.collection('api::package.package').findOne(documentId, {
    fields: ['name', 'description'],
  });

  return {
    title: document.data.name,
    description: document.data.description,
  }
};