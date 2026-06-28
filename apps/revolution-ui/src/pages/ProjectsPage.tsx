import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { MigrationProject, SavedConfiguration } from "@revolution/shared";
import { useNavigate } from "react-router-dom";
import { PageIntro } from "../components/shared/PageChrome";
import { formatProjectType } from "../components/shared/pageChrome.helpers";
import "./ProjectsPage.css";

type ProjectsPageProps = {
  projects: MigrationProject[];
  activeProjectId: string;
  configurations: SavedConfiguration[];
  onOpenCreateProjectDialog: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
};

export function ProjectsPage({
  projects,
  activeProjectId,
  configurations,
  onOpenCreateProjectDialog,
  onSelectProject,
  onDeleteProject,
  onEditProject,
}: ProjectsPageProps) {
  const navigate = useNavigate();

  return (
    <Stack spacing={3}>
      <PageIntro title="Projects" subtitle="" />

      <Paper className="panel panel-full">
        <Stack spacing={2}>
          {projects.length === 0 ? (
            <Box className="empty-state">
              <Typography variant="overline" className="empty-state-kicker">
                No projects yet
              </Typography>
              <Typography variant="h4" className="empty-state-title">
                Create your first project
              </Typography>
              <Typography color="text.secondary" className="empty-state-copy">
                Projects are where you define a migration or any future workflow. Start by creating
                one, then add configuration when you’re ready.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRounded />}
                onClick={onOpenCreateProjectDialog}
              >
                Create Project
              </Button>
            </Box>
          ) : (
            projects.map((project) => {
              const sourceConfiguration = configurations.find(
                (item) => item.id === project.sourceConfigurationId,
              );
              const destinationConfiguration = configurations.find(
                (item) => item.id === project.destinationConfigurationId,
              );
              const configured =
                Boolean(sourceConfiguration?.validatedEnvironment) &&
                Boolean(destinationConfiguration?.validatedEnvironment);

              return (
                <Paper
                  key={project.id}
                  component="div"
                  variant="outlined"
                  className={`project-card ${project.id === activeProjectId ? "project-card-active project-card-selected" : ""}`}
                  onClick={() => onSelectProject(project.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    event.preventDefault();
                    onSelectProject(project.slug);
                  }}
                  onDoubleClick={() => {
                    onSelectProject(project.slug);
                    void navigate(`/project/${project.slug}/overview`);
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Typography variant="h6">{project.name}</Typography>
                        <Chip size="small" label={formatProjectType(project.projectType)} />
                      </Stack>
                      <Typography color="text.secondary" mt={0.5}>
                        {project.summary}
                      </Typography>
                    </Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      alignItems="center"
                      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                      className="project-card-actions"
                    >
                      {configured ? (
                        <Chip size="small" label="Configured" color="success" />
                      ) : (
                        <Alert
                          severity="warning"
                          className="project-setup-alert"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectProject(project.slug);
                            void navigate(`/project/${project.slug}/configuration`);
                          }}
                        >
                          Setup needed
                        </Alert>
                      )}

                      <Tooltip title="Edit project">
                        <span className="project-delete-action">
                          <IconButton
                            color="primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditProject(project.id);
                            }}
                          >
                            <EditOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete project">
                        <span className="project-delete-action">
                          <IconButton
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteProject(project.id);
                            }}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
