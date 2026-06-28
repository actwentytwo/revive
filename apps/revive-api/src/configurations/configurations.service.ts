import type { SavedConfiguration } from '@revive/shared'
import { RevService } from '../rev-service.js'
import { MongoConfigurationsRepository } from './configurations.repository.js'
import type {
  CreateConfigurationInput,
  RevEnvironmentInput,
  SavedConfigurationRecord,
  UpdateConfigurationInput,
} from './configurations.schemas.js'

const SYSTEM_ACTOR = 'system'

const configurationsRepository = new MongoConfigurationsRepository()
const revService = new RevService()

let bootstrapPromise: Promise<void> | null = null

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toConfiguration(record: SavedConfigurationRecord): SavedConfiguration {
  return {
    id: record.id,
    name: record.name,
    productVersion: record.productVersion,
    environment: record.environment,
    validatedEnvironment: record.validatedEnvironment,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function ensureConfigurationsBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = configurationsRepository.ensureIndexes().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  await bootstrapPromise
}

async function getConfigurationRecordOrThrow(configurationId: string) {
  await ensureConfigurationsBootstrapped()
  const configuration = await configurationsRepository.findById(configurationId)

  if (!configuration) {
    throw new Error(`Configuration '${configurationId}' was not found.`)
  }

  return configuration
}

async function generateConfigurationId(name: string) {
  const baseId = slugify(name) || 'configuration'
  let candidateId = baseId
  let suffix = 2

  while (await configurationsRepository.findById(candidateId)) {
    candidateId = `${baseId}-${suffix}`
    suffix += 1
  }

  return candidateId
}

export async function listConfigurations() {
  await ensureConfigurationsBootstrapped()
  const configurations = await configurationsRepository.findAll()
  return configurations.map(toConfiguration)
}

export async function createConfiguration(input: CreateConfigurationInput) {
  await ensureConfigurationsBootstrapped()

  const timestamp = new Date().toISOString()
  const record: SavedConfigurationRecord = {
    id: await generateConfigurationId(input.name),
    name: input.name.trim(),
    productVersion: input.productVersion.trim(),
    environment: input.environment,
    validatedEnvironment: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: SYSTEM_ACTOR,
    updatedBy: SYSTEM_ACTOR,
  }

  await configurationsRepository.create(record)
  return toConfiguration(record)
}

export async function updateConfiguration(input: UpdateConfigurationInput) {
  const existing = await getConfigurationRecordOrThrow(input.configurationId)

  const updatedConfiguration: SavedConfigurationRecord = {
    ...existing,
    name: input.name.trim(),
    productVersion: input.productVersion.trim(),
    environment: input.environment,
    validatedEnvironment: null,
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  }

  await configurationsRepository.replace(updatedConfiguration)
  return toConfiguration(updatedConfiguration)
}

export async function validateConfiguration(configurationId: string) {
  const configuration = await getConfigurationRecordOrThrow(configurationId)
  const validation = await revService.validateEnvironment(configuration.environment)

  const updatedConfiguration: SavedConfigurationRecord = {
    ...configuration,
    validatedEnvironment: validation,
    updatedAt: new Date().toISOString(),
    updatedBy: SYSTEM_ACTOR,
  }

  await configurationsRepository.replace(updatedConfiguration)
  return toConfiguration(updatedConfiguration)
}

export async function deleteConfiguration(args: {
  configurationId: string
  isInUse: (configurationId: string) => Promise<boolean>
}) {
  const configuration = await getConfigurationRecordOrThrow(args.configurationId)

  if (await args.isInUse(configuration.id)) {
    throw new Error(`Configuration '${configuration.name}' is still assigned to a project.`)
  }

  const deleted = await configurationsRepository.deleteById(configuration.id)

  if (!deleted) {
    throw new Error(`Configuration '${configuration.id}' was not found.`)
  }

  return {
    deleted: true,
    configurationId: configuration.id,
  }
}

export async function getSavedEnvironment(configurationId: string): Promise<RevEnvironmentInput> {
  const configuration = await getConfigurationRecordOrThrow(configurationId)
  return configuration.environment
}
