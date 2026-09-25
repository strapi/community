# ADR 0003 — Profile links are a repeatable component of `{ type, value }`

**Date:** 2026-09-25
**Status:** Accepted

## Context

`api::profile.profile` (shared by user and organization profiles) has two fixed link fields,
`website` and `github`, each holding a full URL. Members want to list more places they can be
found (LinkedIn, X, YouTube, …), and adding one string field per network does not scale — every
new network would mean a schema change, a new form input and new rendering code.

## Decision

A repeatable component `profile.link` is added to `api::profile.profile` as `links` (max 10):

- `type` — enumeration: `website`, `github`, `linkedin`, `x`, `instagram`, `youtube`, `linktree`,
  `other`.
- `value` — string. For social types it is **only the handle** (e.g. `octocat`); the public URL is
  built at render time from a fixed per-type prefix (e.g. `github.com/`). For `website` and
  `other` it is a full `http(s)://` URL.

Duplicate types are allowed (e.g. two websites). Order is the order the member added them in.

Per-type format rules are enforced in the web app's profile form and, as a backstop, in the
better-auth profile endpoints (`utils/profile-links.ts`), following the existing split for
`validateProfileData`. The type enum and the max count also live on the component schema, so
Strapi enforces them on every write path.

The legacy `website` and `github` fields stay in place until existing values have been migrated
into `links` by a one-off data migration (`src/migration/`, behind `ENABLE_MIGRATION`), after
which they are removed in a follow-up.

## Consequences

- Supporting a new network means adding an enum value and a prefix/pattern entry — no new field.
- Storing handles rather than URLs means a network changing its URL scheme (e.g. twitter.com →
  x.com) is a one-line prefix change, with no data rewrite.
- Every read of a profile that needs links must populate `links` explicitly (component fields are
  not populated by default).
- The type list and format rules are duplicated between the CMS and the web app. Accepted, as for
  the other profile validation rules; both files point at each other.
