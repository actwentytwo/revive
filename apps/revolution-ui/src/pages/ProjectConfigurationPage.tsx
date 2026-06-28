import SettingsEthernetRounded from "@mui/icons-material/SettingsEthernetRounded";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import type { MigrationProject, SavedConfiguration } from "@revolution/shared";
import {
  ConfigurationSummaryPanel,
  PageIntro,
  PanelTitle,
  formatConfigurationLabel,
} from "../components/shared/PageChrome";

type ProjectConfigurationPageProps = {
  activeProject: MigrationProject | undefined;
  configurations: SavedConfiguration[];
  sourceConfiguration: SavedConfiguration | undefined;
  destinationConfiguration: SavedConfiguration | undefined;
  selectedSourceConfigurationId: string;
  selectedDestinationConfigurationId: string;
  setSelectedSourceConfigurationId: (value: string) => void;
  setSelectedDestinationConfigurationId: (value: string) => void;
  onAssignConfigurations: () => void;
  isBusy: boolean;
};

export function ProjectConfigurationPage({
  activeProject,
  configurations,
  sourceConfiguration,
  destinationConfiguration,
  selectedSourceConfigurationId,
  selectedDestinationConfigurationId,
  setSelectedSourceConfigurationId,
  setSelectedDestinationConfigurationId,
  onAssignConfigurations,
  isBusy,
}: ProjectConfigurationPageProps) {
  const sameSourceAndDestination =
    Boolean(selectedSourceConfigurationId) &&
    selectedSourceConfigurationId === selectedDestinationConfigurationId;
  const hasChanges =
    selectedSourceConfigurationId !== (activeProject?.sourceConfigurationId ?? "") ||
    selectedDestinationConfigurationId !== (activeProject?.destinationConfigurationId ?? "");

  return (
    <Stack spacing={3}>
      <PageIntro title="Configuration" subtitle={`Configure your project settings`} />

      <section className="content-grid">
        <Paper className="panel panel-full">
          <PanelTitle
            icon={<SettingsEthernetRounded />}
            title="Project Connections"
            subtitle="Migration projects require both a source and a destination instance."
          />
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="source-instance-label">Source instance</InputLabel>
              <Select
                labelId="source-instance-label"
                label="Source instance"
                value={selectedSourceConfigurationId}
                onChange={(event) => setSelectedSourceConfigurationId(event.target.value)}
              >
                <MenuItem value="">None selected</MenuItem>
                {configurations.map((configuration) => (
                  <MenuItem key={configuration.id} value={configuration.id}>
                    {formatConfigurationLabel(configuration)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={sameSourceAndDestination}>
              <InputLabel id="destination-instance-label">Destination instance</InputLabel>
              <Select
                labelId="destination-instance-label"
                label="Destination instance"
                value={selectedDestinationConfigurationId}
                onChange={(event) => setSelectedDestinationConfigurationId(event.target.value)}
              >
                <MenuItem value="">None selected</MenuItem>
                {configurations.map((configuration) => (
                  <MenuItem key={configuration.id} value={configuration.id}>
                    {formatConfigurationLabel(configuration)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {sameSourceAndDestination
                  ? "Source and destination must be different instances."
                  : " "}
              </FormHelperText>
            </FormControl>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={onAssignConfigurations}
                disabled={isBusy || !activeProject || sameSourceAndDestination || !hasChanges}
              >
                Save project setup
              </Button>
              <Button component={Link} to="/configuration" variant="outlined" size="large">
                Manage instances
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ gridColumn: "1 / -1" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ConfigurationSummaryPanel
              title="Source Summary"
              subtitle="The selected source instance used to read videos."
              configuration={sourceConfiguration}
              emptyMessage="Choose a source instance for this project."
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ConfigurationSummaryPanel
              title="Destination Summary"
              subtitle="The selected destination instance used to write migrated videos."
              configuration={destinationConfiguration}
              emptyMessage="Choose a destination instance for this project."
            />
          </Box>
        </Stack>
      </section>
    </Stack>
  );
}
