# ADR 0002 — Review data lives in plugin-owned content types, not flat on Package/Template

**Date:** 2026-05-19
**Status:** Accepted
**Supersedes:** ADR 0001

## Context

ADR 0001 added 13 moderation fields directly to `api::package.package` and `api::template.template`.
The maintainer (@boazpoolman) identified that this approach does not scale: adding Showcase or Recipe
to the moderation process would require duplicating the same 13 fields on each content type.

## Decision

Two plugin-owned collection types are introduced:

- `plugin::moderation.business-review` — one-to-one with Package/Template. Tracks automated check
  results and business review decision (pending / approved / rejected / changes_requested).
- `plugin::moderation.security-review` — one-to-many with Package. Each scan run creates a new record;
  the latest by `createdAt` is the current scan. Carries scan lifecycle status (pending / running /
  completed / failed) and per-stage results (dependencies, ai_analysis, summary).

Package and Template now carry two relation fields (`business_review`, `security_reviews`) instead of
13 flat fields. The four submission-metadata fields (`overall_status`, `submitter_ip`,
`submitter_agreed_to_terms`, `submission_notes`) remain on Package/Template — they describe the
submission act, not a review decision.

D&P is disabled on both review types — they are internal moderation records.

## Consequences

- Adding Showcase or Recipe to the moderation process requires only adding `business_review` and
  `security_reviews` relation fields to those schemas — no new flat fields.
- The admin UI and services must populate relations rather than reading flat fields.
- n8n writes back to SecurityReview records via a back-relation query (SecurityReview has a `package`
  manyToOne field) rather than flat package fields.
- Business review is one-to-one (a package has one business review decision). Security review is
  one-to-many (a package may be scanned multiple times as it evolves).
