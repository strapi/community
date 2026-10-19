export type OwnerType =
  | "plugin::better-auth.user"
  | "plugin::better-auth.organization";

export interface BaseFormFields {
  repository_url: string;
  description: string;
  logo_file: File | null;
  categories_list: string[];
  readme: string;
  /** Keep the readme synced from the registry/repository (the default) instead of `readme`. */
  readme_auto_sync: boolean;
  submission_notes: string;
  agreed: boolean;
  /** Who this submission belongs to — the submitter, or an org they administer. */
  owner_type: OwnerType;
  /** The organization's id, when `owner_type` is an organization; otherwise `null`. */
  owner_id: number | null;
}

export type FieldErrors<T> = Partial<Record<keyof T | "_form", string>>;
