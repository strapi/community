import {
  Box,
  Button,
  Field,
  Flex,
  Textarea,
  Typography,
} from "@strapi/design-system";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useState } from "react";
import { useMutation } from "react-query";

interface Props {
  documentId: string;
  initialStatus: "submitted" | "approved" | "rejected";
  initialFeedback?: string;
  initialNotes?: string;
  initialRejectionReason?: string;
  onSaved: () => void;
}

export const TemplateReviewPanel = ({
  documentId,
  initialStatus,
  initialFeedback,
  initialNotes,
  initialRejectionReason,
  onSaved,
}: Props) => {
  const { put, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [notes, setNotes] = useState(initialNotes || "");
  const [rejectionReason, setRejectionReason] = useState(
    initialRejectionReason || "",
  );

  const isApproved = initialStatus === "approved";
  const isRejected = initialStatus === "rejected";
  const isLocked = isApproved || isRejected;

  const { mutate: saveDraft, isLoading: saving } = useMutation(
    async () => {
      await put(`/moderation/template-submissions/${documentId}/review`, {
        data: {
          reviewer_feedback: feedback,
          reviewer_notes: notes,
          rejection_reason: rejectionReason,
        },
      });
    },
    {
      onSuccess() {
        toggleNotification({ type: "success", message: "Review saved." });
        onSaved();
      },
      onError(err: unknown) {
        toggleNotification({
          type: "danger",
          message:
            err instanceof Error ? err.message : "Failed to save review.",
        });
      },
    },
  );

  const { mutate: approve, isLoading: approving } = useMutation(
    async () => {
      await post(`/moderation/template-submissions/${documentId}/decide`, {
        data: {
          status: "approved",
          feedback,
          notes,
        },
      });
    },
    {
      onSuccess() {
        toggleNotification({ type: "success", message: "Template approved." });
        onSaved();
      },
      onError(err: unknown) {
        toggleNotification({
          type: "danger",
          message: err instanceof Error ? err.message : "Failed to approve.",
        });
      },
    },
  );

  const { mutate: reject, isLoading: rejecting } = useMutation(
    async () => {
      await post(`/moderation/template-submissions/${documentId}/decide`, {
        data: {
          status: "rejected",
          feedback,
          notes,
          reason: rejectionReason,
        },
      });
    },
    {
      onSuccess() {
        toggleNotification({ type: "success", message: "Template rejected." });
        onSaved();
      },
      onError(err: unknown) {
        toggleNotification({
          type: "danger",
          message: err instanceof Error ? err.message : "Failed to reject.",
        });
      },
    },
  );

  return (
    <Box
      background="neutral0"
      hasRadius
      borderColor="neutral200"
      borderWidth="1px"
      borderStyle="solid"
      overflow="hidden"
    >
      {/* Panel header */}
      <Box
        paddingLeft={6}
        paddingRight={6}
        paddingTop={5}
        paddingBottom={5}
        borderColor="neutral150"
        borderWidth="0 0 1px 0"
        borderStyle="solid"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="beta">Review Decision</Typography>
          {!isLocked && (
            <Button
              variant="tertiary"
              size="S"
              onClick={() => saveDraft()}
              loading={saving}
              style={{ whiteSpace: "nowrap" }}
            >
              Save Draft
            </Button>
          )}
        </Flex>
      </Box>

      {/* Review fields */}
      <Box
        paddingLeft={6}
        paddingRight={6}
        paddingTop={5}
        paddingBottom={5}
        borderColor="neutral150"
        borderWidth="0 0 1px 0"
        borderStyle="solid"
      >
        <Flex direction="column" alignItems="stretch" gap={4}>
          <Field.Root name="feedback" style={{ width: "100%" }}>
            <Field.Label>Feedback to Submitter</Field.Label>
            <Field.Hint>
              Sent to the submitter when a decision is made
            </Field.Hint>
            <Textarea
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFeedback(e.target.value)
              }
              placeholder="Describe your decision or any required changes…"
              disabled={isLocked}
            />
          </Field.Root>

          <Field.Root name="notes" style={{ width: "100%" }}>
            <Field.Label>Internal Notes</Field.Label>
            <Field.Hint>Internal only — not shown to the submitter</Field.Hint>
            <Textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              placeholder="Notes for the review team…"
              disabled={isLocked}
            />
          </Field.Root>

          {(isRejected || (!isApproved && rejectionReason !== undefined)) && (
            <Field.Root name="rejectionReason" style={{ width: "100%" }}>
              <Field.Label>Rejection Reason</Field.Label>
              <Field.Hint>
                Internal only — not shown to the submitter
              </Field.Hint>
              <Textarea
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Internal reason for rejection…"
                disabled={isLocked}
              />
            </Field.Root>
          )}
        </Flex>
      </Box>

      {/* Actions */}
      <Box paddingLeft={6} paddingRight={6} paddingTop={5} paddingBottom={5}>
        {isApproved ? (
          <Box background="success100" padding={3} hasRadius>
            <Typography
              variant="pi"
              fontWeight="semiBold"
              textColor="success700"
            >
              This template has been approved.
            </Typography>
          </Box>
        ) : isRejected ? (
          <Box background="danger100" padding={3} hasRadius>
            <Typography
              variant="pi"
              fontWeight="semiBold"
              textColor="danger700"
            >
              This template has been rejected.
            </Typography>
          </Box>
        ) : (
          <Flex gap={2} justifyContent="flex-end">
            <Button
              variant="danger"
              onClick={() => reject()}
              loading={rejecting}
              style={{ whiteSpace: "nowrap" }}
            >
              Reject
            </Button>
            <Button
              variant="success"
              onClick={() => approve()}
              loading={approving}
              style={{ whiteSpace: "nowrap" }}
            >
              Approve
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};
