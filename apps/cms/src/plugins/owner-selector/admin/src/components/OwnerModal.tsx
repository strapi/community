import {
  Button,
  Divider,
  Field,
  Flex,
  Modal,
  Radio,
  SingleSelect,
  SingleSelectOption,
} from "@strapi/design-system";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

export type OwnerType =
  | "plugin::better-auth.user"
  | "plugin::better-auth.organization";

export interface SelectableItem {
  documentId: string;
  name: string;
  email?: string;
  slug?: string;
}

export interface CurrentOwner {
  documentId: string;
  __type: OwnerType;
}

interface Props {
  contentType: string;
  documentId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const OwnerModal = ({
  contentType,
  documentId,
  onClose,
  onSaved,
}: Props) => {
  const { get, put } = useFetchClient();
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();

  const [ownerType, setOwnerType] = useState<OwnerType>(
    "plugin::better-auth.user",
  );
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: users = [] } = useQuery<SelectableItem[]>("users", async () => {
    const res = await get("/owner-selector/users");
    return res.data.data ?? [];
  });

  const { data: orgs = [] } = useQuery<SelectableItem[]>(
    "organizations",
    async () => {
      const res = await get("/owner-selector/organizations");
      return res.data.data ?? [];
    },
  );

  const { mutate: save, isLoading: saving } = useMutation(
    async () => {
      await put("/owner-selector/owner", {
        data: {
          contentType,
          documentId,
          ownerDocumentId: selectedId || null,
          ownerType,
        },
      });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["users", "organizations", "owner"]);
        toggleNotification({ type: "success", message: "Owner saved" });
        onSaved();
        onClose();
      },
      onError() {
        toggleNotification({
          type: "danger",
          message: "Failed to save owner",
        });
      },
    },
  );

  const items = ownerType === "plugin::better-auth.user" ? users : orgs;

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Edit Owner</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Flex direction="column" gap={6} width="100%" alignItems="stretch">
            <Field.Root name="ownerType">
              <Field.Label>Owner type</Field.Label>
              <Flex gap={4} paddingTop={2}>
                <Radio.Group
                  value={ownerType}
                  onValueChange={(value) => setOwnerType(value as OwnerType)}
                >
                  <Radio.Item value="plugin::better-auth.user">User</Radio.Item>
                  <Radio.Item value="plugin::better-auth.organization">
                    Organization
                  </Radio.Item>
                </Radio.Group>
              </Flex>
            </Field.Root>

            <Divider />

            <Field.Root name="owner">
              <Field.Label>
                {ownerType === "plugin::better-auth.user"
                  ? "Select user"
                  : "Select organization"}
              </Field.Label>
              <SingleSelect
                placeholder="None"
                value={selectedId}
                onChange={(val) => setSelectedId(val as string)}
              >
                {items.map((item) => (
                  <SingleSelectOption
                    key={item.documentId}
                    value={item.documentId}
                  >
                    {item.name}
                    {item.email ? ` (${item.email})` : ""}
                    {item.slug ? ` @${item.slug}` : ""}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Field.Root>
          </Flex>
        </Modal.Body>

        <Modal.Footer>
          <Flex gap={2} justifyContent="flex-end">
            <Button variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => save()} loading={saving}>
              Save
            </Button>
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
