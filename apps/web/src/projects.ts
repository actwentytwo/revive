import type { RevEnvironmentInput, RevEnvironmentValidation } from '@revive/shared'

export interface MigrationProject {
  id: string
  name: string
  summary: string
  sourceEnvironment: RevEnvironmentInput | null
  validatedEnvironment: RevEnvironmentValidation | null
  createdAt: string
  updatedAt: string
}

export const defaultProjects: MigrationProject[] = [
  {
    id: 'default',
    name: 'Default',
    summary: 'The default migration project.',
    sourceEnvironment: null,
    validatedEnvironment: null,
    createdAt: '2026-06-26T10:05:00.000Z',
    updatedAt: '2026-06-26T10:05:00.000Z',
  },
]

export function createProject(name: string, summary: string): MigrationProject {
  const timestamp = new Date().toISOString()

  return {
    id: slugify(name),
    name,
    summary,
    sourceEnvironment: null,
    validatedEnvironment: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
