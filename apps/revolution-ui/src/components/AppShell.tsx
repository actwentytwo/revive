import { useDeferredValue, useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  LinearProgress,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { type GridPaginationModel } from "@mui/x-data-grid";
import type {
  MigrationProject,
  ProjectType,
  SavedConfiguration,
  SourceVideoRecord,
} from "@revolution/shared";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { AppFooter } from "./app-shell/AppFooter";
import { AppShellHeader } from "./app-shell/AppShellHeader";
import { AppNoticeSnackbar } from "./app-shell/AppNoticeSnackbar";
import { ProjectDialogs } from "./app-shell/ProjectDialogs";
import {
  compareVersionsDescending,
  configurationFormToEnvironment,
  type ConfigurationFormState,
} from "./shared/pageChrome.helpers";
import {
  ApiOfflinePage,
  ChangeLogPage,
  ProjectWorkspaceTitle,
} from "../components/shared/PageChrome";
import { OverviewPage } from "../pages/OverviewPage";
import { ProjectConfigurationPage } from "../pages/ProjectConfigurationPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ConfigurationWorkspacePage } from "../pages/ConfigurationWorkspacePage";
import { VideosPage } from "../pages/VideosPage";
import { MyProfilePage } from "../pages/MyProfilePage";
import { RolePermissionsEditorPage } from "../pages/RolePermissionsEditorPage";
import { changelog, type ChangeLogEntry } from "../changelog";
import { trpc } from "../main";
import "../App.css";
import "./AppShell.css";

const ACTIVE_PROJECT_STORAGE_KEY = "revolution-active-project-id";
const ACTIVE_CONFIGURATION_STORAGE_KEY = "revolution-active-configuration-id";

const projectNavItems = [
  { to: "overview", label: "Overview" },
  { to: "configuration", label: "Configuration" },
  { to: "videos", label: "Videos" },
];

type AppShellOutletContext = {
  activeConfiguration: SavedConfiguration | undefined;
  activeConfigurationId: string;
  activeProject: MigrationProject | undefined;
  activeProjectId: string;
  configurations: SavedConfiguration[];
  currentVersion: string;
  createConfigurationError?: string;
  deleteConfigurationError?: string;
  destinationConfiguration: SavedConfiguration | undefined;
  destinationConnected: boolean;
  isBusy: boolean;
  orderedChangelog: ChangeLogEntry[];
  paginationModel: GridPaginationModel;
  projects: MigrationProject[];
  rowCount: number;
  rows: SourceVideoRecord[];
  search: string;
  selectedSourceConfigurationId: string;
  selectedDestinationConfigurationId: string;
  setPaginationModel: (model: GridPaginationModel) => void;
  setSearch: (value: string) => void;
  setSelectedDestinationConfigurationId: (value: string) => void;
  setSelectedSourceConfigurationId: (value: string) => void;
  saveConfigurationError?: string;
  sourceConfiguration: SavedConfiguration | undefined;
  sourceConnected: boolean;
  validateConfigurationError?: string;
  videosError?: string;
  videosLoading: boolean;
  onAssignConfigurations: () => void;
  onCreateConfiguration: (input: ConfigurationFormState) => Promise<void>;
  onDeleteConfiguration: (configurationId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onOpenCreateProjectDialog: () => void;
  onRefresh: () => void;
  onSaveConfiguration: (input: ConfigurationFormState) => Promise<void>;
  onSelectConfiguration: (configurationId: string) => void;
  onSelectProject: (projectId: string) => void;
  onValidateConfiguration: () => Promise<void>;
};

function loadStoredValue(key: string, fallback: string) {
  const saved = window.localStorage.getItem(key);
  return saved || fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AppShell() {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedMode = window.localStorage.getItem("revolution-color-mode");
    if (savedMode === "light" || savedMode === "dark") {
      return savedMode;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadStoredValue(ACTIVE_PROJECT_STORAGE_KEY, ""),
  );
  const [activeConfigurationId, setActiveConfigurationId] = useState<string>(() =>
    loadStoredValue(ACTIVE_CONFIGURATION_STORAGE_KEY, ""),
  );
  const [selectedSourceConfigurationId, setSelectedSourceConfigurationId] = useState("");
  const [selectedDestinationConfigurationId, setSelectedDestinationConfigurationId] = useState("");
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectType, setNewProjectType] = useState<ProjectType>("migration");
  const [newProjectSummary, setNewProjectSummary] = useState("");
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectSlug, setEditProjectSlug] = useState("");
  const [editProjectSummary, setEditProjectSummary] = useState("");
  const [editProjectError, setEditProjectError] = useState<string | null>(null);
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState("");
  const [appNotice, setAppNotice] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const deferredSearch = useDeferredValue(search);
  const generatedProjectSlug = useMemo(() => slugify(newProjectName), [newProjectName]);
  const onProjectsPage = location.pathname.startsWith("/projects");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#f6b05a" : "#14323f",
          },
          secondary: {
            main: mode === "dark" ? "#8fd3c3" : "#0f766e",
          },
          background: {
            default: mode === "dark" ? "#101a1f" : "#f4efe6",
            paper: mode === "dark" ? "#16252d" : "#fffaf2",
          },
        },
        shape: {
          borderRadius: 18,
        },
      }),
    [mode],
  );

  const projectsQuery = trpc.projects.list.useQuery();
  const configurationsQuery = trpc.configurations.list.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const assignProjectConfigurationsMutation = trpc.projects.assignConfigurations.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const createConfigurationMutation = trpc.configurations.create.useMutation();
  const updateConfigurationMutation = trpc.configurations.update.useMutation();
  const validateConfigurationMutation = trpc.configurations.validate.useMutation();
  const deleteConfigurationMutation = trpc.configurations.delete.useMutation();
  const videosMutation = trpc.videos.listSource.useMutation();

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const configurations = useMemo(() => configurationsQuery.data ?? [], [configurationsQuery.data]);

  const activeProject = useMemo(
    () =>
      projects.find((project) => project.slug === activeProjectId) ??
      projects.find((project) => project.id === activeProjectId) ??
      projects[0],
    [activeProjectId, projects],
  );
  const activeConfiguration = useMemo(
    () =>
      configurations.find((configuration) => configuration.id === activeConfigurationId) ??
      configurations[0],
    [activeConfigurationId, configurations],
  );

  const sourceConfiguration = useMemo(
    () =>
      configurations.find(
        (configuration) => configuration.id === activeProject?.sourceConfigurationId,
      ),
    [activeProject?.sourceConfigurationId, configurations],
  );
  const destinationConfiguration = useMemo(
    () =>
      configurations.find(
        (configuration) => configuration.id === activeProject?.destinationConfigurationId,
      ),
    [activeProject?.destinationConfigurationId, configurations],
  );

  const fetchVideos = useEffectEvent(async () => {
    if (!activeProject?.sourceConfigurationId || !sourceConfiguration?.validatedEnvironment) {
      return;
    }

    await videosMutation.mutateAsync({
      projectId: activeProject.id,
      search: deferredSearch,
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    });
  });

  useEffect(() => {
    if (!activeProject?.sourceConfigurationId || !sourceConfiguration?.validatedEnvironment) {
      return;
    }

    void fetchVideos();
  }, [
    activeProject?.id,
    activeProject?.sourceConfigurationId,
    deferredSearch,
    paginationModel.page,
    paginationModel.pageSize,
    sourceConfiguration?.validatedEnvironment,
  ]);

  useEffect(() => {
    setSelectedSourceConfigurationId(activeProject?.sourceConfigurationId ?? "");
    setSelectedDestinationConfigurationId(activeProject?.destinationConfigurationId ?? "");
  }, [activeProject?.destinationConfigurationId, activeProject?.sourceConfigurationId]);

  useEffect(() => {
    window.localStorage.setItem("revolution-color-mode", mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_CONFIGURATION_STORAGE_KEY, activeConfigurationId);
  }, [activeConfigurationId]);

  useEffect(() => {
    if (params.projectSlug && params.projectSlug !== activeProjectId) {
      setActiveProjectId(params.projectSlug);
    }
  }, [activeProjectId, params.projectSlug]);

  useEffect(() => {
    if (projects.length === 0) {
      return;
    }

    const routeProjectSlug = params.projectSlug;
    const storedProjectSlug = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY) ?? "";
    const validRouteProjectSlug =
      routeProjectSlug &&
      projects.some(
        (project) => project.slug === routeProjectSlug || project.id === routeProjectSlug,
      )
        ? routeProjectSlug
        : "";
    const validStoredProjectSlug =
      storedProjectSlug &&
      projects.some(
        (project) => project.slug === storedProjectSlug || project.id === storedProjectSlug,
      )
        ? storedProjectSlug
        : "";
    const nextProjectId =
      validRouteProjectSlug || validStoredProjectSlug || projects[0]?.slug || "";

    if (!nextProjectId) {
      if (activeProjectId) {
        setActiveProjectId("");
      }
      return;
    }

    if (activeProjectId !== nextProjectId) {
      setActiveProjectId(nextProjectId);
    }

    if (routeProjectSlug && routeProjectSlug !== nextProjectId) {
      void navigate(`/project/${nextProjectId}/overview`, { replace: true });
    }
  }, [activeProjectId, navigate, params.projectSlug, projects]);

  useEffect(() => {
    if (configurations.length === 0) {
      if (activeConfigurationId) {
        setActiveConfigurationId("");
      }
      return;
    }

    if (!configurations.some((configuration) => configuration.id === activeConfigurationId)) {
      setActiveConfigurationId(configurations[0].id);
    }
  }, [activeConfigurationId, configurations]);

  useEffect(() => {
    if (projectsQuery.error?.message) {
      setAppNotice(projectsQuery.error.message);
      return;
    }

    if (configurationsQuery.error?.message) {
      setAppNotice(configurationsQuery.error.message);
    }
  }, [configurationsQuery.error?.message, projectsQuery.error?.message]);

  const handleAssignConfigurations = async () => {
    if (!activeProject) {
      return;
    }

    await assignProjectConfigurationsMutation.mutateAsync({
      projectId: activeProject.id,
      sourceConfigurationId: selectedSourceConfigurationId || null,
      destinationConfigurationId: selectedDestinationConfigurationId || null,
    });

    await utils.projects.list.invalidate();
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      return;
    }

    const project = await createProjectMutation.mutateAsync({
      name,
      projectType: newProjectType,
      summary:
        newProjectSummary.trim() ||
        "A migration project for a specific source and destination pairing.",
      slug: generatedProjectSlug || undefined,
    });

    await utils.projects.list.invalidate();
    if (onProjectsPage) {
      setActiveProjectId("");
      void navigate("/projects");
    } else {
      setActiveProjectId(project.slug);
      void navigate(`/project/${project.slug}/overview`);
    }
    setNewProjectName("");
    setNewProjectType("migration");
    setNewProjectSummary("");
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setDeleteProjectId(projectId);
    setIsDeleteProjectDialogOpen(true);
  };

  const handleConfirmDeleteProject = async () => {
    const project = projects.find((item) => item.id === deleteProjectId);
    if (!project) {
      setIsDeleteProjectDialogOpen(false);
      setDeleteProjectId("");
      return;
    }

    await deleteProjectMutation.mutateAsync({ projectId: deleteProjectId });
    await utils.projects.list.invalidate();

    setActiveProjectId("");
    void navigate("/projects");

    setIsDeleteProjectDialogOpen(false);
    setDeleteProjectId("");
  };

  const openEditProjectDialog = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);

    if (!project) {
      return;
    }

    setActiveProjectId(project.slug);
    setEditProjectId(project.id);
    setEditProjectName(project.name);
    setEditProjectSlug(project.slug);
    setEditProjectSummary(project.summary);
    setEditProjectError(null);
    setIsEditProjectDialogOpen(true);
  };

  const handleUpdateProject = async (input: {
    projectId: string;
    name: string;
    summary: string;
    slug?: string;
  }) => {
    await updateProjectMutation.mutateAsync(input);
    await utils.projects.list.invalidate();
  };

  const handleSaveProjectEdit = async () => {
    if (!editProjectId) {
      return;
    }

    try {
      setEditProjectError(null);
      await handleUpdateProject({
        projectId: editProjectId,
        name: editProjectName,
        summary: editProjectSummary,
        slug: editProjectSlug.trim() || undefined,
      });
      setIsEditProjectDialogOpen(false);
    } catch (error) {
      setEditProjectError(error instanceof Error ? error.message : "Failed to update project");
    }
  };

  const handleCreateConfiguration = async (input: ConfigurationFormState) => {
    const configuration = await createConfigurationMutation.mutateAsync({
      name: input.name.trim(),
      productVersion: input.productVersion.trim(),
      environment: configurationFormToEnvironment(input),
    });

    setActiveConfigurationId(configuration.id);
    await utils.configurations.list.invalidate();
  };

  const handleSaveConfiguration = async (input: ConfigurationFormState) => {
    if (!activeConfiguration) {
      return;
    }

    await updateConfigurationMutation.mutateAsync({
      configurationId: activeConfiguration.id,
      name: input.name.trim(),
      productVersion: input.productVersion.trim(),
      environment: configurationFormToEnvironment(input),
    });

    await utils.configurations.list.invalidate();
    await utils.projects.list.invalidate();
  };

  const handleValidateConfiguration = async () => {
    if (!activeConfiguration) {
      return;
    }

    await validateConfigurationMutation.mutateAsync({
      configurationId: activeConfiguration.id,
    });

    await utils.configurations.list.invalidate();
  };

  const handleDeleteConfiguration = async (configurationId: string) => {
    const configuration = configurations.find((item) => item.id === configurationId);
    if (!configuration) {
      return;
    }

    const confirmed = window.confirm(`Delete the configuration "${configuration.name}"?`);
    if (!confirmed) {
      return;
    }

    const remainingConfigurations = configurations.filter((item) => item.id !== configurationId);
    await deleteConfigurationMutation.mutateAsync({ configurationId });
    await utils.configurations.list.invalidate();

    if (activeConfigurationId === configurationId) {
      setActiveConfigurationId(remainingConfigurations[0]?.id ?? "");
    }
  };

  const isBusy =
    projectsQuery.isLoading ||
    configurationsQuery.isLoading ||
    createProjectMutation.isPending ||
    deleteProjectMutation.isPending ||
    assignProjectConfigurationsMutation.isPending ||
    updateProjectMutation.isPending ||
    createConfigurationMutation.isPending ||
    updateConfigurationMutation.isPending ||
    validateConfigurationMutation.isPending ||
    deleteConfigurationMutation.isPending ||
    videosMutation.isPending;

  const rows = videosMutation.data?.items ?? [];
  const rowCount = videosMutation.data?.total ?? 0;
  const sourceConnected = Boolean(sourceConfiguration?.validatedEnvironment);
  const destinationConnected = Boolean(destinationConfiguration?.validatedEnvironment);
  const orderedChangelog = useMemo(
    () =>
      [...changelog].sort((left, right) => compareVersionsDescending(left.version, right.version)),
    [],
  );
  const currentVersion = orderedChangelog[0]?.version ?? "0.0";
  const homePath = "/projects";
  const apiOffline =
    Boolean(projectsQuery.error || configurationsQuery.error) &&
    projects.length === 0 &&
    configurations.length === 0;
  const showSelectedProjectInHeader = location.pathname.startsWith("/project");

  const outletContext: AppShellOutletContext = {
    activeConfiguration,
    activeConfigurationId,
    activeProject,
    activeProjectId: activeProject?.id ?? "",
    configurations,
    currentVersion,
    createConfigurationError: createConfigurationMutation.error?.message,
    deleteConfigurationError: deleteConfigurationMutation.error?.message,
    destinationConfiguration,
    destinationConnected,
    isBusy,
    onAssignConfigurations: () => void handleAssignConfigurations(),
    onCreateConfiguration: handleCreateConfiguration,
    onDeleteConfiguration: handleDeleteConfiguration,
    onDeleteProject: handleDeleteProject,
    onEditProject: openEditProjectDialog,
    onOpenCreateProjectDialog: () => setIsCreateDialogOpen(true),
    onRefresh: () => {
      void fetchVideos();
    },
    onSaveConfiguration: handleSaveConfiguration,
    onSelectConfiguration: setActiveConfigurationId,
    onSelectProject: setActiveProjectId,
    onValidateConfiguration: handleValidateConfiguration,
    orderedChangelog,
    paginationModel,
    projects,
    rowCount,
    rows,
    search,
    selectedDestinationConfigurationId,
    selectedSourceConfigurationId,
    setPaginationModel,
    setSearch,
    setSelectedDestinationConfigurationId,
    setSelectedSourceConfigurationId,
    saveConfigurationError: updateConfigurationMutation.error?.message,
    sourceConfiguration,
    sourceConnected,
    validateConfigurationError: validateConfigurationMutation.error?.message,
    videosError: videosMutation.error?.message,
    videosLoading: videosMutation.isPending,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="theme-root">
        <Container maxWidth="xl" className="app-shell">
          <Stack spacing={3}>
            <AppShellHeader
              activeProjectId={showSelectedProjectInHeader ? (activeProject?.slug ?? "") : ""}
              apiOffline={apiOffline}
              homePath={homePath}
              mode={mode}
              onCreateProject={() => setIsCreateDialogOpen(true)}
              onSelectProject={(projectSlug) => {
                setActiveProjectId(projectSlug);
                void navigate(`/project/${projectSlug}/overview`);
              }}
              onToggleMode={() => setMode((current) => (current === "light" ? "dark" : "light"))}
              projects={projects}
            />

            <Box className="loading-slot" aria-hidden={!isBusy}>
              {isBusy ? <LinearProgress /> : null}
            </Box>
            {apiOffline ? (
              <ApiOfflinePage
                message={
                  projectsQuery.error?.message ??
                  configurationsQuery.error?.message ??
                  "The API is currently unavailable."
                }
                onRetry={() => {
                  void projectsQuery.refetch();
                  void configurationsQuery.refetch();
                }}
              />
            ) : (
              <>
                <Outlet context={outletContext} />
              </>
            )}
          </Stack>
        </Container>

        <AppFooter currentVersion={currentVersion} />

        <ProjectDialogs
          projects={projects}
          create={{
            isOpen: isCreateDialogOpen,
            name: newProjectName,
            generatedSlug: generatedProjectSlug,
            summary: newProjectSummary,
            projectType: newProjectType,
            isPending: createProjectMutation.isPending,
            onClose: () => setIsCreateDialogOpen(false),
            onNameChange: setNewProjectName,
            onSummaryChange: setNewProjectSummary,
            onProjectTypeChange: setNewProjectType,
            onSubmit: () => void handleCreateProject(),
          }}
          edit={{
            isOpen: isEditProjectDialogOpen,
            projectId: editProjectId,
            name: editProjectName,
            slug: editProjectSlug,
            summary: editProjectSummary,
            error: editProjectError,
            isPending: updateProjectMutation.isPending,
            onClose: () => {
              setIsEditProjectDialogOpen(false);
              setEditProjectError(null);
            },
            onNameChange: setEditProjectName,
            onSlugChange: setEditProjectSlug,
            onSummaryChange: setEditProjectSummary,
            onSubmit: () => void handleSaveProjectEdit(),
          }}
          remove={{
            isOpen: isDeleteProjectDialogOpen,
            projectId: deleteProjectId,
            isPending: deleteProjectMutation.isPending,
            onClose: () => {
              setIsDeleteProjectDialogOpen(false);
              setDeleteProjectId("");
            },
            onSubmit: () => void handleConfirmDeleteProject(),
          }}
        />

        <AppNoticeSnackbar message={appNotice} onClose={() => setAppNotice(null)} />
      </div>
    </ThemeProvider>
  );
}

