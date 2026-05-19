import { cmsClient } from "@/features/cms/lib/strapi";
import { SubmitTemplateForm } from "./SubmitTemplateForm";

async function fetchCategories(): Promise<string[]> {
  try {
    const res = await cmsClient
      .collection("api::template-category.template-category")
      .find({
        pagination: { pageSize: 100 },
        sort: ["name:asc"],
        fields: ["name"],
      } as object);
    const data = (res as { data: Array<{ name?: string }> }).data ?? [];
    return data.map((c) => c.name).filter((n): n is string => Boolean(n));
  } catch {
    return [];
  }
}

export default async function SubmitTemplatePage() {
  const categories = await fetchCategories();
  return <SubmitTemplateForm initialCategories={categories} />;
}
