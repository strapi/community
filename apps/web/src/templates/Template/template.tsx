"use client";

import type { TemplatePageData } from "@/templates/Template/page";

type Props = {
  document: TemplatePageData;
};

const TemplateTemplate = ({ document }: Props) => {
  return <div>Template {document.name}</div>;
};

export default TemplateTemplate;