function useRevolutionAppContext() {
  return useOutletContext<AppShellOutletContext>();
}

export function ProjectsPageRoute() {
  const {
    activeProjectId,
    configurations,
    onDeleteProject,
    onEditProject,
    onOpenCreateProjectDialog,
    onSelectProject,
    projects,
  } = useRevolutionAppContext();

  return (
    <ProjectsPage
      projects={projects}
      activeProjectId={activeProjectId}
      configurations={configurations}
      onOpenCreateProjectDialog={onOpenCreateProjectDialog}
      onSelectProject={onSelectProject}
      onDeleteProject={onDeleteProject}
      onEditProject={onEditProject}
    />
  );
}

export function ConfigurationWorkspacePageRoute() {
  const context = useRevolutionAppContext();

  return (
    <ConfigurationWorkspacePage
      activeConfiguration={context.activeConfiguration}
      configurations={context.configurations}
      createConfigurationError={context.createConfigurationError}
      deleteConfigurationError={context.deleteConfigurationError}
      isBusy={context.isBusy}
      onCreateConfiguration={context.onCreateConfiguration}
      onDeleteConfiguration={context.onDeleteConfiguration}
      onSaveConfiguration={context.onSaveConfiguration}
      onSelectConfiguration={context.onSelectConfiguration}
      onValidateConfiguration={context.onValidateConfiguration}
      saveConfigurationError={context.saveConfigurationError}
      validateConfigurationError={context.validateConfigurationError}
    />
  );
}

