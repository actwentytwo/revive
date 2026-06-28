import type { ReactNode } from 'react'
import CloudDoneRounded from '@mui/icons-material/CloudDoneRounded'
import StorageRounded from '@mui/icons-material/StorageRounded'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeLogEntry } from '../../changelog'
import type { ProjectType, RevAuthType, RevEnvironmentInput, SavedConfiguration } from '@revive/shared'
import { Link } from 'react-router-dom'
import './PageChrome.css'

export type ConfigurationFormState = {
  name: string
  productVersion: string
  authType: RevAuthType
  url: string
  apiKey: string
  secret: string
  username: string
  password: string
}

const DEFAULT_VBRICK_VERSIONS = ['v6.0', 'v7.3', 'v8.1', 'v8.6']

export function normalizeVbrickVersion(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  return /^v/i.test(trimmed) ? `v${trimmed.slice(1)}` : `v${trimmed}`
}

export function getAvailableVbrickVersions(): string[] {
  const configuredRaw = import.meta.env.VITE_VBRICK_VERSIONS as string | undefined
  const configured: string[] = configuredRaw
    ? configuredRaw
        .split(',')
        .map((value: string) => normalizeVbrickVersion(value))
        .filter((value: string) => value.length > 0)
    : []

  const versions = configured.length > 0 ? configured : DEFAULT_VBRICK_VERSIONS
  return Array.from(new Set<string>(versions))
}

export function compareVersionsDescending(left: string, right: string) {
  return right.localeCompare(left, undefined, { numeric: true, sensitivity: 'base' })
}

export function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatProjectType(projectType: ProjectType) {
  switch (projectType) {
    case 'migration':
      return 'Migration'
    default:
      return projectType
  }
}

export function formatConfigurationLabel(configuration: SavedConfiguration) {
  return configuration.productVersion
    ? `${configuration.name} (${normalizeVbrickVersion(configuration.productVersion)})`
    : configuration.name
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function emptyConfigurationFormState(): ConfigurationFormState {
  return {
    name: '',
    productVersion: '',
    authType: 'apiKey',
    url: '',
    apiKey: '',
    secret: '',
    username: '',
    password: '',
  }
}

export function formStateFromConfiguration(configuration?: SavedConfiguration): ConfigurationFormState {
  if (!configuration) {
    return emptyConfigurationFormState()
  }

  if (configuration.environment.authType === 'apiKey') {
    return {
      name: configuration.name,
      productVersion: normalizeVbrickVersion(configuration.productVersion),
      authType: 'apiKey',
      url: configuration.environment.url,
      apiKey: configuration.environment.apiKey,
      secret: configuration.environment.secret,
      username: '',
      password: '',
    }
  }

  return {
    name: configuration.name,
    productVersion: normalizeVbrickVersion(configuration.productVersion),
    authType: 'userPassword',
    url: configuration.environment.url,
    apiKey: '',
    secret: '',
    username: configuration.environment.username,
    password: configuration.environment.password,
  }
}

export function configurationFormToEnvironment(formState: ConfigurationFormState): RevEnvironmentInput {
  if (formState.authType === 'apiKey') {
    return {
      url: formState.url,
      authType: 'apiKey',
      apiKey: formState.apiKey,
      secret: formState.secret,
    }
  }

  return {
    url: formState.url,
    authType: 'userPassword',
    username: formState.username,
    password: formState.password,
  }
}

export function isConfigurationFormReady(formState: ConfigurationFormState) {
  if (!formState.name.trim() || !formState.url.trim()) {
    return false
  }

  if (formState.authType === 'apiKey') {
    return Boolean(formState.apiKey.trim() && formState.secret.trim())
  }

  return Boolean(formState.username.trim() && formState.password.trim())
}

export function PageIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Paper className="page-intro">
      <Typography variant="h3" className="page-title">
        {title}
      </Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  )
}

export function PageIntroWithIcon({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Paper className="page-intro">
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Box className="panel-icon">{icon}</Box>
        <Typography variant="h3" className="page-title">
          {title}
        </Typography>
      </Stack>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  )
}

export function PanelTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
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

export function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" className="metric-pill metric-pill-default">
      <Typography className="metric-pill-label">{label}</Typography>
      <Typography className="metric-pill-value">{value}</Typography>
    </Paper>
  )
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box className="fact-block">
      <Typography className="fact-label">{label}</Typography>
      <Typography className="fact-value">{value}</Typography>
    </Box>
  )
}

