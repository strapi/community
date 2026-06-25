import { Navigation } from "@/components/layout/navigation";
import { cmsClient } from "@/features/cms/lib/strapi";
import { SubmitShowcaseForm } from "./SubmitShowcaseForm";

async function fetchCategories(): Promise<string[]> {
  try {
    const res = await cmsClient
      .collection("api::showcase-category.showcase-category")
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

export default async function SubmitShowcasePage() {
  const categories = await fetchCategories();
  return (
    <>
      <Navigation theme="light" />
      <SubmitShowcaseForm initialCategories={categories} />
    </>
  );
}