export function HomeRoute() {
  const { activeProject, onSelectProject, projects } = useRevolutionAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (projects.length === 0) {
      void navigate("/projects", { replace: true });
      return;
    }

    if (activeProject?.slug && projects.some((project) => project.slug === activeProject.slug)) {
      onSelectProject(activeProject.slug);
      void navigate(`/project/${activeProject.slug}/overview`, { replace: true });
      return;
    }

    if (projects.length === 1 && projects[0]) {
      onSelectProject(projects[0].slug);
      void navigate(`/project/${projects[0].slug}/overview`, { replace: true });
      return;
    }

    void navigate("/projects", { replace: true });
  }, [activeProject?.slug, navigate, onSelectProject, projects]);

  return null;
}

export function OverviewPageRoute() {
  const {
    activeProject,
    destinationConfiguration,
    destinationConnected,
    rowCount,
    sourceConfiguration,
    sourceConnected,
  } = useRevolutionAppContext();

  return (
    <OverviewPage
      activeProject={activeProject}
      sourceConfiguration={sourceConfiguration}
      destinationConfiguration={destinationConfiguration}
      sourceConnected={sourceConnected}
      destinationConnected={destinationConnected}
      rowCount={rowCount}
    />
  );
}

export function ConfigurationPageRoute() {
  const context = useRevolutionAppContext();

  return (
    <ProjectConfigurationPage
      activeProject={context.activeProject}
      configurations={context.configurations}
      sourceConfiguration={context.sourceConfiguration}
      destinationConfiguration={context.destinationConfiguration}
      selectedSourceConfigurationId={context.selectedSourceConfigurationId}
      selectedDestinationConfigurationId={context.selectedDestinationConfigurationId}
      setSelectedSourceConfigurationId={context.setSelectedSourceConfigurationId}
      setSelectedDestinationConfigurationId={context.setSelectedDestinationConfigurationId}
      onAssignConfigurations={context.onAssignConfigurations}
      isBusy={context.isBusy}
    />
  );
}

