import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import AddRounded from '@mui/icons-material/AddRounded'
import CloudDoneRounded from '@mui/icons-material/CloudDoneRounded'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import DarkModeRounded from '@mui/icons-material/DarkModeRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import LightModeRounded from '@mui/icons-material/LightModeRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import SettingsEthernetRounded from '@mui/icons-material/SettingsEthernetRounded'
import StorageRounded from '@mui/icons-material/StorageRounded'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid'
import type {
  MigrationProject,
  RevAuthType,
  RevEnvironmentInput,
  RevEnvironmentValidation,
  SourceVideoRecord,
} from '@revive/shared'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'
import { changelog, type ChangeLogEntry } from '../changelog'
import { trpc } from '../main'
import '../App.css'

const ACTIVE_PROJECT_STORAGE_KEY = 'revive-active-project-id'

const columns: GridColDef<SourceVideoRecord>[] = [
  { field: 'id', headerName: 'Video ID', minWidth: 180, flex: 0.9 },
  { field: 'title', headerName: 'Title', minWidth: 280, flex: 1.6 },
  { field: 'owner', headerName: 'Owner', minWidth: 180, flex: 0.9 },
  { field: 'uploader', headerName: 'Uploader', minWidth: 180, flex: 0.9 },
  {
    field: 'categories',
    headerName: 'Categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    renderCell: ({ row }) => row.categories.join(', '),
  },
  {
    field: 'tags',
    headerName: 'Tags',
    minWidth: 220,
    flex: 1,
    sortable: false,
    renderCell: ({ row }) => row.tags.join(', '),
  },
  { field: 'duration', headerName: 'Duration', minWidth: 120, flex: 0.5 },
  { field: 'status', headerName: 'Rev Status', minWidth: 150, flex: 0.7 },
  {
    field: 'isUnlisted',
    headerName: 'Visibility',
    minWidth: 130,
    flex: 0.6,
    renderCell: ({ value }) => (
      <Chip size="small" color={value ? 'warning' : 'success'} label={value ? 'Unlisted' : 'Listed'} />
    ),
  },
]

const projectNavItems = [
  { to: '/project/overview', label: 'Overview' },
  { to: '/project/configuration', label: 'Configuration' },
  { to: '/project/videos', label: 'Videos' },
]

type AppShellOutletContext = {
  activeProject: MigrationProject | undefined
  activeProjectId: string
  connected: boolean
  currentVersion: string
  isBusy: boolean
  orderedChangelog: ChangeLogEntry[]
  paginationModel: GridPaginationModel
  projects: MigrationProject[]
  rowCount: number
  rows: SourceVideoRecord[]
  search: string
  setPaginationModel: (model: GridPaginationModel) => void
  setSearch: (value: string) => void
  validateError?: string
  videosError?: string
  videosLoading: boolean
  onDeleteProject: (projectId: string) => void
  onRefresh: () => void
  onSelectProject: (projectId: string) => void
  onValidate: () => void
} & Pick<
  ConfigurationPageProps,
  | 'apiKey'
  | 'authType'
  | 'password'
  | 'secret'
  | 'setApiKey'
  | 'setAuthType'
  | 'setPassword'
  | 'setSecret'
  | 'setUrl'
  | 'setUsername'
  | 'submittedEnvironment'
  | 'url'
  | 'username'
  | 'validatedEnvironment'
>

function compareVersionsDescending(left: string, right: string) {
  return right.localeCompare(left, undefined, { numeric: true, sensitivity: 'base' })
}

function loadActiveProjectId() {
  const saved = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)
  return saved || 'default'
}

function ReviveLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 64 64" aria-hidden="true" role="presentation">
      <rect width="64" height="64" rx="18" fill="#14323f" />
      <rect x="11" y="16" width="30" height="32" rx="8" fill="#f7f2ea" />
      <path fill="#14323f" d="M24 25.5v13l11-6.5z" />
      <path
        fill="#f6b05a"
        d="M42 24.5l11-5.5a3 3 0 0 1 4.34 2.68v20.64A3 3 0 0 1 53 45l-11-5.5z"
      />
      <circle cx="19" cy="22" r="2.25" fill="#f6b05a" />
      <circle cx="19" cy="42" r="2.25" fill="#f6b05a" />
    </svg>
  )
}

