import {
  Box,
  Button,
  Flex,
  Link,
  Loader,
  TextButton,
  Typography,
} from "@strapi/design-system";
import { Pencil, Plus } from "@strapi/icons";
import {
  unstable_useDocument,
  useFetchClient,
  useNotification,
} from "@strapi/strapi/admin";
import { useState } from "react";
import { useQuery } from "react-query";
import { type CurrentOwner, OwnerModal, type OwnerType } from "./OwnerModal";

interface Props {
  model: string;
  documentId: string;
}

export const SUPPORTED = ["api::package.package", "api::template.template"];

export const OwnerPanel = ({ model, documentId }: Props) => {
  const [open, setOpen] = useState(false);
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [ownerType, setOwnerType] = useState<OwnerType>(
    "plugin::better-auth.user",
  );

  const [selectedId, setSelectedId] = useState<string>("");
  if (!SUPPORTED.includes(model) || !documentId) return null;

  const { isLoading } = useQuery<CurrentOwner>(
    "owner",
    async () => {
      const res = await get(
        `/owner-selector/owner?contentType=${model}&documentId=${documentId}`,
      );
      return res.data.data ?? null;
    },
    {
      onSuccess(current) {
        if (current) {
          setOwnerType(current.__type);
          setSelectedId(current.documentId);
        } else {
          setSelectedId("");
        }
      },
      onError() {
        toggleNotification({
          type: "danger",
          message: "Failed to load owner data",
        });
      },
    },
  );

  const { document } = unstable_useDocument({
    model: ownerType,
    collectionType: "collection-types",
    documentId: selectedId,
  });

  if (isLoading) {
    return (
      <Flex justifyContent="center">
        <Loader />
      </Flex>
    );
  }

  if (!selectedId) {
    return (
      <Box>
        <Button onClick={() => setOpen(true)} startIcon={<Plus />}>
          Set owner
        </Button>

        {open && (
          <OwnerModal
            contentType={model}
            documentId={documentId}
            onClose={() => setOpen(false)}
            onSaved={() => {}}
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box position="absolute" marginTop="-26px" right="20px">
        <TextButton onClick={() => setOpen(true)} startIcon={<Pencil />}>
          Edit
        </TextButton>
      </Box>

      {!document || isLoading ? (
        <Flex justifyContent="center">
          <Loader />
        </Flex>
      ) : (
        <Flex>
          <Typography>
            <Link
              href={`${window.strapi.backendURL}/admin/content-manager/collection-types/${ownerType}/${selectedId}`}
            >
              {document.name}
            </Link>
          </Typography>
        </Flex>
      )}

      {open && (
        <OwnerModal
          contentType={model}
          documentId={documentId}
          onClose={() => setOpen(false)}
          onSaved={() => {}}
        />
      )}
    </Box>
  );
};
