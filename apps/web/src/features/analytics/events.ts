/**
 * The dataLayer contract: every event the app pushes, and its parameters.
 * Mirrors the event dictionary in the Community Hub analytics & tracking
 * plan. GTM reads these names verbatim, so renaming one here means changing
 * the container and the GA4 custom definitions too.
 *
 * Rules (from the plan): snake_case, at most 40 characters, values from a
 * closed set where there is one, documentIds rather than numeric ids, and no
 * email, private names or form free text.
 */

export type PageType =
  | "home"
  | "marketplace"
  | "overview"
  | "package_detail"
  | "template_detail"
  | "integration_detail"
  | "package_category"
  | "template_category"
  | "help_page"
  | "member_profile"
  | "org_profile"
  | "roadmap"
  | "submit_plugin"
  | "submit_template"
  | "auth"
  | "account"
  | "org_settings"
  | "partner_portal"
  | "error";

export type ContentType =
  | "package"
  | "template"
  | "integration"
  | "showcase"
  | "partner"
  | "member"
  | "organization"
  | "help_page"
  | "category"
  | "roadmap_item";

export type SearchIndex =
  | "generic"
  | "packages"
  | "templates"
  | "integrations"
  | "showcases"
  | "members"
  | "partners"
  | "help_pages"
  | "recipes";

export type OwnerType = "user" | "organization";
export type AuthMethod =
  | "password"
  | "magic_link"
  | "google"
  | "github"
  | "email";
export type FormName =
  | "submit_plugin"
  | "submit_template"
  | "edit_plugin"
  | "edit_template"
  | "user_profile"
  | "org_profile";

/** What <PageContext> contributes to every event on the page. */
export type PageContextParams = {
  page_type: PageType;
  content_id?: string;
  content_name?: string;
  content_category?: string;
  owner_type?: OwnerType;
  settings_tab?: string;
  portal_section?: string;
};

/** One entry of a GA4 ecommerce `items` array. */
export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: ContentType;
  item_category2?: string;
  item_variant?: string;
  item_brand?: string;
  index?: number;
  is_official?: boolean;
  is_featured?: boolean;
};

/** Events sent through the GA4 ecommerce model, via `trackItems()`. */
export type ItemEventName = "view_item_list" | "select_item" | "view_item";

/** For events with no parameters of their own. */
type NoParams = Record<never, never>;

export type EventMap = {
  // Navigation
  page_view: PageContextParams & {
    page_location: string;
    page_path: string;
    page_title: string;
  };
  nav_click: {
    nav_area: string;
    nav_section?: string;
    link_text?: string;
    link_url: string;
  };
  nav_menu_open: { nav_area: string; menu_name: string };
  cta_click: {
    cta_location: string;
    cta_id?: string;
    cta_text?: string;
    link_url?: string;
  };
  outbound_click: {
    link_type: string;
    link_url: string;
    link_domain: string;
    item_id?: string;
    item_type?: ContentType;
  };
  tab_select: { tab_group: string; tab_name: string };
  toc_click: { section_id: string; section_label?: string };
  faq_toggle: { faq_id: string; faq_action: "open" | "close" };
  error_view: { error_code: string; error_digest?: string };

  // Discovery
  search: {
    search_term: string;
    search_index: SearchIndex;
    search_location?: string;
    results_count: number;
  };
  filter_apply: {
    search_index: SearchIndex;
    filter_name: string;
    filter_value: string;
    filter_action: "add" | "remove";
    results_count?: number;
  };
  filter_clear: { search_index: SearchIndex; filters_cleared: number };
  sort_apply: { search_index: SearchIndex; sort_value: string };
  load_more: { search_index: SearchIndex; items_loaded: number };
  select_content: { content_type: ContentType; content_id: string };

  // Marketplace
  copy_install_command: {
    item_id: string;
    item_name: string;
    registry?: string;
    version?: string;
  };
  template_preview: { item_id: string; item_name: string };
  repository_click: {
    item_id: string;
    item_type: ContentType;
    link_type: string;
    link_domain: string;
  };
  purchase_click: { item_id: string; item_type: ContentType; price?: number };
  contact_click: {
    profile_type: "member" | "organization";
    content_id: string;
  };
  share: { method: string; content_type: ContentType; item_id: string };
  edit_content_click: {
    content_type: ContentType;
    content_id: string;
    owner_type: OwnerType;
  };

  // Auth
  auth_gate_view: { gate_reason: string };
  sign_up_submit: { method: AuthMethod };
  sign_up: { method: AuthMethod };
  login: { method: AuthMethod; two_factor?: boolean };
  login_link_request: { method: AuthMethod };
  logout: { reason?: string };
  auth_error: { auth_step: string; error_code: string };
  verification_email_resend: { success: boolean };
  password_reset_request: NoParams;
  password_reset_complete: NoParams;

  // Account
  profile_update: { profile_type: string; fields_changed?: string };
  security_update: { security_action: string; provider?: string };
  account_delete: NoParams;
  org_create: { org_id: string };
  org_invite_send: { org_id: string; member_role: string };
  org_member_update: { org_id: string; member_action: string };
  org_update: { org_id: string; org_action: string };
  join_group: { group_id: string; member_role?: string };
  invitation_reject: { group_id: string };

  // Submissions
  form_start: { form_name: FormName; first_field?: string };
  form_error: {
    form_name: FormName;
    error_type: string;
    error_fields?: string;
    error_count?: number;
    http_status?: number;
  };
  submission_created: {
    content_type: "package" | "template";
    submission_id: string;
    owner_type: OwnerType;
    package_type?: string;
    category_count?: number;
    readme_auto_sync?: boolean;
    has_logo?: boolean;
  };
  submission_update: {
    content_type: "package" | "template";
    submission_id: string;
    fields_changed?: string;
  };
  submission_delete: {
    content_type: "package" | "template";
    submission_id: string;
  };

  // Partner portal
  partner_resource_open: {
    resource_id: string;
    resource_section?: string;
    resource_category?: string;
    open_type: string;
    minimum_level?: string;
  };
  partner_access_denied: { org_slug: string; gate_reason: string };
  partner_coming_soon_view: { feature_name: string };

  // Roadmap
  roadmap_item_open: {
    roadmap_item_id: string;
    roadmap_status?: string;
    release?: string;
    open_source?: string;
  };
  roadmap_vote_click: {
    roadmap_item_id: string;
    roadmap_status?: string;
    canny_votes?: number;
    click_location: string;
  };
  roadmap_view_change: { roadmap_view: string };
};

