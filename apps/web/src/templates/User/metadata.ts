import type { Metadata } from "next";
import { client } from "@/lib/strapi";

export const userMetadata = async (id: number): Promise<Metadata> => {
  const document = await client
    .collection("plugin::users-permissions.user")
    .findOne(String(id), {
      populate: {
        profile: true,
      }
    });

  return {
    title: document.profile?.full_name,
    description: document.profile?.bio,
  };
};
