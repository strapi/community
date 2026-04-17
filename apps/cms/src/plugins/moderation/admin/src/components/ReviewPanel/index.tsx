import {
  Box,
  Button,
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Textarea,
  Typography,
} from "@strapi/design-system";
import { ChevronDown } from "@strapi/icons";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useState } from "react";
import { useMutation } from "react-query";

interface Props {
  documentId: string;
  initialBusinessStatus: "pending" | "approved" | "rejected";
  initialSecurityStatus: "pending" | "approved" | "rejected";
  initialOverallStatus: string;
  initialFeedback?: string;
  initialRejectionReason?: string;
  initialBusinessNotes?: string;
  initialSecurityNotes?: string;
  onSaved: () => void;
}

type ReviewStatus = "pending" | "approved" | "rejected";

const REVIEW_STYLES: Record<
  ReviewStatus,
  { bg: string; text: string; dot: string }
> = {
  pending: { bg: "neutral150", text: "neutral600", dot: "#c0c0c0" },
  approved: { bg: "success100", text: "success600", dot: "#27ae60" },
  rejected: { bg: "danger100", text: "danger600", dot: "#e74c3c" },
};

const StatusPill = ({ status }: { status: ReviewStatus }) => {
  const s = REVIEW_STYLES[status];
  return (
    <Box
      background={s.bg}
      hasRadius
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
    >
      <Flex gap={1} alignItems="center">
        <Box
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: s.dot,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="pi"
          fontWeight="semiBold"
          textColor={s.text}
          style={{ textTransform: "capitalize" }}
        >
          {status}
        </Typography>
      </Flex>
    </Box>
  );
};

