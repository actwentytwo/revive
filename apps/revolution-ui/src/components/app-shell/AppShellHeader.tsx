import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import TuneIcon from "@mui/icons-material/Tune";
import { Link, NavLink } from "react-router-dom";
import type { MigrationProject } from "@revolution/shared";
import { RevolutionLogo } from "./RevolutionLogo";
import "./AppShellHeader.css";

type AppShellHeaderProps = {
  activeProjectId: string;
  apiOffline: boolean;
  homePath: string;
  mode: "light" | "dark";
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onToggleMode: () => void;
  projects: MigrationProject[];
};

export function AppShellHeader({
  activeProjectId,
  apiOffline,
  homePath,
  mode,
  onCreateProject,
  onSelectProject,
  onToggleMode,
  projects,
}: AppShellHeaderProps) {
  return (
    <Paper className="topbar">
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", lg: "center" }}
        justifyContent="space-between"
      >
        <Stack
          component={Link}
          to={homePath}
          direction="row"
          spacing={1.5}
          alignItems="center"
          className="brand-link"
        >
          <RevolutionLogo />
          <Box>
            <Typography className="brand-mark brand-mark-revolution">
              <span className="brand-mark-accent">REV</span>
              <span className="brand-mark-neutral">OLUTION</span>
            </Typography>
            <Typography className="brand-copy">Custom REV Solutions</Typography>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Tooltip title="Platform Configuration">
            <span>
              <IconButton
                component={NavLink}
                to="/configuration"
                className="nav-icon-button"
                aria-label="Configuration"
                color="inherit"
              >
                <TuneIcon />
              </IconButton>
            </span>
          </Tooltip>

          <FormControl size="small" className="project-select">
            <InputLabel id="project-select-label" shrink={Boolean(activeProjectId)}>
              {Boolean(activeProjectId)
                ? "Project"
                : projects.length === 0
                  ? "No Projects"
                  : "Select Project"}
            </InputLabel>
            <Select
              labelId="project-select-label"
              value={activeProjectId}
              notched={Boolean(activeProjectId)}
              label="Project"
              displayEmpty
              disabled={projects.length === 0}
              onChange={(event) => onSelectProject(event.target.value)}
              renderValue={(value) =>
                projects.find((project) => project.slug === value || project.id === value)?.name ??
                ""
              }
            >
              {projects.map((project) => (
                <MenuItem
                  key={project.id}
                  value={project.slug}
                  onClick={() => onSelectProject(project.slug)}
                >
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Create new project">
            <span>
              <IconButton
                className="theme-toggle"
                color="inherit"
                disabled={apiOffline}
                onClick={onCreateProject}
              >
                <AddRounded />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <IconButton className="theme-toggle" onClick={onToggleMode} color="inherit">
              {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
