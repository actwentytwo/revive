export interface ChangeLogEntry {
  version: string
  date: string
  title: string
  summary: string
  highlights: string[]
  status: 'Live' | 'In Progress' | 'Planned'
}

export const changelog: ChangeLogEntry[] = [
  {
    version: '0.5',
    date: '2026-06-27',
    title: 'Projects are now saved and reusable',
    summary:
      'REVIVE now saves project setup through the API so operators can return to the same migration project without rebuilding it in the browser.',
    highlights: [
      'Projects are stored in the database instead of only in local browser storage',
      'Saved source environment setup stays attached to each project',
      'REVIVE now shows a dedicated API offline page when the backend is unavailable',
    ],
    status: 'Live',
  },
  {
    version: '0.2',
    date: '2026-06-26',
    title: 'Source connection and video discovery',
    summary:
      'Operators can now connect to a source Rev environment, confirm the connection, and browse real source videos.',
    highlights: [
      'Connect to Rev using API credentials or username and password',
      'Validate the source environment before continuing',
      'Search and page through the source video library',
    ],
    status: 'Live',
  },
  {
    version: '0.3',
    date: 'Coming soon',
    title: 'Saved environments and destination setup',
    summary:
      'This update will make setup reusable so operators do not need to re-enter environment details each time.',
    highlights: [
      'Save source and destination environments',
      'Prepare destination connectivity',
      'Introduce secure credential storage',
    ],
    status: 'In Progress',
  },
  {
    version: '0.4',
    date: 'Planned',
    title: 'Single-video migration',
    summary:
      'After environment setup is in place, REVIVE will support moving a single video and its core metadata end to end.',
    highlights: [
      'Migrate a single selected video',
      'Carry title, description, tags, and categories',
      'Report success and failure clearly to operators',
    ],
    status: 'Planned',
  },
]
