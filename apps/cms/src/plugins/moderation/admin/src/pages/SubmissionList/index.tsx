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

export type SubmissionStatus =
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "rejected"
  | "approved";

export interface PluginSubmission {
  documentId: string;
  name: string;
  package_location: string | null;
  owner?: { name?: string; email?: string } | null;
  overall_status: SubmissionStatus;
  business_review_status: "pending" | "approved" | "rejected";
  security_review_status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface TemplateSubmission {
  documentId: string;
  name: string;
  owner?: { name?: string; email?: string } | null;
  overall_status: "submitted" | "approved" | "rejected";
  createdAt: string;
}

const statusColour: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "secondary"
> = {
  submitted: "secondary",
  under_review: "primary",
  changes_requested: "warning",
  rejected: "danger",
  approved: "success",
};

const reviewColour = {
  pending: "secondary" as const,
  approved: "success" as const,
  rejected: "danger" as const,
};

const PLUGIN_STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const TEMPLATE_STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

type SubmissionType = "plugins" | "templates";

export const SubmissionList = () => {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const navigate = useNavigate();

  const [submissionType, setSubmissionType] =
    useState<SubmissionType>("plugins");
  const [plugins, setPlugins] = useState<PluginSubmission[]>([]);
  const [templates, setTemplates] = useState<TemplateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadPlugins = async (status: string) => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await get(`/moderation/submissions${qs}`);
      setPlugins(res.data.data ?? []);
    } catch {
      toggleNotification({
        type: "danger",
        message: "Failed to load submissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (status: string) => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await get(`/moderation/template-submissions${qs}`);
      setTemplates(res.data.data ?? []);
    } catch {
      toggleNotification({
        type: "danger",
        message: "Failed to load submissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatusFilter("");
    if (submissionType === "plugins") {
      loadPlugins("");
    } else {
      loadTemplates("");
    }
  }, [submissionType]);

  useEffect(() => {
    if (submissionType === "plugins") {
      loadPlugins(statusFilter);
    } else {
      loadTemplates(statusFilter);
    }
  }, [statusFilter]);

  const statusFilters =
    submissionType === "plugins"
      ? PLUGIN_STATUS_FILTERS
      : TEMPLATE_STATUS_FILTERS;

  const totalCount =
    submissionType === "plugins" ? plugins.length : templates.length;

  return (
    <Box padding={8}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Typography variant="alpha">Marketplace Submissions</Typography>
        <Typography variant="omega" textColor="neutral600">
          {totalCount} submission{totalCount !== 1 ? "s" : ""}
        </Typography>
      </Flex>

      {/* Type tabs */}
      <Flex gap={1} marginBottom={4}>
        <Button
          variant={submissionType === "plugins" ? "default" : "tertiary"}
          size="S"
          onClick={() => setSubmissionType("plugins")}
        >
          Plugins
        </Button>
        <Button
          variant={submissionType === "templates" ? "default" : "tertiary"}
          size="S"
          onClick={() => setSubmissionType("templates")}
        >
          Templates
        </Button>
      </Flex>

      {/* Status filter tabs */}
      <Flex gap={2} marginBottom={6} flexWrap="wrap">
        {statusFilters.map((f) => (
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
      ) : submissionType === "plugins" ? (
        plugins.length === 0 ? (
          <Box padding={8} background="neutral100" hasRadius>
            <Typography textColor="neutral600" textAlign="center">
              No submissions found.
            </Typography>
          </Box>
        ) : (
          <Table colCount={7} rowCount={plugins.length}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">Plugin Name</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Owner</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Status</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Business</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Security</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Submitted</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Actions</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {plugins.map((s) => (
                <Tr key={s.documentId}>
                  <Td>
                    <Flex direction="column" alignItems="flex-start" gap={1}>
                      <Typography fontWeight="semiBold">{s.name}</Typography>
                      {s.package_location && (
                        <Typography variant="pi" textColor="neutral600">
                          {s.package_location}
                        </Typography>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex direction="column" alignItems="flex-start" gap={1}>
                      <Typography>{s.owner?.name ?? "—"}</Typography>
                      <Typography variant="pi" textColor="neutral600">
                        {s.owner?.email ?? ""}
                      </Typography>
                    </Flex>
                  </Td>
                  <Td>
                    <Badge
                      active={false}
                      backgroundColor={`${statusColour[s.overall_status]}100`}
                    >
                      {s.overall_status.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      active={false}
                      backgroundColor={`${reviewColour[s.business_review_status]}100`}
                    >
                      {s.business_review_status}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      active={false}
                      backgroundColor={`${reviewColour[s.security_review_status]}100`}
                    >
                      {s.security_review_status}
                    </Badge>
                  </Td>
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
                          `/plugins/moderation/submissions/${s.documentId}`,
                        )
                      }
                    >
                      Review
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )
      ) : templates.length === 0 ? (
        <Box padding={8} background="neutral100" hasRadius>
          <Typography textColor="neutral600" textAlign="center">
            No submissions found.
          </Typography>
        </Box>
      ) : (
        <Table colCount={5} rowCount={templates.length}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">Template Name</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Owner</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Status</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Submitted</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {templates.map((s) => (
              <Tr key={s.documentId}>
                <Td>
                  <Typography fontWeight="semiBold">{s.name}</Typography>
                </Td>
                <Td>
                  <Flex direction="column" alignItems="flex-start" gap={1}>
                    <Typography>{s.owner?.name ?? "—"}</Typography>
                    <Typography variant="pi" textColor="neutral600">
                      {s.owner?.email ?? ""}
                    </Typography>
                  </Flex>
                </Td>
                <Td>
                  <Badge
                    active={false}
                    backgroundColor={`${statusColour[s.overall_status]}100`}
                  >
                    {s.overall_status}
                  </Badge>
                </Td>
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
                        `/plugins/moderation/template-submissions/${s.documentId}`,
                      )
                    }
                  >
                    Review
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};
