import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Typography,
} from "@strapi/design-system";
import { ArrowLeft, ExternalLink } from "@strapi/icons";
import type { Data } from "@strapi/strapi";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TemplateReviewPanel } from "../../components/TemplateReviewPanel";

// Inferred from generated types — no manual sync needed.
type TemplateSubmissionDetail = Data.ContentType<"api::template.template">;

// The populated shape returned by getSubmission — business_review is a relation.
interface BusinessReview {
  documentId: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  notes: string | null;
  reviewer_feedback: string | null;
  rejection_reason: string | null;
  automated_check_results: AutomatedChecks | null;
}

interface AutomatedCheckResult {
  passed: boolean | null;
  skipped?: boolean;
  message: string;
  detail?: unknown;
}

interface AutomatedChecks {
  runAt?: string;
  provider?: string;
  checks?: Record<string, AutomatedCheckResult>;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  submitted: { bg: "neutral150", color: "neutral700", label: "Submitted" },
  approved: { bg: "success100", color: "success700", label: "Approved" },
  rejected: { bg: "danger100", color: "danger700", label: "Rejected" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.submitted;
  return (
    <Box
      background={s.bg}
      hasRadius
      paddingLeft={3}
      paddingRight={3}
      style={{ display: "inline-flex", alignItems: "center", height: 24 }}
    >
      <Typography variant="pi" fontWeight="semiBold" textColor={s.color}>
        {s.label}
      </Typography>
    </Box>
  );
};

const CategoryPill = ({ label }: { label: string }) => (
  <Box
    background="primary100"
    hasRadius
    paddingLeft={2}
    paddingRight={2}
    style={{ display: "inline-flex", alignItems: "center", height: 20 }}
  >
    <Typography variant="pi" fontWeight="semiBold" textColor="primary600">
      {label}
    </Typography>
  </Box>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Flex gap={4} alignItems="flex-start" paddingTop={3} paddingBottom={3}>
    <Box style={{ width: 130, flexShrink: 0 }}>
      <Typography
        variant="pi"
        fontWeight="semiBold"
        textColor="neutral500"
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display: "block",
          textAlign: "left",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Box style={{ flex: 1, minWidth: 0 }}>
      {typeof value === "string" ? (
        <Typography
          textColor="neutral800"
          style={{
            wordBreak: "break-word",
            display: "block",
            textAlign: "left",
          }}
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Flex>
);

const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <Box
    background="neutral0"
    hasRadius
    borderColor="neutral200"
    borderWidth="1px"
    borderStyle="solid"
    overflow="hidden"
  >
    {title && (
      <Flex
        paddingLeft={5}
        paddingRight={5}
        paddingTop={4}
        paddingBottom={4}
        borderColor="neutral150"
        borderWidth="0 0 1px 0"
        borderStyle="solid"
      >
        <Typography
          variant="sigma"
          textColor="neutral600"
          style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {title}
        </Typography>
      </Flex>
    )}
    <Box padding={5}>{children}</Box>
  </Box>
);

export const TemplateSubmissionDetail = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [submission, setSubmission] = useState<TemplateSubmissionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await get(`/moderation/template-submissions/${documentId}`);
      setSubmission(res.data.data);
    } catch {
      toggleNotification({
        type: "danger",
        message: "Failed to load submission.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) load();
  }, [documentId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ height: 300 }}>
        <Loader />
      </Flex>
    );
  }

  if (!submission) {
    return (
      <Box padding={8}>
        <Typography textColor="neutral600">Submission not found.</Typography>
      </Box>
    );
  }

  return (
    <Box padding={8}>
      {/* Header */}
      <Flex alignItems="center" gap={3} marginBottom={1}>
        <Button
          variant="tertiary"
          startIcon={<ArrowLeft />}
          size="S"
          onClick={() => navigate("/plugins/moderation")}
        >
          Back
        </Button>
        <Box
          background="neutral200"
          style={{ width: 1, height: 20, flexShrink: 0 }}
        />
        {submission.logo_url && (
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e3e9ef",
              flexShrink: 0,
            }}
          >
            <img
              src={submission.logo_url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
        <Typography variant="alpha" style={{ lineHeight: 1 }}>
          {submission.template_name}
        </Typography>
        <StatusBadge status={submission.overall_status} />
      </Flex>

      {/* Submitted date */}
      <Box marginBottom={6} paddingLeft={1}>
        <Typography variant="pi" textColor="neutral400">
          Submitted{" "}
          {new Date(submission.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Typography>
      </Box>

      {/* Two-column layout */}
      <Flex gap={6} alignItems="flex-start">
        {/* Left column */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex direction="column" alignItems="flex-start" gap={4}>
            {/* Template Info */}
            <Box style={{ width: "100%" }}>
              <Card title="Template Info">
                <Box>
                  <InfoRow
                    label="Template Name"
                    value={submission.template_name}
                  />
                  <Divider />
                  <InfoRow
                    label="Repository URL"
                    value={
                      <a
                        href={submission.repository_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        <Flex as="span" gap={1} alignItems="flex-start">
                          <Typography
                            textColor="primary600"
                            style={{
                              wordBreak: "break-all",
                              display: "inline",
                              textAlign: "left",
                            }}
                          >
                            {submission.repository_url}
                          </Typography>
                          <Box style={{ flexShrink: 0, marginTop: 2 }}>
                            <ExternalLink
                              aria-hidden
                              style={{ width: 12, height: 12 }}
                            />
                          </Box>
                        </Flex>
                      </a>
                    }
                  />
                  {submission.demo_url && (
                    <>
                      <Divider />
                      <InfoRow
                        label="Demo URL"
                        value={
                          <a
                            href={submission.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            <Flex as="span" gap={1} alignItems="flex-start">
                              <Typography
                                textColor="primary600"
                                style={{
                                  wordBreak: "break-all",
                                  display: "inline",
                                  textAlign: "left",
                                }}
                              >
                                {submission.demo_url}
                              </Typography>
                              <Box style={{ flexShrink: 0, marginTop: 2 }}>
                                <ExternalLink
                                  aria-hidden
                                  style={{ width: 12, height: 12 }}
                                />
                              </Box>
                            </Flex>
                          </a>
                        }
                      />
                    </>
                  )}
                  {submission.categories_list?.length > 0 && (
                    <>
                      <Divider />
                      <InfoRow
                        label="Categories"
                        value={
                          <Flex gap={1} flexWrap="wrap">
                            {submission.categories_list.map((c) => (
                              <CategoryPill key={c} label={c} />
                            ))}
                          </Flex>
                        }
                      />
                    </>
                  )}
                </Box>
              </Card>
            </Box>

            {/* Description + Owner side by side */}
            <Flex gap={4} alignItems="flex-start" style={{ width: "100%" }}>
              <Box style={{ flex: 2, minWidth: 0 }}>
                <Card title="Description">
                  <Typography
                    textColor="neutral700"
                    style={{
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      display: "block",
                      textAlign: "left",
                    }}
                  >
                    {submission.description}
                  </Typography>
                </Card>
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Card title="Owner">
                  <Flex gap={3} alignItems="center">
                    <Box
                      background="primary100"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        textColor="primary600"
                        variant="beta"
                      >
                        {submission.owner_name.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Typography
                        fontWeight="semiBold"
                        textColor="neutral800"
                        style={{
                          display: "block",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {submission.owner_name}
                      </Typography>
                      <Typography
                        variant="pi"
                        textColor="neutral500"
                        style={{
                          display: "block",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {submission.owner_email}
                      </Typography>
                    </Box>
                  </Flex>
                </Card>
              </Box>
            </Flex>

            {/* Submitter Notes */}
            {submission.submission_notes && (
              <Box style={{ width: "100%" }}>
                <Card title="Submitter Notes">
                  <Typography
                    textColor="neutral700"
                    style={{
                      lineHeight: 1.65,
                      display: "block",
                      textAlign: "left",
                    }}
                  >
                    {submission.submission_notes}
                  </Typography>
                </Card>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Right column — sticky, offset to align with content */}
        <Box
          style={{
            width: 360,
            flexShrink: 0,
            position: "sticky",
            top: 24,
            paddingTop: 0,
          }}
        >
          <TemplateReviewPanel
            documentId={submission.documentId}
            initialStatus={submission.overall_status}
            initialFeedback={
              (submission.business_review as BusinessReview | null)
                ?.reviewer_feedback || ""
            }
            initialNotes={
              (submission.business_review as BusinessReview | null)?.notes || ""
            }
            initialRejectionReason={
              (submission.business_review as BusinessReview | null)
                ?.rejection_reason || ""
            }
            onSaved={load}
          />
        </Box>
      </Flex>
    </Box>
  );
};
