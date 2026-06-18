import {
  Badge,
  Box,
  Button,
  Flex,
  Loader,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from "@strapi/design-system";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ContentTypeConfig {
  uid: string;
  pluralName: string;
  label: string;
  checks: string[];
  hasSecurityScan: boolean;
}

interface Submission {
  documentId: string;
  name: string;
  owner?: { name?: string; email?: string } | null;
  overall_status: string;
  business_review?: { status?: string } | null;
  createdAt: string;
}

const STATUS_COLOUR: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "secondary"
> = {
  submitted: "secondary",
  under_review: "primary",
  changes_requested: "warning",
  rejected: "danger",
  approved: "success",
};

const REVIEW_COLOUR: Record<string, "success" | "danger" | "secondary"> = {
  pending: "secondary",
  approved: "success",
  rejected: "danger",
};

const STATUS_FILTERS = [
  { label: "All Active", value: "" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const SubmissionList = () => {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const navigate = useNavigate();

  const [ctConfigs, setCtConfigs] = useState<ContentTypeConfig[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Load plugin config once on mount
  useEffect(() => {
    get("/moderation/config")
      .then((res) => {
        const configs: ContentTypeConfig[] = res.data?.data ?? [];
        setCtConfigs(configs);
        if (configs.length > 0) setActiveTab(configs[0].pluralName);
      })
      .catch(() => {
        toggleNotification({
          type: "danger",
          message: "Failed to load moderation config.",
        });
      });
  }, []);

  const loadSubmissions = async (plural: string, status: string) => {
    if (!plural) return;
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await get(`/moderation/${plural}/submissions${qs}`);
      setSubmissions(res.data?.data ?? []);
    } catch {
      toggleNotification({
        type: "danger",
        message: "Failed to load submissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload when active tab or status filter changes
  useEffect(() => {
    setStatusFilter("");
    loadSubmissions(activeTab, "");
  }, [activeTab]);

  useEffect(() => {
    loadSubmissions(activeTab, statusFilter);
  }, [statusFilter]);

  const activeCt = ctConfigs.find((c) => c.pluralName === activeTab);

  return (
    <Box padding={8}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Typography variant="alpha">Marketplace Submissions</Typography>
        <Typography variant="omega" textColor="neutral600">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </Typography>
      </Flex>

      {/* Content-type tabs */}
      {ctConfigs.length > 1 && (
        <Flex gap={1} marginBottom={4}>
          {ctConfigs.map((ct) => (
            <Button
              key={ct.pluralName}
              variant={activeTab === ct.pluralName ? "default" : "tertiary"}
              size="S"
              onClick={() => setActiveTab(ct.pluralName)}
            >
              {ct.label}
            </Button>
          ))}
        </Flex>
      )}

      {/* Status filter */}
      <Flex gap={2} marginBottom={6} flexWrap="wrap">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "default" : "tertiary"}
            size="S"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </Flex>

      {loading ? (
        <Flex justifyContent="center" padding={8}>
          <Loader />
        </Flex>
      ) : submissions.length === 0 ? (
        <Box padding={8} background="neutral100" hasRadius>
          <Typography textColor="neutral600" textAlign="center">
            No submissions found.
          </Typography>
        </Box>
      ) : (
        <Table
          colCount={activeCt?.hasSecurityScan ? 7 : 6}
          rowCount={submissions.length}
        >
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">Name</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Owner</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Status</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Review</Typography>
              </Th>
              {activeCt?.hasSecurityScan && (
                <Th>
                  <Typography variant="sigma">Security</Typography>
                </Th>
              )}
              <Th>
                <Typography variant="sigma">Submitted</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((s) => {
              const bStatus =
                (s.business_review as { status?: string } | null)?.status ??
                "pending";
              return (
                <Tr key={s.documentId}>
                  <Td>
                    <Typography fontWeight="semiBold">{s.name}</Typography>
                  </Td>
                  <Td>
                    <Flex direction="column" alignItems="flex-start" gap={1}>
                      <Typography>{s.owner?.name ?? "—"}</Typography>
                      {s.owner?.email && (
                        <Typography variant="pi" textColor="neutral600">
                          {s.owner.email}
                        </Typography>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Badge
                      active={false}
                      backgroundColor={`${STATUS_COLOUR[s.overall_status] ?? "secondary"}100`}
                    >
                      {s.overall_status.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      active={false}
                      backgroundColor={`${REVIEW_COLOUR[bStatus as keyof typeof REVIEW_COLOUR] ?? "secondary"}100`}
                    >
                      {bStatus}
                    </Badge>
                  </Td>
                  {activeCt?.hasSecurityScan && (
                    <Td>
                      <Badge active={false} backgroundColor="secondary100">
                        —
                      </Badge>
                    </Td>
                  )}
                  <Td>
                    <Typography variant="pi">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </Typography>
                  </Td>
                  <Td>
                    <Button
                      variant="tertiary"
                      size="S"
                      onClick={() =>
                        navigate(
                          `/plugins/moderation/${activeTab}/submissions/${s.documentId}`,
                        )
                      }
                    >
                      Review
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};
