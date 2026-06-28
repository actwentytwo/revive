import CloudDoneRounded from "@mui/icons-material/CloudDoneRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import { Alert, Paper, Stack } from "@mui/material";
import type { MigrationProject, SavedConfiguration } from "@revolution/shared";
import { Fact, MetricPill, PageIntro, PanelTitle } from "../components/shared/PageChrome";
import { formatProjectType, formatTimestamp } from "../components/shared/pageChrome.helpers";

type OverviewPageProps = {
  activeProject: MigrationProject | undefined;
  sourceConfiguration: SavedConfiguration | undefined;
  destinationConfiguration: SavedConfiguration | undefined;
  sourceConnected: boolean;
  destinationConnected: boolean;
  rowCount: number;
};

export function OverviewPage({
  activeProject,
  sourceConfiguration,
  destinationConfiguration,
  sourceConnected,
  destinationConnected,
  rowCount,
}: OverviewPageProps) {
  return (
    <Stack spacing={3}>
      <PageIntro title="Overview" subtitle="Project overview" />

      <section className="content-grid">
        <Paper className="panel">
          <PanelTitle
            icon={<CloudDoneRounded />}
            title="Project Status"
            subtitle="A summary of the current migration project."
          />
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <MetricPill label="Project" value={activeProject?.name ?? "None"} />
            <MetricPill
              label="Type"
              value={activeProject ? formatProjectType(activeProject.projectType) : "None"}
            />
            <MetricPill label="Source" value={sourceConfiguration?.name ?? "Not selected"} />
            <MetricPill
              label="Destination"
              value={destinationConfiguration?.name ?? "Not selected"}
            />
            <MetricPill label="Videos loaded" value={String(rowCount)} />
          </Stack>
        </Paper>

        <Paper className="panel">
          <PanelTitle
            icon={<DashboardRounded />}
            title="Project Details"
            subtitle="Core information for the selected project."
          />
          {activeProject ? (
            <Stack spacing={2}>
              <Fact label="Project" value={activeProject.name} />
              <Fact label="Type" value={formatProjectType(activeProject.projectType)} />
              <Fact label="Summary" value={activeProject.summary} />
              <Fact
                label="Source configuration"
                value={sourceConfiguration?.name ?? "Not selected"}
              />
              <Fact
                label="Destination configuration"
                value={destinationConfiguration?.name ?? "Not selected"}
              />
              <Fact
                label="Readiness"
                value={
                  sourceConnected && destinationConnected
                    ? "Source and destination are ready"
                    : sourceConnected
                      ? "Source ready, destination pending"
                      : destinationConnected
                        ? "Destination ready, source pending"
                        : "Source and destination pending"
                }
              />
              <Fact label="Created" value={formatTimestamp(activeProject.createdAt)} />
              <Fact label="Updated" value={formatTimestamp(activeProject.updatedAt)} />
            </Stack>
          ) : (
            <Alert severity="warning">Select a project to view its overview.</Alert>
          )}
        </Paper>
      </section>
    </Stack>
  );
}