export function ChangeLogCard({ entry }: { entry: ChangeLogEntry }) {
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
              color={entry.status === 'Live' ? 'success' : entry.status === 'In Progress' ? 'info' : 'default'}
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
          {entry.highlights.map((highlight: string) => (
            <Typography key={highlight} variant="body2" className="changelog-point">
              {highlight}
            </Typography>
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}

export function ConfigurationEditorFields({
  idPrefix,
  formState,
  setField,
}: {
  idPrefix: string
  formState: ConfigurationFormState
  setField: (field: keyof ConfigurationFormState, value: string) => void
}) {
  const availableVbrickVersions = getAvailableVbrickVersions()

  return (
    <>
      <TextField
        label="Instance name"
        value={formState.name}
        onChange={(event) => setField('name', event.target.value)}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel id={`${idPrefix}-vbrick-version-label`}>vBrick version</InputLabel>
        <Select
          labelId={`${idPrefix}-vbrick-version-label`}
          label="vBrick version"
          value={formState.productVersion}
          onChange={(event) => setField('productVersion', event.target.value)}
        >
          <MenuItem value="">Not set</MenuItem>
          {availableVbrickVersions.map((version) => (
            <MenuItem key={version} value={version}>
              {version}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="API URL"
        placeholder="https://company.rev.vbrick.com"
        value={formState.url}
        onChange={(event) => setField('url', event.target.value)}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel id={`${idPrefix}-configuration-auth-type-label`}>Authentication</InputLabel>
        <Select
          labelId={`${idPrefix}-configuration-auth-type-label`}
          label="Authentication"
          value={formState.authType}
          onChange={(event) => setField('authType', event.target.value as RevAuthType)}
        >
          <MenuItem value="apiKey">API key + secret</MenuItem>
          <MenuItem value="userPassword">Username + password</MenuItem>
        </Select>
      </FormControl>

      {formState.authType === 'apiKey' ? (
        <>
          <TextField label="API key" value={formState.apiKey} onChange={(event) => setField('apiKey', event.target.value)} fullWidth />
          <TextField label="Secret" type="password" value={formState.secret} onChange={(event) => setField('secret', event.target.value)} fullWidth />
        </>
      ) : (
        <>
          <TextField label="Username" value={formState.username} onChange={(event) => setField('username', event.target.value)} fullWidth />
          <TextField label="Password" type="password" value={formState.password} onChange={(event) => setField('password', event.target.value)} fullWidth />
        </>
      )}
    </>
  )
}

export function ConfigurationSummaryPanel({
  title,
  subtitle,
  configuration,
  emptyMessage,
  className = '',
  dense = false,
}: {
  title: string
  subtitle: string
  configuration: SavedConfiguration | undefined
  emptyMessage: string
  className?: string
  dense?: boolean
}) {
  const facts = configuration
    ? [
        { label: 'Configuration', value: configuration.name },
        {
          label: 'vBrick version',
          value: configuration.productVersion ? normalizeVbrickVersion(configuration.productVersion) : 'Not set',
        },
        { label: 'URL', value: configuration.environment.url },
        {
          label: 'Authentication',
          value: configuration.environment.authType === 'apiKey' ? 'API key + secret' : 'Username + password',
        },
        {
          label: 'Status',
          value: configuration.validatedEnvironment ? 'Validated and ready' : 'Saved but not yet validated',
        },
        ...(configuration.validatedEnvironment
          ? [
              { label: 'Account ID', value: configuration.validatedEnvironment.accountId ?? 'Unavailable' },
              { label: 'API version', value: configuration.validatedEnvironment.revVersion ?? 'Unavailable' },
              { label: 'Validated at', value: formatTimestamp(configuration.validatedEnvironment.validatedAt) },
            ]
          : []),
      ]
    : []

  return (
    <Paper className={`panel ${className}`.trim()}>
      <PanelTitle icon={<CloudDoneRounded />} title={title} subtitle={subtitle} />
      {configuration ? (
        dense ? (
          <Box className="configuration-summary-grid">
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </Box>
        ) : (
          <Stack spacing={2}>
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </Stack>
        )
      ) : (
        <Alert severity="warning">{emptyMessage}</Alert>
      )}
    </Paper>
  )
}

export function ChangeLogPage({ entries }: { entries: ChangeLogEntry[] }) {
  return (
    <Stack spacing={3}>
      <PageIntro title="Change Log" subtitle="A running feature log so operators and stakeholders can see what is available and what is coming next." />

      <Paper className="panel panel-full">
        <PanelTitle icon={<StorageRounded />} title="What’s New in REVOLUTION" subtitle="Recent updates and upcoming capabilities are tracked here for visibility." />
        <Stack spacing={2}>
          {entries.map((entry) => (
            <ChangeLogCard key={entry.version} entry={entry} />
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

export function ApiOfflinePage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Stack spacing={3}>
      <PageIntro title="API Offline" subtitle="REVOLUTION cannot reach the backend service right now." />

      <Paper className="panel panel-full offline-panel">
        <Stack spacing={2}>
          <Alert severity="error">{message}</Alert>
          <Typography color="text.secondary">
            Check that the API and MongoDB are running, then retry.
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

export function ProjectWorkspaceTitle({ name, summary }: { name?: string; summary?: string }) {
  return (
    <Box>
      <Typography variant="h5">{name ?? 'Project'}</Typography>
      <Typography color="text.secondary">{summary ?? 'Project overview and migration setup.'}</Typography>
    </Box>
  )
}
