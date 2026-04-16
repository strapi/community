import type { Modules } from "@strapi/types";

export type Owner = Modules.Documents.Document<
  "plugin::better-auth.user" | "plugin::better-auth.organization"
>;

export type RelatedContentItems = {
  packages: Modules.Documents.Result<"api::package.package">[];
  templates: Modules.Documents.Result<"api::template.template">[];
};
