import AddRounded from '@mui/icons-material/AddRounded'
import SettingsEthernetRounded from '@mui/icons-material/SettingsEthernetRounded'
import StorageRounded from '@mui/icons-material/StorageRounded'
import TuneIcon from '@mui/icons-material/Tune'
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material'
import type { SavedConfiguration } from '@revive/shared'
import { useEffect, useState } from 'react'
import {
  ConfigurationEditorFields,
  ConfigurationSummaryPanel,
  PageIntroWithIcon,
  PanelTitle,
  emptyConfigurationFormState,
  formStateFromConfiguration,
  getErrorMessage,
  isConfigurationFormReady,
  type ConfigurationFormState,
  normalizeVbrickVersion,
} from '../components/shared/PageChrome'

type ConfigurationWorkspacePageProps = {
  activeConfiguration: SavedConfiguration | undefined
  configurations: SavedConfiguration[]
  createConfigurationError?: string
  deleteConfigurationError?: string
  isBusy: boolean
  onCreateConfiguration: (input: ConfigurationFormState) => Promise<void>
  onDeleteConfiguration: (configurationId: string) => Promise<void>
  onSaveConfiguration: (input: ConfigurationFormState) => Promise<void>
  onSelectConfiguration: (configurationId: string) => void
  onValidateConfiguration: () => Promise<void>
  saveConfigurationError?: string
  validateConfigurationError?: string
}

export function ConfigurationWorkspacePage({
  activeConfiguration,
  configurations,
  createConfigurationError,
  deleteConfigurationError,
  isBusy,
  onCreateConfiguration,
  onDeleteConfiguration,
  onSaveConfiguration,
  onSelectConfiguration,
  onValidateConfiguration,
  saveConfigurationError,
  validateConfigurationError,
}: ConfigurationWorkspacePageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formState, setFormState] = useState<ConfigurationFormState>(() =>
    formStateFromConfiguration(activeConfiguration),
  )
  const [createState, setCreateState] = useState<ConfigurationFormState>(() => emptyConfigurationFormState())
  const [pageError, setPageError] = useState<string | null>(null)
  const [createDialogError, setCreateDialogError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setFormState(formStateFromConfiguration(activeConfiguration))
    setPageError(null)
  }, [activeConfiguration])

  useEffect(() => {
    const nextNotice =
      pageError ??
      createDialogError ??
      saveConfigurationError ??
      validateConfigurationError ??
      deleteConfigurationError ??
      createConfigurationError ??
      null

    if (nextNotice) {
      setNotice(nextNotice)
    }
  }, [
    createConfigurationError,
    createDialogError,
    deleteConfigurationError,
    pageError,
    saveConfigurationError,
    validateConfigurationError,
  ])

  const updateFormState = (field: keyof ConfigurationFormState, value: string) => {
    setPageError(null)
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const updateCreateState = (field: keyof ConfigurationFormState, value: string) => {
    setCreateDialogError(null)
    setCreateState((current) => ({ ...current, [field]: value }))
  }

  return (
    <Stack spacing={3}>
      <PageIntroWithIcon
        icon={<TuneIcon />}
        title="Platform Configuration"
        subtitle="Configure platform level settings"
      />

      <section className="content-grid configurations-grid">
        <Paper className="panel">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} mb={2.5}>
            <PanelTitle
              icon={<StorageRounded />}
              title="Rev API Instances"
              subtitle="Named Rev API instances."
            />
            <Tooltip title="Add instance">
              <IconButton
                color="inherit"
                onClick={() => setIsCreateDialogOpen(true)}
                aria-label="Add instance"
                disabled={isBusy}
                sx={{ mt: 0.25 }}
              >
                <AddRounded />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={2}>
            {configurations.length === 0 ? (
              <Alert severity="info">No instances have been saved yet.</Alert>
            ) : (
              configurations.map((configuration) => {
                const isSelected = configuration.id === activeConfiguration?.id

                return (
                  <Paper
                    key={configuration.id}
                    component="button"
                    type="button"
                    variant="outlined"
                    className={`project-card configuration-card ${isSelected ? 'project-card-active project-card-selected' : ''}`}
                    onClick={() => onSelectConfiguration(configuration.id)}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                          <Typography variant="h6">{configuration.name}</Typography>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={configuration.productVersion ? normalizeVbrickVersion(configuration.productVersion) : 'No version'}
                          />
                        </Stack>
                        <Typography color="text.secondary">{configuration.environment.url}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Chip
                          size="small"
                          color={configuration.validatedEnvironment ? 'success' : 'warning'}
                          label={configuration.validatedEnvironment ? 'Validated' : 'Needs validation'}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                )
              })
            )}
          </Stack>
        </Paper>

        <Paper className="panel">
          <PanelTitle
            icon={<SettingsEthernetRounded />}
            title="Instance Details"
            subtitle="Edit the selected instance and validate its connection."
          />
          {activeConfiguration ? (
            <Stack spacing={2}>
              <ConfigurationEditorFields idPrefix="edit" formState={formState} setField={updateFormState} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={async () => {
                    try {
                      setPageError(null)
                      await onSaveConfiguration(formState)
                    } catch (error) {
                      setPageError(getErrorMessage(error))
                    }
                  }}
                  disabled={isBusy || !isConfigurationFormReady(formState)}
                >
                  Save changes
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={async () => {
                    try {
                      setPageError(null)
                      await onValidateConfiguration()
                    } catch (error) {
                      setPageError(getErrorMessage(error))
                    }
                  }}
                  disabled={isBusy}
                >
                  Validate connection
                </Button>
                <Button
                  variant="text"
                  color="error"
                  size="large"
                  onClick={async () => {
                    try {
                      setPageError(null)
                      await onDeleteConfiguration(activeConfiguration.id)
                    } catch (error) {
                      setPageError(getErrorMessage(error))
                    }
                  }}
                  disabled={isBusy}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Alert severity="info">Select a configuration to view or edit it.</Alert>
          )}
        </Paper>

        <ConfigurationSummaryPanel
          title="Validation Summary"
          subtitle="Connection details confirmed by the API."
          configuration={activeConfiguration}
          emptyMessage="Validate a configuration to view its connection details here."
          className="panel-full"
          dense
        />
      </section>

      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create a New Instance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <ConfigurationEditorFields idPrefix="create" formState={createState} setField={updateCreateState} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogError(null)
              setIsCreateDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!isConfigurationFormReady(createState) || isBusy}
            onClick={async () => {
              try {
                setCreateDialogError(null)
                await onCreateConfiguration(createState)
                setCreateState(emptyConfigurationFormState())
                setIsCreateDialogOpen(false)
              } catch (error) {
                setCreateDialogError(getErrorMessage(error))
              }
            }}
          >
            Save instance
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') {
            return
          }

          setNotice(null)
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotice(null)} severity="error" variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
