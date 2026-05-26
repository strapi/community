import type { StrapiTheme } from "@strapi/design-system";

declare module "styled-components" {
  export interface DefaultTheme extends StrapiTheme {}
}

export interface BrowserStrapi {
  backendURL: string;
  isEE: boolean;
  features: {
    SSO: "sso";
    AUDIT_LOGS: "audit-logs";
    REVIEW_WORKFLOWS: "review-workflows";
    isEnabled: (featureName?: string) => boolean;
  };
  isTrialLicense: boolean;
  flags: { promoteEE?: boolean; nps?: boolean };
  projectType: "Community" | "Enterprise";
  telemetryDisabled: boolean;
}

declare global {
  interface Window {
    strapi: BrowserStrapi;
  }
}
