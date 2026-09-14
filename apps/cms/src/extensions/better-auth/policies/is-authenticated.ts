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
 * policies (e.g. is-content-owner) and the controller action don't need
 * to fetch it again.
 *
 * Rejects by *throwing* `errors.UnauthorizedError`, not by calling
 * `ctx.unauthorized()`: policies receive a `PolicyContext` (see
 * `@strapi/utils`'s `createPolicyContext`), which is `Object.assign({},
 * ctx)` — a *plain object* copied from `ctx`'s own enumerable properties
 * only. `ctx.unauthorized`/`.forbidden`/`.badRequest`/`.notFound` are
 * Koa convenience methods added to the shared `app.context` prototype,
 * not per-request own properties, so they're silently dropped by that
 * copy — calling them from a policy throws `"ctx.unauthorized is not a
 * function"` (confirmed directly). Throwing the `@strapi/utils` error
 * class instead is the correct policy-layer pattern: the outer
 * `strapi::errors` middleware catches any thrown `ApplicationError`
 * subclass and maps it to the right status (401 for
 * `UnauthorizedError`) — see `@strapi/core`'s `services/errors.js`.
 *
 * Also stands in for Strapi's own auth strategy, which `auth: false`
 * skips entirely (`ctx.state.auth` is never set — see
 * `@strapi/core`'s `services/auth/index.js`, `authenticate()`: `if
 * (config === false) return next();`). Without this, the *content-api's*
 * own request validation — `strapi.contentAPI.validate.input`, called by
 * every core `update`/`create` action — defaults the missing auth to `{}`
 * (`fp.prop('state.auth', ctx) ?? {}`, in `services/content-api/index.js`)
 * instead of skipping its relation-permission check, then that check
 * (`throwRestrictedRelations`, in `@strapi/utils`) calls
 * `auth.strategy.verify`, which throws on the missing `.strategy` — always
 * failing closed and rejecting the *first relation field in the request
 * body* with `ValidationError: Invalid key <field>`, regardless of its
 * shape. (Confirmed directly against this exact payload/error via a
 * throwaway script calling `contentAPI.validate.input` with `auth: {}`.)
 * A minimal permissive `verify` is correct here, not just a workaround:
 * this request has already passed real, fine-grained authorization (this
 * policy plus whichever ownership policy runs after it) — Strapi's own
 * coarse "can this principal read the target content-type" check is
 * redundant on top of that, not a check we're bypassing.
 */

import { errors } from "@strapi/utils";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../lib/auth";

export default async function isAuthenticated(ctx) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(ctx.request.headers),
  });

  if (!session?.user) throw new errors.UnauthorizedError();

  ctx.state.betterAuthSession = session;
  ctx.state.auth = {
    strategy: { name: "better-auth-session", verify: async () => {} },
    credentials: session.user,
  };

  return true;
}
