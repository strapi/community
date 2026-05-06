import {
  emailOTPClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: `${process.env.NEXT_PUBLIC_CMS_URL}/api/auth`,
    plugins: [organizationClient(), twoFactorClient(), emailOTPClient()],
  },
);
