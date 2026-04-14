import type { StrapiApp } from "@strapi/strapi/admin";
import { OwnerPanel, SUPPORTED } from "./components/OwnerPanel";

export default {
  register(app: StrapiApp) {
    // @ts-expect-error - StrapiApp type is missing the getPlugin method
    app.getPlugin("content-manager").apis.addEditViewSidePanel([
      (props: { model: string; documentId: string }) => {
        if (!SUPPORTED.includes(props.model) || !props.documentId) return null;

        return {
          title: "Owner",
          content: (
            <OwnerPanel model={props.model} documentId={props.documentId} />
          ),
        };
      },
    ]);
  },
};
