import type { Metadata } from "next";
import { client } from "@/features/cms/lib/strapi";

export const userMetadata = async (id: number): Promise<Metadata> => {
  const document = await client
    .collection("plugin::better-auth.user")
    .findOne(String(id), {
      populate: {
        profile: true,
      },
    });

  return {
    title: document.data.profile?.full_name,
    description: document.data.profile?.bio,
  };
};
