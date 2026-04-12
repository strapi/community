import { OwnerPanel, SUPPORTED } from "./components/OwnerPanel";

export default {
  register(app: any) {
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