export const ReviewPanel = ({
  documentId,
  initialBusinessStatus,
  initialSecurityStatus,
  initialOverallStatus,
  initialFeedback,
  initialRejectionReason,
  initialBusinessNotes,
  initialSecurityNotes,
  onSaved,
}: Props) => {
  const { put, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [businessStatus, setBusinessStatus] = useState<ReviewStatus>(
    initialBusinessStatus,
  );
  const [securityStatus, setSecurityStatus] = useState<ReviewStatus>(
    initialSecurityStatus,
  );
  const [businessNotes, setBusinessNotes] = useState(
    initialBusinessNotes || "",
  );
  const [securityNotes, setSecurityNotes] = useState(
    initialSecurityNotes || "",
  );
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [rejectionReason, setRejectionReason] = useState(
    initialRejectionReason || "",
  );
  const [openSection, setOpenSection] = useState<
    "business" | "security" | null
  >(null);

  const toggleSection = (section: "business" | "security") =>
    setOpenSection((prev) => (prev === section ? null : section));

  const bothApproved =
    businessStatus === "approved" && securityStatus === "approved";
  const isAlreadyApproved = initialOverallStatus === "approved";
  const isAlreadyRejected = initialOverallStatus === "rejected";
  const isLocked = isAlreadyApproved || isAlreadyRejected;

  const { mutate: saveReview, isLoading: saving } = useMutation(
    async () => {
      await put(`/moderation/submissions/${documentId}/review`, {
        data: {
          business_review_status: businessStatus,
          security_review_status: securityStatus,
          business_review_notes: businessNotes,
          security_review_notes: securityNotes,
          reviewer_feedback: feedback,
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
      await put(`/moderation/submissions/${documentId}/review`, {
        data: {
          business_review_status: businessStatus,
          security_review_status: securityStatus,
          business_review_notes: businessNotes,
          security_review_notes: securityNotes,
          overall_status: "approved",
        },
      });
    },
    {
      onSuccess() {
        toggleNotification({
          type: "success",
          message: "Submission approved.",
        });
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

  const { mutate: promote, isLoading: promoting } = useMutation(
    async () => {
      await post(`/moderation/submissions/${documentId}/promote`, {});
    },
    {
      onSuccess() {
        toggleNotification({
          type: "success",
          message: "Package entry created. Open Content Manager to publish.",
        });
        onSaved();
      },
      onError(err: unknown) {
        toggleNotification({
          type: "danger",
          message: err instanceof Error ? err.message : "Promotion failed.",
        });
      },
    },
  );

  const { mutate: reject, isLoading: rejecting } = useMutation(
    async () => {
      await post(`/moderation/submissions/${documentId}/decide`, {
        data: { status: "rejected", reason: rejectionReason, feedback },
      });
    },
    {
      onSuccess() {
        toggleNotification({
          type: "success",
          message: "Submission rejected.",
        });
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

  const { mutate: requestChanges, isLoading: requesting } = useMutation(
    async () => {
      await post(`/moderation/submissions/${documentId}/decide`, {
        data: { status: "changes_requested", feedback },
      });
    },
    {
      onSuccess() {
        toggleNotification({ type: "success", message: "Changes requested." });
        onSaved();
      },
      onError(err: unknown) {
        toggleNotification({
          type: "danger",
          message:
            err instanceof Error ? err.message : "Failed to request changes.",
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
              onClick={() => saveReview()}
              loading={saving}
              style={{ whiteSpace: "nowrap" }}
            >
              Save Draft
            </Button>
          )}
        </Flex>
      </Box>

      {/* Business Review — accordion */}
      <Box borderColor="neutral150" borderWidth="0 0 1px 0" borderStyle="solid">
        <button
          type="button"
          onClick={() => toggleSection("business")}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            paddingLeft={6}
            paddingRight={6}
            paddingTop={5}
            paddingBottom={5}
          >
            <Flex gap={3} alignItems="center">
              <Typography
                variant="omega"
                fontWeight="semiBold"
                textColor="neutral800"
              >
                Business Review
              </Typography>
              <StatusPill status={businessStatus} />
            </Flex>
            <Box
              style={{
                color: "#8e8ea9",
                display: "flex",
                transform:
                  openSection === "business"
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                transition: "transform 0.15s ease",
              }}
            >
              <ChevronDown aria-hidden />
            </Box>
          </Flex>
        </button>

        {openSection === "business" && (
          <Box
            paddingLeft={6}
            paddingRight={6}
            paddingBottom={5}
            borderColor="neutral100"
            borderWidth="1px 0 0 0"
            borderStyle="solid"
            background="neutral50"
          >
            <Box paddingTop={4}>
              <Flex direction="column" alignItems="stretch" gap={4}>
                <Field.Root name="businessReview" style={{ width: "100%" }}>
                  <Field.Label>Status</Field.Label>
                  <SingleSelect
                    value={businessStatus}
                    onChange={(val) => setBusinessStatus(val as ReviewStatus)}
                    disabled={isLocked}
                  >
                    <SingleSelectOption value="pending">
                      Pending
                    </SingleSelectOption>
                    <SingleSelectOption value="approved">
                      Approved
                    </SingleSelectOption>
                    <SingleSelectOption value="rejected">
                      Rejected
                    </SingleSelectOption>
                  </SingleSelect>
                </Field.Root>

                <Field.Root name="businessNotes" style={{ width: "100%" }}>
                  <Field.Label>Internal Notes</Field.Label>
                  <Textarea
                    value={businessNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setBusinessNotes(e.target.value)
                    }
                    placeholder="Internal notes for the business review track…"
                    disabled={isLocked}
                  />
                </Field.Root>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>

      {/* Security Review — accordion */}
      <Box borderColor="neutral150" borderWidth="0 0 1px 0" borderStyle="solid">
        <button
          type="button"
          onClick={() => toggleSection("security")}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            paddingLeft={6}
            paddingRight={6}
            paddingTop={5}
            paddingBottom={5}
          >
            <Flex gap={3} alignItems="center">
              <Typography
                variant="omega"
                fontWeight="semiBold"
                textColor="neutral800"
              >
                Security Review
              </Typography>
              <StatusPill status={securityStatus} />
            </Flex>
            <Box
              style={{
                color: "#8e8ea9",
                display: "flex",
                transform:
                  openSection === "security"
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                transition: "transform 0.15s ease",
              }}
            >
              <ChevronDown aria-hidden />
            </Box>
          </Flex>
        </button>

        {openSection === "security" && (
          <Box
            paddingLeft={6}
            paddingRight={6}
            paddingBottom={5}
            borderColor="neutral100"
            borderWidth="1px 0 0 0"
            borderStyle="solid"
            background="neutral50"
          >
            <Box paddingTop={4}>
              <Flex direction="column" alignItems="stretch" gap={4}>
                <Field.Root name="securityReview" style={{ width: "100%" }}>
                  <Field.Label>Status</Field.Label>
                  <SingleSelect
                    value={securityStatus}
                    onChange={(val) => setSecurityStatus(val as ReviewStatus)}
                    disabled={isLocked}
                  >
                    <SingleSelectOption value="pending">
                      Pending
                    </SingleSelectOption>
                    <SingleSelectOption value="approved">
                      Approved
                    </SingleSelectOption>
                    <SingleSelectOption value="rejected">
                      Rejected
                    </SingleSelectOption>
                  </SingleSelect>
                </Field.Root>

                <Field.Root name="securityNotes" style={{ width: "100%" }}>
                  <Field.Label>Internal Notes</Field.Label>
                  <Textarea
                    value={securityNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setSecurityNotes(e.target.value)
                    }
                    placeholder="Internal notes for the security review track…"
                    disabled={isLocked}
                  />
                </Field.Root>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>

      {/* Feedback */}
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
          {/* Feedback — shown while actively reviewing */}
          {!isAlreadyApproved && (
            <Field.Root name="feedback" style={{ width: "100%" }}>
              <Field.Label>Feedback to Submitter</Field.Label>
              <Field.Hint>
                Shown to the submitter if changes are requested
              </Field.Hint>
              <Textarea
                value={feedback}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFeedback(e.target.value)
                }
                placeholder="Describe what changes are needed…"
                disabled={isAlreadyRejected}
              />
            </Field.Root>
          )}

          {/* Rejection reason — only when a track is rejected */}
          {(businessStatus === "rejected" ||
            securityStatus === "rejected" ||
            isAlreadyRejected) && (
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
                disabled={isAlreadyRejected}
              />
            </Field.Root>
          )}
        </Flex>
      </Box>

      {/* Actions */}
      <Box paddingLeft={6} paddingRight={6} paddingTop={5} paddingBottom={5}>
        {isAlreadyApproved ? (
          <Flex direction="column" alignItems="stretch" gap={3}>
            <Box background="success100" padding={3} hasRadius>
              <Typography
                variant="pi"
                fontWeight="semiBold"
                textColor="success700"
              >
                This submission has been approved.
              </Typography>
            </Box>
            <Button
              variant="default"
              onClick={() => promote()}
              loading={promoting}
              fullWidth
            >
              Promote to Package
            </Button>
          </Flex>
        ) : isAlreadyRejected ? (
          <Box background="danger100" padding={3} hasRadius>
            <Typography
              variant="pi"
              fontWeight="semiBold"
              textColor="danger700"
            >
              This submission has been rejected.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Decision buttons — two rows to avoid squashing */}
            <Flex direction="column" alignItems="stretch" gap={3}>
              <Flex gap={2} justifyContent="flex-end">
                <Button
                  variant="secondary"
                  onClick={() => requestChanges()}
                  loading={requesting}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Request Changes
                </Button>
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
                  disabled={!bothApproved}
                  title={
                    bothApproved
                      ? undefined
                      : "Both review tracks must be approved first"
                  }
                  style={{ whiteSpace: "nowrap" }}
                >
                  Approve
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
};
