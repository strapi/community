import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

export const cmsImageUrl = (url: string): string =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${process.env.NEXT_PUBLIC_CMS_URL}${url}`;

export async function renderIcon(name: string, props?: LucideProps) {
  // @ts-expect-error - The dynamic imports from lucide-react don't have proper typings
  const importer = dynamicIconImports[name];
  if (!importer) return null;
  const { default: Icon } = await importer();
  return <Icon {...props} />;
}
