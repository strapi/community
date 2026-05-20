**Status:** Superseded by ADR 0002

# ADR 0001 — Moderation fields live on Package/Template, not a separate content type

**Date:** 2026-05-19
**Status:** Accepted

## Context

The initial implementation (PR #55) introduced a separate `plugin::moderation.plugin-submission` content type to hold incoming submission data during moderation. On approval, data was copied ("promoted") from the submission record to the live `api::package.package` record.

The maintainer (@boazpoolman) challenged this as a violation of single-source-of-truth: package data was duplicated across two content types, and fields like `package_location` could diverge if updated on the live Package after promotion.

## Decision

Moderation fields are added directly to `api::package.package` and `api::template.template`. The submission flow creates a **draft** Package/Template record via Strapi v5's native Draft & Publish. Approval is a publish operation — no data copy. The separate `plugin-submission` and `template-submission` content types in the moderation plugin are eliminated.

Moderation-only fields (`overall_status`, `business_review_status`, `security_review_status`, `reviewer_feedback`, `rejection_reason`, `business_review_notes`, `security_review_notes`, `automated_check_results`, `security_scan_*`, `submitter_ip`, `submitter_agreed_to_terms`, `submission_notes`) are added to both schemas. They persist on published records as an audit trail.

The moderation plugin retains its admin UI, routes, controllers, and services but owns no content types of its own. All queries target `api::package.package` or `api::template.template` directly.

## Consequences

- **No data duplication.** Package/Template is the single source of truth from submission through publication.
- **Approval = publish.** No bespoke "promote" logic needed.
- **Moderation fields pollute the Package schema.** Every published Package carries ~17 moderation fields, most null after a direct admin creation. Accepted trade-off.
- **Draft disambiguation required.** Admin-created drafts (no `overall_status`) must be distinguished from submission-created drafts (`overall_status` present). The moderation queue filters on `overall_status IN ['submitted', 'under_review', 'changes_requested']`.
- **Rejected submissions are orphaned drafts.** They remain in Strapi as draft Packages with `overall_status: rejected`. This is intentional — it provides an audit trail and avoids data loss.
