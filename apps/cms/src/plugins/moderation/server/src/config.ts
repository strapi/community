export interface ContentTypeWebhooks {
  submissionReceived?: string;
  approved?: string;
  declined?: string;
  changesRequested?: string;
}

export interface ModerationContentTypeConfig {
  uid: string;
  singularName: string;
  pluralName: string;
  /** Label shown in the admin UI tab */
  label?: string;
  /** UID of the category content type used to resolve categories_list strings */
  categoryUid?: string;
  /** Default entity field values set on every new submission */
  defaultFieldValues?: Record<string, unknown>;
  /**
   * Entity fields a submitter may set through the public submit endpoint.
   * Everything else in the request body is dropped — moderation-controlled
   * fields (labels, stars, relations, …) must never be listed here. Media
   * fields listed here only accept a freshly uploaded, unattached file.
   */
  submitFields: string[];
  /** IDs of automated checks to run at submission time */
  checks?: string[];
  /** n8n webhook paths fired for lifecycle events */
  webhooks?: ContentTypeWebhooks;
}

export interface ModerationPluginConfig {
  contentTypes: ModerationContentTypeConfig[];
}

export default {
  default: (): ModerationPluginConfig => ({
    contentTypes: [],
  }),

  validator(config: ModerationPluginConfig) {
    if (!Array.isArray(config.contentTypes)) {
      throw new Error("[moderation] config.contentTypes must be an array");
    }
    for (const ct of config.contentTypes) {
      if (!ct.uid) {
        throw new Error("[moderation] Each contentType entry must have a uid");
      }
      if (!ct.singularName) {
        throw new Error(
          `[moderation] contentType '${ct.uid}' must have a singularName`,
        );
      }
      if (!ct.pluralName) {
        throw new Error(
          `[moderation] contentType '${ct.uid}' must have a pluralName`,
        );
      }
      if (!Array.isArray(ct.submitFields)) {
        throw new Error(
          `[moderation] contentType '${ct.uid}' must have a submitFields array`,
        );
      }
    }
  },
};
