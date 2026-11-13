/**
 * impersonation controller
 */

import { fromNodeHeaders } from "better-auth/node";
import { hasOrganizationUpdatePermission } from "../utils";

export default {
  /**
   * GET /impersonation/allowed — whether the caller may impersonate, i.e. is
   * an owner/admin of `IMPERSONATION_ORGANIZATION_ID`. Backs only the
   * "Impersonate" button's visibility; the real enforcement is the admin
   * plugin's `adminUserIds`, derived from the same membership (see
   * `lib/auth.ts`). Keeping the check here keeps the org id server-side.
   * Behind `is-authenticated`, called from the browser with the better-auth
   * session cookie.
   */
  async allowed(ctx) {
    const organizationId = process.env.IMPERSONATION_ORGANIZATION_ID;
    if (!organizationId) {
      return { allowed: false };
    }

    return {
      allowed: await hasOrganizationUpdatePermission(
        fromNodeHeaders(ctx.request.headers),
        organizationId,
      ),
    };
  },
};
