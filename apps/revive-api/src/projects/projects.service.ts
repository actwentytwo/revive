import type { MigrationProject, SourceVideoPage } from '@revive/shared'
import { RevService } from '../rev-service.js'
import { MongoProjectsRepository } from './projects.repository.js'
import type {
  CreateProjectInput,
  MigrationProjectRecord,
  RevEnvironmentInput,
} from './projects.schemas.js'

const DEFAULT_PROJECT_ID = 'default'
const SYSTEM_ACTOR = 'system'

const projectsRepository = new MongoProjectsRepository()
const revService = new RevService()

let bootstrapPromise: Promise<void> | null = null

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toProject(record: MigrationProjectRecord): MigrationProject {
  return {
    id: record.id,
    name: record.name,
    summary: record.summary,
    sourceEnvironment: record.sourceEnvironment ?? null,
    sourceValidatedEnvironment: record.sourceValidatedEnvironment ?? null,
    destinationEnvironment: record.destinationEnvironment ?? null,
    destinationValidatedEnvironment: record.destinationValidatedEnvironment ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function createDefaultProjectRecord(): MigrationProjectRecord {
  const timestamp = new Date().toISOString()

  return {
    id: DEFAULT_PROJECT_ID,
    name: 'Default',
    summary: 'The default migration project.',
    sourceEnvironment: null,
    sourceValidatedEnvironment: null,
    destinationEnvironment: null,
    destinationValidatedEnvironment: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: SYSTEM_ACTOR,
    updatedBy: SYSTEM_ACTOR,
  }
}

async function ensureDefaultProjectExists() {
  const count = await projectsRepository.count()

  if (count > 0) {
    return
  }

  await projectsRepository.create(createDefaultProjectRecord())
}

export async function ensureProjectsBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await projectsRepository.ensureIndexes()
      await ensureDefaultProjectExists()
    })().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  await bootstrapPromise
}

async function getProjectRecordOrThrow(projectId: string) {
  await ensureProjectsBootstrapped()
  const project = await projectsRepository.findById(projectId)

  if (!project) {
    throw new Error(`Project '${projectId}' was not found.`)
  }

  return project
}

async function generateProjectId(name: string) {
  const baseId = slugify(name) || 'project'
  let candidateId = baseId
  let suffix = 2

  while (await projectsRepository.findById(candidateId)) {
    candidateId = `${baseId}-${suffix}`
    suffix += 1
  }

  return candidateId
}

export async function listProjects() {
  await ensureProjectsBootstrapped()
  const projects = await projectsRepository.findAll()
  return projects.map(toProject)
}

export async function createProject(input: CreateProjectInput) {
  await ensureProjectsBootstrapped()

  const timestamp = new Date().toISOString()
  const record: MigrationProjectRecord = {
    id: await generateProjectId(input.name),
    name: input.name.trim(),
    summary: input.summary.trim(),
    sourceEnvironment: null,
    sourceValidatedEnvironment: null,
    destinationEnvironment: null,
    destinationValidatedEnvironment: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: SYSTEM_ACTOR,
    updatedBy: SYSTEM_ACTOR,
  }

  await projectsRepository.create(record)
  return toProject(record)
}

export async function deleteProject(projectId: string) {
  if (projectId === DEFAULT_PROJECT_ID) {
    throw new Error('The Default project cannot be deleted.')
  }

  await ensureProjectsBootstrapped()
  const deleted = await projectsRepository.deleteById(projectId)

  if (!deleted) {
    throw new Error(`Project '${projectId}' was not found.`)
  }

  return {
    deleted: true,
    projectId,
  }
}

export async function validateSourceEnvironmentForProject(args: {
  projectId: string
  environment: RevEnvironmentInput
}) {
  const project = await getProjectRecordOrThrow(args.projectId)
  const validation = await revService.validateEnvironment(args.environment)

  const updatedProject: MigrationProjectRecord = {
    ...project,
    sourceEnvironment: args.environment,
    sourceValidatedEnvironment: validation,
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  }

  await projectsRepository.replace(updatedProject)
  return toProject(updatedProject)
}

export async function validateDestinationEnvironmentForProject(args: {
  projectId: string
  environment: RevEnvironmentInput
}) {
  const project = await getProjectRecordOrThrow(args.projectId)
  const validation = await revService.validateEnvironment(args.environment)

  const updatedProject: MigrationProjectRecord = {
    ...project,
    destinationEnvironment: args.environment,
    destinationValidatedEnvironment: validation,
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  }

  await projectsRepository.replace(updatedProject)
  return toProject(updatedProject)
}

export async function listSourceVideosForProject(args: {
  projectId: string
  search?: string
  page: number
  pageSize: number
}): Promise<SourceVideoPage> {
  const project = await getProjectRecordOrThrow(args.projectId)

  if (!project.sourceEnvironment) {
    throw new Error('This project does not have a saved source environment yet.')
  }

  return revService.listVideos({
    environment: project.sourceEnvironment,
    search: args.search,
    page: args.page,
    pageSize: args.pageSize,
  })
}
