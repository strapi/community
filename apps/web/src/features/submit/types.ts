export interface BaseFormFields {
  repository_url: string;
  description: string;
  logo_file: File | null;
  categories_list: string[];
  submission_notes: string;
  agreed: boolean;
}

export type FieldErrors<T> = Partial<Record<keyof T | "_form", string>>;
