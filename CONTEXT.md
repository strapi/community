# Strapi Community Hub — Domain Glossary

## Submission
A request from a community member to add a Package or Template to the marketplace. Submitted through the public web form. Creates a draft Package or Template record directly in Strapi with `overall_status: submitted`.

## Package
A Strapi ecosystem artefact (plugin, provider, SDK, or tool) listed in the marketplace. Stored as `api::package.package`. Uses Strapi v5 Draft & Publish — draft = under review or rejected, published = live in the marketplace. Carries both catalogue fields (name, description, etc.) and moderation fields (overall_status, review statuses, scan results) on the same record.

## Template
A starter project listed in the marketplace. Stored as `api::template.template`. Follows the same Draft & Publish + moderation-fields pattern as Package.

## Package Review / Template Review
The moderation workflow applied to a draft Package or Template. Tracked via fields on the Package/Template record itself (not a separate content type). Comprises two independent tracks: business review and security review.

## Business Review
One of two review tracks. Stored as `plugin::moderation.business-review` (one-to-one with Package/Template). Tracks automated check results and the overall business decision: `pending`, `approved`, `rejected`, or `changes_requested`.

## Security Review
One of two review tracks. Stored as `plugin::moderation.security-review` (one-to-many with Package — each scan run is a new record; latest by `createdAt` is current). Tracks scan lifecycle (`pending`, `running`, `completed`, `failed`) and per-stage results (`dependencies`, `ai_analysis`, `summary`). Templates do not currently have security reviews.

## Moderation Queue
The set of draft Packages or Templates where `overall_status` (on Package/Template) is one of `submitted`, `under_review`, or `changes_requested`. Excludes admin-created drafts (which have no `overall_status`). Queue filtering still uses `overall_status` on the Package/Template record, not on the review content types.

## Promotion
Deprecated term. Previously referred to copying data from a `plugin-submission` record to a `Package` record. Replaced by publishing the draft Package/Template directly via Strapi's Document Service API.

## overall_status
An enum field on Package and Template that tracks where a record sits in the moderation lifecycle: `submitted → under_review → changes_requested | rejected | approved`. Set to `submitted` on creation via the public submission route. Null on admin-created drafts. Persists on published records.
