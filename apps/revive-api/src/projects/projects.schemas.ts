import { z } from 'zod'

export const environmentSchema = z.discriminatedUnion('authType', [
  z.object({
    url: z.string().url(),
    authType: z.literal('apiKey'),
    apiKey: z.string().min(1),
    secret: z.string().min(1),
  }),
  z.object({
    url: z.string().url(),
    authType: z.literal('userPassword'),
    username: z.string().min(1),
    password: z.string().min(1),
  }),
])

export const environmentValidationSchema = z.object({
  url: z.string().url(),
  accountId: z.string().nullable(),
  revVersion: z.string().nullable(),
  validatedAt: z.string().datetime(),
})

export const migrationProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  sourceEnvironment: environmentSchema.nullable(),
  validatedEnvironment: environmentValidationSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const migrationProjectRecordSchema = migrationProjectSchema.extend({
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
})

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1),
})

export const deleteProjectInputSchema = z.object({
  projectId: z.string().trim().min(1),
})

export const validateSourceEnvironmentInputSchema = z.object({
  projectId: z.string().trim().min(1),
  environment: environmentSchema,
})

export const listSourceVideosInputSchema = z.object({
  projectId: z.string().trim().min(1),
  search: z.string().trim().optional(),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(25),
})

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectInputSchema>
export type ListSourceVideosInput = z.infer<typeof listSourceVideosInputSchema>
export type MigrationProjectRecord = z.infer<typeof migrationProjectRecordSchema>
export type RevEnvironmentInput = z.infer<typeof environmentSchema>
export type RevEnvironmentValidation = z.infer<typeof environmentValidationSchema>
export type ValidateSourceEnvironmentInput = z.infer<typeof validateSourceEnvironmentInputSchema>
