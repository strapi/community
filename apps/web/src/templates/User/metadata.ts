import type { Metadata } from "next";
import { client } from "@/lib/strapi";

export const userMetadata = async (id: number): Promise<Metadata> => {
  const document = await client
    .collection("plugin::users-permissions.user")
    .findOne(String(id), {
      fields: ["description", "username"],
    });

  return {
    title: document.username,
    description: document.description,
  };
};
