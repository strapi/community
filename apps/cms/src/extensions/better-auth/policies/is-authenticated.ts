/**
 * is-authenticated policy
 *
 * Requires a valid better-auth session (via cookie) for the current
 * request. This plugin's content-api routes carry no Strapi API token, so
 * routes relying on this policy must also set `config.auth = false` —
 * otherwise Strapi's own content-api-token check rejects the request
 * before this policy ever runs.
 *
 * On success, stashes the resolved session on `ctx.state` so downstream
 * policies (e.g. is-owner) and the controller action don't need to fetch
 * it again.
 */

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../lib/auth";

export default async function isAuthenticated(ctx) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(ctx.request.headers),
  });

  if (!session?.user) return ctx.unauthorized();

  ctx.state.betterAuthSession = session;

  return true;
}
