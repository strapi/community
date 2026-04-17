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

interface PluginSubmissionDetail {
  documentId: string;
  plugin_name: string;
  npm_package_name: string | null;
  description: string;
  repository_url: string;
  logo_url: string | null;
  package_type: string;
  categories_list: string[];
  owner_name: string;
  owner_email: string;
  maintainers_list: Array<{ name: string; email?: string }>;
  readme: string | null;
  submission_notes: string | null;
  overall_status: string;
  business_review_status: "pending" | "approved" | "rejected";
  security_review_status: "pending" | "approved" | "rejected";
  reviewer_feedback: string | null;
  rejection_reason: string | null;
  business_review_notes: string | null;
  security_review_notes: string | null;
  automated_check_results: AutomatedChecks | null;
  promoted_package: { documentId: string } | null;
  createdAt: string;
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
  npm_advisories: "NPM advisories",
  dependency_vulnerabilities: "Dependency vulnerabilities",
  ai_analysis: "AI security analysis",
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

// Plain pill — no icon (unlike Tag which includes a remove icon)
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

// Horizontal label → value row used inside Plugin Info
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
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [submission, setSubmission] = useState<PluginSubmissionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("details");

  const load = async () => {
    setLoading(true);
    try {
      const res = await get(`/moderation/submissions/${documentId}`);
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

  const checks = submission.automated_check_results?.checks ?? {};
  const securityChecks =
    (checks.security as Record<string, AutomatedCheckResult> | undefined) ?? {};
  const businessCheckKeys = Object.keys(checks).filter((k) => k !== "security");
  const hasChecks = Boolean(submission.automated_check_results);
  const hasReadme = Boolean(submission.readme);

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: "details", label: "Details" },
    { id: "checks", label: "Automated Checks" },
    ...(hasReadme ? [{ id: "readme" as TabId, label: "README" }] : []),
  ];

  return (
    <Box padding={8}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
          {submission.plugin_name}
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

      {/* ── Two-column layout ──────────────────────────────────────────── */}
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

          {/* ── Details tab ── */}
          {activeTab === "details" && (
            <Flex direction="column" alignItems="flex-start" gap={4}>
              {/* Plugin Info */}
              <Box style={{ width: "100%" }}>
                <Card title="Plugin Info">
                  <Box>
                    <InfoRow
                      label="Plugin Name"
                      value={submission.plugin_name}
                    />
                    <Divider />
                    <InfoRow
                      label="NPM Package"
                      value={submission.npm_package_name ?? "—"}
                    />
                    <Divider />
                    <InfoRow
                      label="Package Type"
                      value={submission.package_type}
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
          )}

          {/* ── Automated Checks tab ── */}
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
                <>
                  <Box style={{ width: "100%" }}>
                    <Card title="Business Checks" noPadding>
                      <Box paddingLeft={5} paddingRight={5}>
                        {businessCheckKeys.length === 0 ? (
                          <Box paddingTop={4} paddingBottom={4}>
                            <Typography variant="pi" textColor="neutral500">
                              No business checks recorded.
                            </Typography>
                          </Box>
                        ) : (
                          businessCheckKeys.map((key, i) => (
                            <Box
                              key={key}
                              borderColor="neutral150"
                              borderWidth={i > 0 ? "1px 0 0 0" : "0"}
                              borderStyle="solid"
                            >
                              <CheckRow
                                label={CHECK_LABELS[key] ?? key}
                                result={checks[key] as AutomatedCheckResult}
                              />
                            </Box>
                          ))
                        )}
                      </Box>
                    </Card>
                  </Box>

                  <Box style={{ width: "100%" }}>
                    <Card title="Security Checks" noPadding>
                      <Box paddingLeft={5} paddingRight={5}>
                        {Object.keys(securityChecks).length === 0 ? (
                          <Box paddingTop={4} paddingBottom={4}>
                            <Box background="neutral100" padding={4} hasRadius>
                              <Typography variant="pi" textColor="neutral500">
                                No security checks have run yet.
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          Object.entries(securityChecks).map(
                            ([key, result], i) => (
                              <Box
                                key={key}
                                borderColor="neutral150"
                                borderWidth={i > 0 ? "1px 0 0 0" : "0"}
                                borderStyle="solid"
                              >
                                <CheckRow
                                  label={CHECK_LABELS[key] ?? key}
                                  result={result}
                                />
                              </Box>
                            ),
                          )
                        )}
                      </Box>
                    </Card>
                  </Box>
                </>
              )}
            </Flex>
          )}

          {/* ── README tab ── */}
          {activeTab === "readme" && (
            <Box style={{ width: "100%" }}>
              <Card title="README Preview">
                {hasReadme ? (
                  <Box
                    background="neutral100"
                    padding={4}
                    hasRadius
                    style={{
                      maxHeight: 600,
                      overflow: "auto",
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontFamily:
                          "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
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

        {/* Right column — sticky, offset to align with tab content */}
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
            initialBusinessStatus={submission.business_review_status}
            initialSecurityStatus={submission.security_review_status}
            initialOverallStatus={submission.overall_status}
            initialFeedback={submission.reviewer_feedback || ""}
            initialRejectionReason={submission.rejection_reason || ""}
            initialBusinessNotes={submission.business_review_notes || ""}
            initialSecurityNotes={submission.security_review_notes || ""}
            onSaved={load}
          />

          {submission.promoted_package && (
            <Box
              marginTop={4}
              background="success100"
              padding={5}
              hasRadius
              borderColor="success200"
              borderWidth="1px"
              borderStyle="solid"
            >
              <Flex direction="column" alignItems="flex-start" gap={3}>
                <Typography
                  fontWeight="semiBold"
                  textColor="success700"
                  variant="omega"
                >
                  Promoted to Package
                </Typography>
                <Button
                  variant="tertiary"
                  size="S"
                  endIcon={<ExternalLink />}
                  onClick={() =>
                    window.open(
                      `${window.strapi.backendURL}/admin/content-manager/collection-types/api::package.package/${submission.promoted_package!.documentId}`,
                      "_blank",
                    )
                  }
                >
                  Open in Content Manager
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
