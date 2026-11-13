import {
  adminClient,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: `${process.env.NEXT_PUBLIC_CMS_URL}/api/auth`,
    // `adminClient()` exposes `authClient.admin.impersonateUser({ userId })`
    // and `authClient.admin.stopImpersonating()` (plus the other admin
    // actions) against the server-side `admin()` plugin in the CMS.
    plugins: [
      organizationClient(),
      twoFactorClient(),
      magicLinkClient(),
      adminClient(),
    ],
  },
);
