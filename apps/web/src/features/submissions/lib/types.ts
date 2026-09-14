export type SubmissionType = "package" | "template";

export type SubmissionImage = { url: string } | null;

export type SubmissionCategory = { documentId: string; name: string };

export type SubmissionMaintainer = {
  documentId: string;
  name: string | null;
  email?: string | null;
  image?: string | null;
};

/** One row in the "Submissions" list view — a package or a template. */
export type SubmissionSummary = {
  id: number;
  documentId: string;
  name: string;
  description?: string | null;
  overall_status?: string | null;
  icon?: SubmissionImage;
  preview_image?: SubmissionImage;
  /**
   * True only for the account/organization that owns this entry outright.
   * A maintainer sees their maintained-but-not-owned submissions too (with
   * this set to `false`) — they get read visibility, never write access;
   * the actual write protection is server-side (`is-content-owner`), this
   * flag is UX only (it greys out the edit form).
   */
  isOwner: boolean;
};

export type SubmissionsResponse = {
  packages: SubmissionSummary[];
  templates: SubmissionSummary[];
};

/** The full record behind the edit form for one package/template. */
export type SubmissionDetail = SubmissionSummary & {
  git_repository?: string | null;
  package_location?: string | null;
  /** Templates only — a link to a live demo/preview of the template. */
  preview_link?: string | null;
  readme?: string | null;
  // `null` for anything created before this field existed — treat it the
  // same as `true` (syncing is the default), never as opted out.
  readme_auto_sync: boolean | null;
  categories: SubmissionCategory[];
  maintainers: SubmissionMaintainer[];
  /** The live public page's path (e.g. `/marketplace/<slug>`), or `null` if it isn't published yet. */
  url: string | null;
};

export type OwnerType =
  | "plugin::better-auth.user"
  | "plugin::better-auth.organization";

/** The result of an exact slug lookup, from the maintainer / transfer-target pickers. */
export type PickerResult = {
  documentId: string;
  name: string | null;
  slug: string;
  image: string | null;
};
