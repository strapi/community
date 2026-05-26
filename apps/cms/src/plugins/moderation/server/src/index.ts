import type { ModerationContentTypeConfig } from "./config";
import config from "./config";
import contentTypes from "./content-types";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";

const PACKAGE_UID = "api::package.package";
const BUSINESS_REVIEW_UID = "plugin::moderation.business-review";
const SECURITY_REVIEW_UID = "plugin::moderation.security-review";

const SUBMISSION_FIELDS: Record<string, object> = {
  overall_status: {
    type: "enumeration",
    enum: [
      "submitted",
      "under_review",
      "changes_requested",
      "rejected",
      "approved",
    ],
  },
  submitter_ip: { type: "string" },
  submitter_agreed_to_terms: { type: "boolean", default: false },
  submission_notes: { type: "text" },
};

export default {
  config,

  register({ strapi }) {
    const ctConfigs =
      (strapi
        .plugin("moderation")
        .config("contentTypes") as ModerationContentTypeConfig[]) ?? [];

    for (const ctConfig of ctConfigs) {
      const ct = strapi.contentType(ctConfig.uid);
      if (!ct) {
        strapi.log.warn(
          `[moderation] Content type '${ctConfig.uid}' not found — field injection skipped.`,
        );
        continue;
      }

      // Inject submission tracking fields if absent
      for (const [field, def] of Object.entries(SUBMISSION_FIELDS)) {
        if (!ct.attributes[field]) {
          ct.attributes[field] = def;
        }
      }

      // Inject unidirectional business_review relation if absent
      if (!ct.attributes.business_review) {
        ct.attributes.business_review = {
          type: "relation",
          relation: "oneToOne",
          target: BUSINESS_REVIEW_UID,
        };
      }

      // Security reviews are non-configurable — always injected for api::package.package
      if (ctConfig.uid === PACKAGE_UID && !ct.attributes.security_reviews) {
        ct.attributes.security_reviews = {
          type: "relation",
          relation: "oneToMany",
          target: SECURITY_REVIEW_UID,
          mappedBy: "package",
        };
      }

      strapi.log.info(`[moderation] Fields ready for '${ctConfig.uid}'`);
    }
  },

  bootstrap() {},

  contentTypes,
  controllers,
  services,
  routes,
};
