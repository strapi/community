"use client";

import type { TemplatePageData } from "@/features/cms/pages/template";

type Props = {
  document: TemplatePageData;
};

const TemplateTemplate = ({ document }: Props) => {
  return <div>Template {document.name}</div>;
};

export { TemplateTemplate };
