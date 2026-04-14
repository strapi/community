import type { Metadata } from "next";
import { cmsClient } from "@/features/cms/lib/strapi";

export const userMetadata = async (id: string): Promise<Metadata> => {
  const document = await cmsClient
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
