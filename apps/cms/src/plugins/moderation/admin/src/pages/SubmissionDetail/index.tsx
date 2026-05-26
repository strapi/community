import {
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  Typography,
} from "@strapi/design-system";
import { ArrowLeft, ExternalLink } from "@strapi/icons";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReviewPanel } from "../../components/ReviewPanel";

interface ContentTypeConfig {
  uid: string;
  pluralName: string;
  label: string;
  hasSecurityScan: boolean;
  checks: string[];
}

interface BusinessReview {
  documentId: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  notes: string | null;
  reviewer_feedback: string | null;
  rejection_reason: string | null;
  automated_check_results: AutomatedChecks | null;
}

interface SecurityReview {
  documentId: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string | null;
  run_at: string | null;
  dependencies: unknown;
  ai_analysis: unknown;
  summary: unknown;
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

interface Submission {
  documentId: string;
  name: string;
  overall_status: string;
  description?: string;
  readme?: string;
  submission_notes?: string;
  git_repository?: string;
  package_location?: string;
  type?: string;
  preview_link?: string;
  createdAt: string;
  owner?: { name?: string; email?: string } | null;
  business_review?: BusinessReview | null;
  security_reviews?: SecurityReview[] | null;
  [key: string]: unknown;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  submitted: { bg: "neutral150", color: "neutral700", label: "Submitted" },
  under_review: {
    bg: "primary100",
    color: "primary700",
    label: "Under Review",
  },
  changes_requested: {
    bg: "warning100",
    color: "warning700",
    label: "Changes Requested",
  },
  rejected: { bg: "danger100", color: "danger700", label: "Rejected" },
  approved: { bg: "success100", color: "success700", label: "Approved" },
};

const CHECK_LABELS: Record<string, string> = {
  repo_public: "Repository is public",
  readme_exists: "README present",
  mit_license: "MIT license",
  strapi_peer_dep: "Strapi peer dependency",
  enterprise_competition: "Enterprise competition",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const CheckRow = ({
  label,
  result,
}: {
  label: string;
  result: AutomatedCheckResult;
}) => {
  const state = result.skipped
    ? "skipped"
    : result.passed === true
      ? "passed"
      : result.passed === false
        ? "failed"
        : "unknown";

  const cfg = {
    passed: { bg: "success100", text: "success700", icon: "✓" },
    failed: { bg: "danger100", text: "danger700", icon: "✗" },
    skipped: { bg: "neutral150", text: "neutral600", icon: "—" },
    unknown: { bg: "warning100", text: "warning700", icon: "?" },
  }[state];

  return (
    <Flex gap={3} alignItems="flex-start" paddingTop={3} paddingBottom={3}>
      <Box
        background={cfg.bg}
        hasRadius
        style={{
          width: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography textColor={cfg.text} fontWeight="bold" variant="omega">
          {cfg.icon}
        </Typography>
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography
          fontWeight="semiBold"
          textColor="neutral800"
          variant="omega"
          style={{ display: "block", textAlign: "left" }}
        >
          {label}
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral500"
          style={{ display: "block", textAlign: "left" }}
        >
          {result.message}
        </Typography>
      </Box>
    </Flex>
  );
};

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
  action,
  children,
  noPadding,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}) => (
  <Box
    background="neutral0"
    hasRadius
    borderColor="neutral200"
    borderWidth="1px"
    borderStyle="solid"
    overflow="hidden"
  >
    {(title || action) && (
      <Flex
        justifyContent="space-between"
        alignItems="center"
        paddingLeft={5}
        paddingRight={5}
        paddingTop={4}
        paddingBottom={4}
        borderColor="neutral150"
        borderWidth="0 0 1px 0"
        borderStyle="solid"
      >
        {title && (
          <Typography
            variant="sigma"
            textColor="neutral600"
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {title}
          </Typography>
        )}
        {action}
      </Flex>
    )}
    {noPadding ? children : <Box padding={5}>{children}</Box>}
  </Box>
);

type TabId = "details" | "checks" | "readme";

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SubmissionDetail = () => {
  const { plural, documentId } = useParams<{
    plural: string;
    documentId: string;
  }>();
  const navigate = useNavigate();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [ctConfig, setCtConfig] = useState<ContentTypeConfig | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("details");

  const loadConfig = async () => {
    const res = await get("/moderation/config");
    const configs: ContentTypeConfig[] = res.data?.data ?? [];
    const found = configs.find((c) => c.pluralName === plural);
    setCtConfig(found ?? null);
    return found;
  };

  const loadSubmission = async (cfg?: ContentTypeConfig | null) => {
    const config = cfg ?? ctConfig;
    if (!config || !plural || !documentId) return;
    try {
      const res = await get(`/moderation/${plural}/submissions/${documentId}`);
      setSubmission(res.data?.data ?? null);
    } catch {
      toggleNotification({
        type: "danger",
        message: "Failed to load submission.",
      });
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const cfg = await loadConfig();
      await loadSubmission(cfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plural && documentId) load();
  }, [plural, documentId]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ height: 300 }}>
        <Loader />
      </Flex>
    );
  }

  if (!submission || !ctConfig) {
    return (
      <Box padding={8}>
        <Typography textColor="neutral600">Submission not found.</Typography>
      </Box>
    );
  }

  const businessReview = submission.business_review as BusinessReview | null;
  const securityReviews =
    (submission.security_reviews as SecurityReview[] | null) ?? [];
  const latestScan =
    securityReviews.length > 0
      ? securityReviews.reduce((latest, r) =>
          new Date(r.started_at ?? 0) > new Date(latest.started_at ?? 0)
            ? r
            : latest,
        )
      : null;

  const automatedChecks = businessReview?.automated_check_results;
  const checks = automatedChecks?.checks ?? {};
  const hasChecks = Boolean(automatedChecks);
  const hasReadme = Boolean(submission.readme);

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: "details", label: "Details" },
    { id: "checks", label: "Automated Checks" },
    ...(hasReadme ? [{ id: "readme" as TabId, label: "README" }] : []),
  ];

  const securityStatus: "pending" | "approved" | "rejected" =
    latestScan?.status === "completed"
      ? "approved"
      : latestScan?.status === "failed"
        ? "rejected"
        : "pending";

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
        <Typography variant="alpha" style={{ lineHeight: 1 }}>
          {submission.name}
        </Typography>
        <StatusBadge status={submission.overall_status} />
      </Flex>

      <Box marginBottom={6} paddingLeft={1}>
        <Typography variant="pi" textColor="neutral400">
          {ctConfig.label} · Submitted{" "}
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
          {/* Tab nav */}
          <Flex gap={1} marginBottom={4}>
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "tertiary"}
                size="S"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </Flex>

          {/* Details tab */}
          {activeTab === "details" && (
            <Flex direction="column" alignItems="flex-start" gap={4}>
              <Box style={{ width: "100%" }}>
                <Card title="Submission Info">
                  <Box>
                    <InfoRow label="Name" value={submission.name} />
                    {submission.type && (
                      <>
                        <Divider />
                        <InfoRow label="Type" value={submission.type} />
                      </>
                    )}
                    {submission.package_location && (
                      <>
                        <Divider />
                        <InfoRow
                          label="Registry URL"
                          value={submission.package_location}
                        />
                      </>
                    )}
                    {submission.preview_link && (
                      <>
                        <Divider />
                        <InfoRow
                          label="Demo URL"
                          value={submission.preview_link}
                        />
                      </>
                    )}
                    {submission.git_repository && (
                      <>
                        <Divider />
                        <InfoRow
                          label="Repository"
                          value={
                            <a
                              href={submission.git_repository}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
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
                                  {submission.git_repository}
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
                  </Box>
                </Card>
              </Box>

              <Flex gap={4} alignItems="flex-start" style={{ width: "100%" }}>
                {submission.description && (
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
                )}

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Card title="Owner">
                    <Flex gap={3} alignItems="center">
                      {(submission.owner as { name?: string } | null)?.name && (
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
                            {(submission.owner as { name?: string })?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </Typography>
                        </Box>
                      )}
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
                          {(submission.owner as { name?: string } | null)
                            ?.name ?? "—"}
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
                          {(submission.owner as { email?: string } | null)
                            ?.email ?? ""}
                        </Typography>
                      </Box>
                    </Flex>
                  </Card>
                </Box>
              </Flex>

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
          )}

          {/* Checks tab */}
          {activeTab === "checks" && (
            <Flex
              direction="column"
              alignItems="flex-start"
              gap={4}
              style={{ width: "100%" }}
            >
              {!hasChecks ? (
                <Box style={{ width: "100%" }}>
                  <Card>
                    <Box
                      background="neutral100"
                      padding={8}
                      hasRadius
                      style={{ textAlign: "center" }}
                    >
                      <Typography textColor="neutral500">
                        Automated checks have not run yet.
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              ) : (
                <Box style={{ width: "100%" }}>
                  <Card title="Automated Checks" noPadding>
                    <Box paddingLeft={5} paddingRight={5}>
                      {Object.keys(checks).length === 0 ? (
                        <Box paddingTop={4} paddingBottom={4}>
                          <Typography variant="pi" textColor="neutral500">
                            No checks recorded.
                          </Typography>
                        </Box>
                      ) : (
                        Object.entries(checks).map(([key, result], i) => (
                          <Box
                            key={key}
                            borderColor="neutral150"
                            borderWidth={i > 0 ? "1px 0 0 0" : "0"}
                            borderStyle="solid"
                          >
                            <CheckRow
                              label={CHECK_LABELS[key] ?? key}
                              result={result as AutomatedCheckResult}
                            />
                          </Box>
                        ))
                      )}
                    </Box>
                  </Card>
                </Box>
              )}
            </Flex>
          )}

          {/* README tab */}
          {activeTab === "readme" && (
            <Box style={{ width: "100%" }}>
              <Card title="README Preview">
                {hasReadme ? (
                  <Box
                    background="neutral100"
                    padding={4}
                    hasRadius
                    style={{ maxHeight: 600, overflow: "auto" }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontFamily:
                          "'SF Mono', 'Fira Code', 'Roboto Mono', monospace",
                        fontSize: 12,
                        lineHeight: 1.75,
                        color: "#32324d",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {submission.readme}
                    </pre>
                  </Box>
                ) : (
                  <Typography textColor="neutral500">
                    No README provided with this submission.
                  </Typography>
                )}
              </Card>
            </Box>
          )}
        </Box>

        {/* Right column — sticky review panel */}
        <Box
          style={{
            width: 360,
            flexShrink: 0,
            position: "sticky",
            top: 24,
            paddingTop: 48,
          }}
        >
          <ReviewPanel
            documentId={submission.documentId}
            plural={plural!}
            hasSecurityScan={ctConfig.hasSecurityScan}
            initialBusinessStatus={
              (businessReview?.status === "approved"
                ? "approved"
                : businessReview?.status === "rejected"
                  ? "rejected"
                  : "pending") as "pending" | "approved" | "rejected"
            }
            initialSecurityStatus={securityStatus}
            initialOverallStatus={submission.overall_status}
            initialFeedback={businessReview?.reviewer_feedback || ""}
            initialRejectionReason={businessReview?.rejection_reason || ""}
            initialBusinessNotes={businessReview?.notes || ""}
            onSaved={load}
          />
        </Box>
      </Flex>
    </Box>
  );
};
