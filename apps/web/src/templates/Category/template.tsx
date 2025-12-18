"use client";

import type { CategoryPageData } from "@/templates/Category/page";

type Props = {
  document: CategoryPageData;
};

const CategoryTemplate = ({ document }: Props) => {
  return <div>Category {document.name}</div>;
};

export default CategoryTemplate;