export function AppShell() {
  const utils = trpc.useUtils()
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = window.localStorage.getItem('revive-color-mode')
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [activeProjectId, setActiveProjectId] = useState<string>(() => loadActiveProjectId())
  const [authType, setAuthType] = useState<RevAuthType>('apiKey')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [secret, setSecret] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [search, setSearch] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSummary, setNewProjectSummary] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })

  const deferredSearch = useDeferredValue(search)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#f6b05a' : '#14323f',
          },
          secondary: {
            main: mode === 'dark' ? '#8fd3c3' : '#0f766e',
          },
          background: {
            default: mode === 'dark' ? '#101a1f' : '#f4efe6',
            paper: mode === 'dark' ? '#16252d' : '#fffaf2',
          },
        },
        shape: {
          borderRadius: 18,
        },
      }),
    [mode],
  )

  const projectsQuery = trpc.projects.list.useQuery()
  const createProjectMutation = trpc.projects.create.useMutation()
  const deleteProjectMutation = trpc.projects.delete.useMutation()
  const validateMutation = trpc.projects.validateSourceEnvironment.useMutation()
  const videosMutation = trpc.projects.listSourceVideos.useMutation()
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects],
  )

  const submittedEnvironment = activeProject?.sourceEnvironment ?? null
  const validatedEnvironment = activeProject?.validatedEnvironment ?? null

  const currentEnvironment = useMemo<RevEnvironmentInput>(() => {
    if (authType === 'apiKey') {
      return {
        url,
        authType,
        apiKey,
        secret,
      }
    }

    return {
      url,
      authType,
      username,
      password,
    }
  }, [apiKey, authType, password, secret, url, username])

  const fetchVideos = useEffectEvent(async () => {
    await videosMutation.mutateAsync({
      projectId: activeProjectId,
      search: deferredSearch,
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    })
  })

  useEffect(() => {
    if (!submittedEnvironment) {
      return
    }

    void fetchVideos()
  }, [deferredSearch, paginationModel.page, paginationModel.pageSize, submittedEnvironment])

  useEffect(() => {
    if (!activeProject) {
      return
    }

    const source = activeProject.sourceEnvironment
    if (!source) {
      setAuthType('apiKey')
      setUrl('')
      setApiKey('')
      setSecret('')
      setUsername('')
      setPassword('')
      return
    }

    setUrl(source.url)
    setAuthType(source.authType)
    if (source.authType === 'apiKey') {
      setApiKey(source.apiKey)
      setSecret(source.secret)
      setUsername('')
      setPassword('')
    } else {
      setUsername(source.username)
      setPassword(source.password)
      setApiKey('')
      setSecret('')
    }
  }, [activeProject])

  useEffect(() => {
    window.localStorage.setItem('revive-color-mode', mode)
    document.documentElement.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId)
  }, [activeProjectId])

  useEffect(() => {
    if (projects.length === 0) {
      return
    }

    if (!projects.some((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0].id)
    }
  }, [activeProjectId, projects])

  const handleValidate = async () => {
    if (!activeProject) {
      return
    }

    await validateMutation.mutateAsync({
      projectId: activeProject.id,
      environment: currentEnvironment,
    })
    await utils.projects.list.invalidate()

    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  const handleCreateProject = async () => {
    const name = newProjectName.trim()
    if (!name) {
      return
    }

    const project = await createProjectMutation.mutateAsync({
      name,
      summary:
        newProjectSummary.trim() || 'A migration project for a specific source and destination pairing.',
    })

    setActiveProjectId(project.id)
    await utils.projects.list.invalidate()
    setNewProjectName('')
    setNewProjectSummary('')
    setIsCreateDialogOpen(false)
  }

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project || projects.length <= 1 || project.id === 'default') {
      return
    }

    const confirmed = window.confirm(
      `Delete the project "${project.name}"? This will remove its saved setup from this browser.`,
    )

    if (!confirmed) {
      return
    }

    const remainingProjects = projects.filter((item) => item.id !== projectId)
    await deleteProjectMutation.mutateAsync({ projectId })
    await utils.projects.list.invalidate()

    if (activeProjectId === projectId) {
      setActiveProjectId(remainingProjects[0].id)
    }
  }

  const isBusy =
    projectsQuery.isLoading ||
    createProjectMutation.isPending ||
    deleteProjectMutation.isPending ||
    validateMutation.isPending ||
    videosMutation.isPending
  const rows = videosMutation.data?.items ?? []
  const rowCount = videosMutation.data?.total ?? 0
  const connected = Boolean(validatedEnvironment)
  const orderedChangelog = useMemo(
    () => [...changelog].sort((left, right) => compareVersionsDescending(left.version, right.version)),
    [],
  )
  const currentVersion = orderedChangelog[0]?.version ?? '0.0'
  const homePath =
    projects.length === 1 && projects[0]?.id === 'default'
      ? '/project/overview'
      : '/projects'
  const apiOffline = Boolean(projectsQuery.error) && projects.length === 0

  const outletContext: AppShellOutletContext = {
    activeProject,
    activeProjectId,
    apiKey,
    authType,
    connected,
    currentVersion,
    isBusy,
    onDeleteProject: handleDeleteProject,
    onRefresh: () => {
      if (!submittedEnvironment || !activeProject) {
        return
      }

      void fetchVideos()
    },
    onSelectProject: setActiveProjectId,
    onValidate: () => void handleValidate(),
    orderedChangelog,
    paginationModel,
    password,
    projects,
    rowCount,
    rows,
    search,
    secret,
    setApiKey,
    setAuthType,
    setPaginationModel,
    setPassword,
    setSearch,
    setSecret,
    setUrl,
    setUsername,
    submittedEnvironment,
    url,
    username,
    validatedEnvironment,
    validateError: validateMutation.error?.message,
    videosError: videosMutation.error?.message,
    videosLoading: videosMutation.isPending,
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="theme-root">
        <Container maxWidth="xl" className="app-shell">
          <Stack spacing={3}>
            <Paper className="topbar">
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', lg: 'center' }}
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
                  <ReviveLogo />
                  <Box>
                    <Typography className="brand-mark">REVIVE</Typography>
                    <Typography className="brand-copy">Rev Integration and Validation Engine</Typography>
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <FormControl size="small" className="project-select">
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      value={apiOffline ? '__offline__' : activeProjectId}
                      label="Project"
                      disabled={apiOffline || projects.length === 0}
                      onChange={(event) => setActiveProjectId(event.target.value)}
                      renderValue={(value) => {
                        if (value === '__offline__') {
                          return 'API offline'
                        }

                        return (
                          projects.find((project) => project.id === value)?.name ??
                          'Select a project'
                        )
                      }}
                    >
                      {apiOffline ? (
                        <MenuItem value="__offline__">API offline</MenuItem>
                      ) : null}
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Tooltip title="Create new project">
                    <IconButton
                      className="theme-toggle"
                      color="inherit"
                      disabled={apiOffline}
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <AddRounded />
                    </IconButton>
                  </Tooltip>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="nav-links">
                    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                      <IconButton
                        className="theme-toggle"
                        onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
                        color="inherit"
                      >
                        {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            {isBusy ? <LinearProgress /> : null}
            {apiOffline ? (
              <ApiOfflinePage
                message={projectsQuery.error?.message ?? 'The API is currently unavailable.'}
                onRetry={() => void projectsQuery.refetch()}
              />
            ) : (
              <>
                {projectsQuery.error ? <Alert severity="error">{projectsQuery.error.message}</Alert> : null}
                <Outlet context={outletContext} />
              </>
            )}
          </Stack>
        </Container>

        <Box className="app-footer-wrap">
          <Container maxWidth="xl" className="app-footer-container">
            <Paper className="app-footer">
              <Link to="/changelog" className="footer-link">
                v{currentVersion}
              </Link>
            </Paper>
          </Container>
        </Box>

        <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <TextField
                label="Project name"
                placeholder="New Pre-Prod Rollout"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="Summary"
                placeholder="Describe what this migration project is for."
                value={newProjectSummary}
                onChange={(event) => setNewProjectSummary(event.target.value)}
                fullWidth
                multiline
                minRows={4}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => void handleCreateProject()}
              disabled={!newProjectName.trim() || createProjectMutation.isPending}
            >
              Create project
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  )
}

