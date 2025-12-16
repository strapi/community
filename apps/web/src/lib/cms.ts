import { client } from "@/lib/strapi";
import { notFound } from "next/navigation";

export const findPages = async () => {
  return await client.fetch('/webtools/url-alias')
    .then((response) => response.json())
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error)
    });
};

export const findOnePage = async (path: string) => {
  return await client.fetch(`/webtools/router?path=${path}&populate=*&publicationState=live`)
    .then((response) => response.json())
    .then((response) => response.data)
    .catch((error) => {
      if (error.response.status === 404) {
        notFound();
      }
      throw new Error(error)
    });
};