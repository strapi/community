"use client";

import type { CategoryPageData } from "@/features/cms/pages/Category/page";

type Props = {
  document: CategoryPageData;
};

const CategoryTemplate = ({ document }: Props) => {
  return <div>Category {document.name}</div>;
};

export default CategoryTemplate;
