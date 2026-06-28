import SearchRounded from '@mui/icons-material/SearchRounded'
import { Alert, Box, Paper, Snackbar, Stack, TextField } from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid'
import type { MigrationProject, SourceVideoRecord } from '@revive/shared'
import { useEffect, useState } from 'react'
import { PageIntro, PanelTitle } from '../components/shared/PageChrome'
import './VideosPage.css'

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
    renderCell: ({ row }: { row: SourceVideoRecord }) => row.categories.join(', '),
  },
  {
    field: 'tags',
    headerName: 'Tags',
    minWidth: 220,
    flex: 1,
    sortable: false,
    renderCell: ({ row }: { row: SourceVideoRecord }) => row.tags.join(', '),
  },
  { field: 'duration', headerName: 'Duration', minWidth: 120, flex: 0.5 },
  { field: 'status', headerName: 'REV Status', minWidth: 150, flex: 0.7 },
  {
    field: 'isUnlisted',
    headerName: 'Visibility',
    minWidth: 130,
    flex: 0.6,
    renderCell: ({ value }) => <span>{value ? 'Unlisted' : 'Listed'}</span>,
  },
]

type VideosPageProps = {
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
}

export function VideosPage({
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
}: VideosPageProps) {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      setNotice(error)
    }
  }, [error])

  return (
    <Stack spacing={3}>
      <PageIntro title="Videos" subtitle={`Browse the source library attached to ${activeProject?.name ?? 'the selected project'}.`} />

      {!connected ? <Alert severity="warning">Validate the selected source configuration before browsing videos.</Alert> : null}

      <Paper className="panel panel-full">
        <PanelTitle icon={<SearchRounded />} title="Source Video Library" subtitle="Source videos from the selected platform configuration." />
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
