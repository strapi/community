import type { Metadata } from "next";
import { client } from "@/features/cms/lib/strapi";

export const userMetadata = async (id: string): Promise<Metadata> => {
  const document = await client
    .collection("plugin::better-auth.user")
    .findOne(id, {
      populate: {
        profile: true,
      },
    });

  return {
    title: document.data.name,
    description: document.data.profile?.bio,
  };
};
