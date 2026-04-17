import type { StrapiApp } from "@strapi/strapi/admin";
import { Route, Routes } from "react-router-dom";
import { SubmissionDetail } from "./pages/SubmissionDetail";
import { SubmissionList } from "./pages/SubmissionList";

// Simple shield icon for the menu
const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="1em"
    height="1em"
    aria-label="Moderation plugin"
  >
    <title>Moderation plugin</title>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: "/plugins/moderation",
      icon: ShieldIcon,
      intlLabel: {
        id: "moderation.label",
        defaultMessage: "Moderation",
      },
      Component: () =>
        Promise.resolve({
          default: () => (
            <Routes>
              <Route index element={<SubmissionList />} />
              <Route
                path="submissions/:documentId"
                element={<SubmissionDetail />}
              />
            </Routes>
          ),
        }),
    });
  },
};