function useReviveAppContext() {
  return useOutletContext<AppShellOutletContext>()
}

function ApiOfflinePage({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Stack spacing={3}>
      <PageIntro
        title="API Offline"
        subtitle="REVIVE cannot reach the backend service right now."
      />

      <Paper className="panel panel-full offline-panel">
        <Stack spacing={2}>
          <Alert severity="error">
            {message}
          </Alert>
          <Typography color="text.secondary">
            Check that the REVIVE API is running and that its MongoDB connection is available, then retry.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" onClick={onRetry}>
              Retry connection
            </Button>
            <Button component={Link} to="/changelog" variant="outlined">
              View change log
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

export function ProjectsPageRoute() {
  const { activeProjectId, onDeleteProject, onSelectProject, projects } = useReviveAppContext()

  return (
    <ProjectsPage
      projects={projects}
      activeProjectId={activeProjectId}
      onSelectProject={onSelectProject}
      onDeleteProject={onDeleteProject}
    />
  )
}

export function DefaultProjectHomeRoute() {
  const { onSelectProject, projects } = useReviveAppContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (projects.length === 0) {
      return
    }

    const defaultProject = projects.find((project) => project.id === 'default') ?? projects[0]

    if (defaultProject) {
      onSelectProject(defaultProject.id)
    }

    void navigate('/project/overview', { replace: true })
  }, [navigate, onSelectProject, projects])

  return null
}