export type EventName = keyof EventMap;

/** Parameters every event carries, set once and merged in by `track()`. */
export type GlobalParams = {
  logged_in?: boolean;
  app_env: string;
  app_version?: string;
};

type ParamsOf<T> = T extends unknown ? keyof T : never;
type ParamKey =
  | ParamsOf<EventMap[EventName]>
  | ParamsOf<PageContextParams>
  | "item_list_id"
  | "item_list_name";

/**
 * Every parameter name any event uses. `track()` sets the ones an event
 * doesn't use to `undefined`, so GTM's data model never carries a stale value
 * from the previous push into this one. The `satisfies` check fails type
 * checking when an event above gains a parameter that isn't listed here.
 */
export const PARAM_KEYS = [
  "page_location",
  "page_path",
  "page_title",
  "page_type",
  "content_id",
  "content_name",
  "content_category",
  "owner_type",
  "settings_tab",
  "portal_section",
  "nav_area",
  "nav_section",
  "link_text",
  "link_url",
  "menu_name",
  "cta_location",
  "cta_id",
  "cta_text",
  "link_type",
  "link_domain",
  "item_id",
  "item_type",
  "item_name",
  "item_list_id",
  "item_list_name",
  "tab_group",
  "tab_name",
  "section_id",
  "section_label",
  "faq_id",
  "faq_action",
  "error_code",
  "error_digest",
  "search_term",
  "search_index",
  "search_location",
  "results_count",
  "filter_name",
  "filter_value",
  "filter_action",
  "filters_cleared",
  "sort_value",
  "items_loaded",
  "content_type",
  "registry",
  "version",
  "price",
  "profile_type",
  "method",
  "gate_reason",
  "two_factor",
  "reason",
  "auth_step",
  "success",
  "fields_changed",
  "security_action",
  "provider",
  "org_id",
  "member_role",
  "member_action",
  "org_action",
  "group_id",
  "form_name",
  "first_field",
  "error_type",
  "error_fields",
  "error_count",
  "http_status",
  "submission_id",
  "package_type",
  "category_count",
  "readme_auto_sync",
  "has_logo",
  "resource_id",
  "resource_section",
  "resource_category",
  "open_type",
  "minimum_level",
  "org_slug",
  "feature_name",
  "roadmap_item_id",
  "roadmap_status",
  "release",
  "open_source",
  "canny_votes",
  "click_location",
  "roadmap_view",
] as const satisfies readonly ParamKey[];

// Fails type checking when a parameter is used by an event but missing above.
type MissingParamKeys = Exclude<ParamKey, (typeof PARAM_KEYS)[number]>;
const assertAllParamKeysListed: [MissingParamKeys] extends [never]
  ? true
  : MissingParamKeys = true;
void assertAllParamKeysListed;
