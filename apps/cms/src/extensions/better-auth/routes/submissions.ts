const PACKAGE_OWNER_POLICY = {
  name: "plugin::better-auth.is-content-owner",
  config: { uid: "api::package.package" },
};

const TEMPLATE_OWNER_POLICY = {
  name: "plugin::better-auth.is-content-owner",
  config: { uid: "api::template.template" },
};

export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/users/me/submissions",
        handler: "submissions.mine",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        // Any member of the org can *see* its submissions (read-only) —
        // only an owner/admin can actually edit one, which the controller
        // itself tags per-item as `isOwner`, and the write routes below
        // enforce separately via `is-content-owner`.
        method: "GET",
        path: "/organizations/:id/submissions",
        handler: "submissions.organizationMine",
        config: {
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            "plugin::better-auth.is-organization-member",
          ],
          middlewares: [],
          prefix: "",
        },
      },
      {
        // Not nested under `/users/` — that prefix already has a public
        // `GET /users/:id` route, and this must not depend on route
        // registration order to avoid `:id` swallowing "by-slug" first.
        method: "GET",
        path: "/user-by-slug",
        handler: "submissions.findUserBySlug",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        // Same not-nested-under-`/organizations/` reasoning as above.
        method: "GET",
        path: "/organization-by-slug",
        handler: "submissions.findOrganizationBySlug",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        // Read side of the edit form — deliberately gated by
        // `is-authenticated` only, not `is-content-owner`: a maintainer
        // (not just the owner) can view a submission read-only. The
        // controller itself enforces owner-or-maintainer visibility and
        // tags the response with `isOwner`.
        method: "GET",
        path: "/packages/:documentId/submission",
        handler: "submissions.getPackage",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/templates/:documentId/submission",
        handler: "submissions.getTemplate",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        // Backs the "Edit" button on the public package page — gated by
        // `is-authenticated` only (not `is-content-owner`): the caller is
        // asking "can I edit this?", not attempting to edit it, so it
        // must return an answer (`{ canEdit: false }`) rather than 403 for
        // a logged-in non-owner.
        method: "GET",
        path: "/packages/:documentId/can-edit",
        handler: "submissions.canEditPackage",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "GET",
        path: "/templates/:documentId/can-edit",
        handler: "submissions.canEditTemplate",
        config: {
          auth: false,
          policies: ["plugin::better-auth.is-authenticated"],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "POST",
        path: "/packages/:documentId/icon",
        handler: "submissions.uploadPackageIcon",
        config: {
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            PACKAGE_OWNER_POLICY,
          ],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "POST",
        path: "/templates/:documentId/preview-image",
        handler: "submissions.uploadTemplatePreviewImage",
        config: {
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            TEMPLATE_OWNER_POLICY,
          ],
          middlewares: [],
          prefix: "",
        },
      },
      // Ownership transfer — temporarily disabled (route removed, not just
      // gated) pending a consent flow for the destination owner. As it
      // stands, `transferOwnership` (see services/submissions.ts) accepts
      // any `ownerDocumentId`/`ownerType` the caller supplies with no check
      // that the destination user/org agreed to it, and — since this is a
      // `POST` route with no CSRF token, only a cookie-based session — that
      // was reachable via a forged cross-site form submission, not just a
      // deliberate call. `transferPackage`/`transferTemplate` (controller),
      // `transferOwnership` (service), and the `OwnerPicker`/`transferSubmission`
      // front-end code are left in place; re-add these two route entries
      // once destination consent is implemented.
      // {
      //   method: "POST",
      //   path: "/packages/:documentId/transfer",
      //   handler: "submissions.transferPackage",
      //   config: {
      //     auth: false,
      //     policies: [
      //       "plugin::better-auth.is-authenticated",
      //       PACKAGE_OWNER_POLICY,
      //     ],
      //     middlewares: [],
      //     prefix: "",
      //   },
      // },
      // {
      //   method: "POST",
      //   path: "/templates/:documentId/transfer",
      //   handler: "submissions.transferTemplate",
      //   config: {
      //     auth: false,
      //     policies: [
      //       "plugin::better-auth.is-authenticated",
      //       TEMPLATE_OWNER_POLICY,
      //     ],
      //     middlewares: [],
      //     prefix: "",
      //   },
      // },
      {
        method: "DELETE",
        path: "/packages/:documentId/submission",
        handler: "submissions.deletePackage",
        config: {
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            PACKAGE_OWNER_POLICY,
          ],
          middlewares: [],
          prefix: "",
        },
      },
      {
        method: "DELETE",
        path: "/templates/:documentId/submission",
        handler: "submissions.deleteTemplate",
        config: {
          auth: false,
          policies: [
            "plugin::better-auth.is-authenticated",
            TEMPLATE_OWNER_POLICY,
          ],
          middlewares: [],
          prefix: "",
        },
      },
    ],
  },
};