export function OverviewPageRoute() {
  const { activeProject, connected, rowCount } = useReviveAppContext()

  return <OverviewPage activeProject={activeProject} connected={connected} rowCount={rowCount} />
}

export function ConfigurationPageRoute() {
  const context = useReviveAppContext()

  return (
    <ConfigurationPage
      activeProject={context.activeProject}
      authType={context.authType}
      url={context.url}
      apiKey={context.apiKey}
      secret={context.secret}
      username={context.username}
      password={context.password}
      setAuthType={context.setAuthType}
      setUrl={context.setUrl}
      setApiKey={context.setApiKey}
      setSecret={context.setSecret}
      setUsername={context.setUsername}
      setPassword={context.setPassword}
      isBusy={context.isBusy}
      submittedEnvironment={context.submittedEnvironment}
      validatedEnvironment={context.validatedEnvironment}
      validateError={context.validateError}
      onValidate={context.onValidate}
      onRefresh={context.onRefresh}
    />
  )
}

export function VideosPageRoute() {
  const context = useReviveAppContext()

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
      connected={context.connected}
    />
  )
}

export function ChangeLogPageRoute() {
  const { orderedChangelog } = useReviveAppContext()

  return <ChangeLogPage entries={orderedChangelog} />
}

export function ProjectWorkspaceRoute() {
  const context = useReviveAppContext()
  const location = useLocation()
  const onProjectPage = location.pathname.startsWith('/project')

  return (
    <Stack spacing={3}>
      {onProjectPage ? (
        <Paper className="project-shell">
          <Typography className="project-shell-label">
            Project Workspace
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography variant="h5">{context.activeProject?.name ?? 'Project'}</Typography>
              <Typography color="text.secondary">
                {context.activeProject?.summary ?? 'Project overview and migration setup.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="project-tabs">
              {projectNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'project-tab project-tab-active' : 'project-tab')}
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
  )
}

function ProjectsPage({
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
}: {
  projects: MigrationProject[]
  activeProjectId: string
  onSelectProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}) {
  const navigate = useNavigate()

  return (
    <Stack spacing={3}>
      <PageIntro title="Projects" subtitle="All migration projects are listed here." />

      <Paper className="panel panel-full">
        <Stack spacing={2}>
          {projects.map((project) => (
            <Paper
              key={project.id}
              component="button"
              type="button"
              variant="outlined"
              className={`project-card ${project.id === activeProjectId ? 'project-card-active' : ''}`}
              onClick={() => onSelectProject(project.id)}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography color="text.secondary">{project.summary}</Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                  className="project-card-actions"
                >
                  {project.validatedEnvironment ? (
                    <Chip size="small" label="Configured" color="success" />
                  ) : (
                    <Alert
                      severity="warning"
                      className="project-setup-alert"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectProject(project.id)
                        navigate('/project/configuration')
                      }}
                    >
                      Setup needed
                    </Alert>
                  )}
                  {project.id !== 'default' ? (
                    <Tooltip title="Delete project">
                      <span className="project-delete-action">
                        <IconButton
                          color="error"
                          disabled={projects.length <= 1}
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteProject(project.id)
                          }}
                        >
                          <DeleteOutlineRounded />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

function OverviewPage({
  activeProject,
  connected,
  rowCount,
}: {
  activeProject: MigrationProject | undefined
  connected: boolean
  rowCount: number
}) {
  return (
    <Stack spacing={3}>
      <PageIntro title={activeProject?.name ?? 'Overview'} subtitle={activeProject?.summary ?? 'Project overview'} />

      <section className="content-grid">
        <Paper className="panel">
          <PanelTitle
            icon={<CloudDoneRounded />}
            title="Project Status"
            subtitle="A summary of the current migration project."
          />
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <MetricPill label="Project" value={activeProject?.name ?? 'None'} />
            <MetricPill label="Source connection" value={connected ? 'Connected' : 'Not connected'} />
            <MetricPill label="Videos loaded" value={String(rowCount)} />
          </Stack>
        </Paper>

        <Paper className="panel">
          <PanelTitle
            icon={<DashboardRounded />}
            title="Project Details"
            subtitle="Core information for the selected migration project."
          />
          {activeProject ? (
            <Stack spacing={2}>
              <Fact label="Project" value={activeProject.name} />
              <Fact label="Summary" value={activeProject.summary} />
              <Fact label="Created" value={formatTimestamp(activeProject.createdAt)} />
              <Fact label="Updated" value={formatTimestamp(activeProject.updatedAt)} />
            </Stack>
          ) : (
            <Alert severity="warning">Select a project to view its overview.</Alert>
          )}
        </Paper>
      </section>
    </Stack>
  )
}

type ConfigurationPageProps = {
  activeProject: MigrationProject | undefined
  authType: RevAuthType
  url: string
  apiKey: string
  secret: string
  username: string
  password: string
  setAuthType: (value: RevAuthType) => void
  setUrl: (value: string) => void
  setApiKey: (value: string) => void
  setSecret: (value: string) => void
  setUsername: (value: string) => void
  setPassword: (value: string) => void
  isBusy: boolean
  submittedEnvironment: RevEnvironmentInput | null
  validatedEnvironment: RevEnvironmentValidation | null
  validateError?: string
  onValidate: () => void
  onRefresh: () => void
}

function ConfigurationPage({
  activeProject,
  authType,
  url,
  apiKey,
  secret,
  username,
  password,
  setAuthType,
  setUrl,
  setApiKey,
  setSecret,
  setUsername,
  setPassword,
  isBusy,
  submittedEnvironment,
  validatedEnvironment,
  validateError,
  onValidate,
  onRefresh,
}: ConfigurationPageProps) {
  return (
    <Stack spacing={3}>
      <PageIntro
        title="Configuration"
        subtitle={`Configure the source environment for ${activeProject?.name ?? 'the selected project'}.`}
      />

      <section className="content-grid">
        <Paper className="panel">
          <PanelTitle
            icon={<SettingsEthernetRounded />}
            title="Connect Your Source Library"
            subtitle="These settings belong to the selected project."
          />
          <Stack spacing={2}>
            <TextField
              label="Source Rev URL"
              placeholder="https://company.rev.vbrick.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="auth-type-label">Authentication</InputLabel>
              <Select
                labelId="auth-type-label"
                value={authType}
                label="Authentication"
                onChange={(event) => setAuthType(event.target.value as RevAuthType)}
              >
                <MenuItem value="apiKey">API key + secret</MenuItem>
                <MenuItem value="userPassword">Username + password</MenuItem>
              </Select>
            </FormControl>

            {authType === 'apiKey' ? (
              <>
                <TextField label="API key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} fullWidth />
                <TextField label="Secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} fullWidth />
              </>
            ) : (
              <>
                <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} fullWidth />
                <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
              </>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" size="large" onClick={onValidate} disabled={isBusy}>
                Save and verify
              </Button>
              <Button variant="outlined" size="large" disabled={!submittedEnvironment || isBusy} onClick={onRefresh}>
                Refresh library
              </Button>
            </Stack>

            {validateError ? <Alert severity="error">{validateError}</Alert> : null}
          </Stack>
        </Paper>

        <Paper className="panel">
          <PanelTitle
            icon={<CloudDoneRounded />}
            title="Connection Summary"
            subtitle="REVIVE confirms the source environment details for this project."
          />
          {validatedEnvironment ? (
            <Stack spacing={2}>
              <Fact label="Project" value={activeProject?.name ?? 'No project'} />
              <Fact label="URL" value={validatedEnvironment.url} />
              <Fact label="Account ID" value={validatedEnvironment.accountId ?? 'Unavailable'} />
              <Fact label="Rev version" value={validatedEnvironment.revVersion ?? 'Unavailable'} />
              <Fact label="Validated at" value={formatTimestamp(validatedEnvironment.validatedAt)} />
            </Stack>
          ) : (
            <Alert severity="warning">Connect a source environment to view its details here.</Alert>
          )}
        </Paper>
      </section>
    </Stack>
  )
}

function VideosPage({
  activeProject,
  search,
  setSearch,
  rows,
  rowCount,
  isLoading,
  error,
  paginationModel,
  setPaginationModel,
  connected,
}: {
  activeProject: MigrationProject | undefined
  search: string
  setSearch: (value: string) => void
  rows: SourceVideoRecord[]
  rowCount: number
  isLoading: boolean
  error?: string
  paginationModel: GridPaginationModel
  setPaginationModel: (model: GridPaginationModel) => void
  connected: boolean
}) {
  return (
    <Stack spacing={3}>
      <PageIntro
        title="Videos"
        subtitle={`Browse the source environment attached to ${activeProject?.name ?? 'the selected project'}.`}
      />

      {!connected ? (
        <Alert severity="warning">
          Connect a source environment on the Configuration page before browsing videos.
        </Alert>
      ) : null}

      <Paper className="panel panel-full">
        <PanelTitle
          icon={<SearchRounded />}
          title="Source Video Library"
          subtitle="Source videos from the connected Rev environment."
        />
        <Stack spacing={2}>
          <TextField
            label="Search the source library"
            placeholder="Title, ID, tags, owners, categories..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPaginationModel({
                ...paginationModel,
                page: 0,
              })
            }}
            fullWidth
          />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box className="grid-frame">
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              rowCount={rowCount}
              loading={isLoading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}

function ChangeLogPage({ entries }: { entries: ChangeLogEntry[] }) {
  return (
    <Stack spacing={3}>
      <PageIntro
        title="Change Log"
        subtitle="A running feature log so operators and stakeholders can see what is available and what is coming next."
      />

      <Paper className="panel panel-full">
        <PanelTitle
          icon={<StorageRounded />}
          title="What’s New in REVIVE"
          subtitle="Recent updates and upcoming capabilities are tracked here for visibility."
        />
        <Stack spacing={2}>
          {entries.map((entry) => (
            <ChangeLogCard key={entry.version} entry={entry} />
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

function PageIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Paper className="page-intro">
      <Typography variant="h3" className="page-title">
        {title}
      </Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  )
}

function PanelTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Stack spacing={1.5} mb={2.5}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box className="panel-icon">{icon}</Box>
        <Typography variant="h5">{title}</Typography>
      </Stack>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Stack>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" className="metric-pill metric-pill-default">
      <Typography className="metric-pill-label">{label}</Typography>
      <Typography className="metric-pill-value">{value}</Typography>
    </Paper>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box className="fact-block">
      <Typography className="fact-label">{label}</Typography>
      <Typography className="fact-value">{value}</Typography>
    </Box>
  )
}

function ChangeLogCard({ entry }: { entry: ChangeLogEntry }) {
  return (
    <Paper variant="outlined" className="changelog-card">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
      >
        <Box maxWidth={760}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" mb={1}>
            <Chip size="small" label={`Version ${entry.version}`} />
            <Chip
              size="small"
              label={entry.status}
              color={
                entry.status === 'Live'
                  ? 'success'
                  : entry.status === 'In Progress'
                    ? 'info'
                    : 'default'
              }
            />
            <Typography variant="body2" color="text.secondary">
              {entry.date}
            </Typography>
          </Stack>
          <Typography variant="h6" mb={0.75}>
            {entry.title}
          </Typography>
          <Typography color="text.secondary">{entry.summary}</Typography>
        </Box>
        <Box className="changelog-points">
          {entry.highlights.map((highlight) => (
            <Typography key={highlight} variant="body2" className="changelog-point">
              {highlight}
            </Typography>
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
