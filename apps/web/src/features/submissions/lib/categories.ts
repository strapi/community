import { cmsClient } from "@/features/cms/lib/strapi";
import type { SubmissionCategory } from "./types";

/**
 * Server-only (uses cmsClient's bearer token) — fetched once in the
 * account and organization settings pages and passed down as a prop, the
 * same way the public submit form's pages fetch categories.
 */
async function fetchCategories(
  uid:
    | "api::package-category.package-category"
    | "api::template-category.template-category",
): Promise<SubmissionCategory[]> {
  try {
    const res = await cmsClient.collection(uid).find({
      pagination: { pageSize: 200 },
      sort: ["name:asc"],
    } as object);

    const data =
      (res as { data: Array<{ documentId: string; name?: string }> }).data ??
      [];

    return data
      .filter((category) => category.name)
      .map((category) => ({
        documentId: category.documentId,
        name: category.name as string,
      }));
  } catch {
    return [];
  }
}

export const getPackageCategories = () =>
  fetchCategories("api::package-category.package-category");

export const getTemplateCategories = () =>
  fetchCategories("api::template-category.template-category");