export function VideosPageRoute() {
  const context = useRevolutionAppContext();

  return (
    <VideosPage
      activeProject={context.activeProject}
      search={context.search}
      setSearch={context.setSearch}
      rows={context.rows}
      rowCount={context.rowCount}
      isLoading={context.videosLoading}
      error={context.videosError}
      paginationModel={context.paginationModel}
      setPaginationModel={context.setPaginationModel}
      connected={context.sourceConnected}
    />
  );
}

export function ChangeLogPageRoute() {
  const { orderedChangelog } = useRevolutionAppContext();
  return <ChangeLogPage entries={orderedChangelog} />;
}

export function MyProfilePageRoute() {
  return <MyProfilePage />;
}

export function RolePermissionsEditorRoute() {
  return <RolePermissionsEditorPage />;
}

export function ProjectWorkspaceRoute() {
  const context = useRevolutionAppContext();
  const location = useLocation();
  const onProjectPage = location.pathname.startsWith("/project");

  return (
    <Stack spacing={3}>
      {onProjectPage ? (
        <Paper className="project-shell">
          <Typography className="project-shell-label">Project Workspace</Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <ProjectWorkspaceTitle
              name={context.activeProject?.name}
              summary={context.activeProject?.summary}
            />

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="project-tabs">
              {projectNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "project-tab project-tab-active" : "project-tab"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Outlet context={context} />
    </Stack>
  );
}
