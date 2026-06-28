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

export const savedConfigurationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  productVersion: z.string(),
  environment: environmentSchema,
  validatedEnvironment: environmentValidationSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const savedConfigurationRecordSchema = savedConfigurationSchema.extend({
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
})

export const createConfigurationInputSchema = z.object({
  name: z.string().trim().min(1),
  productVersion: z.string().trim(),
  environment: environmentSchema,
})

export const updateConfigurationInputSchema = z.object({
  configurationId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  productVersion: z.string().trim(),
  environment: environmentSchema,
})

export const deleteConfigurationInputSchema = z.object({
  configurationId: z.string().trim().min(1),
})

export const validateConfigurationInputSchema = z.object({
  configurationId: z.string().trim().min(1),
})

export type CreateConfigurationInput = z.infer<typeof createConfigurationInputSchema>
export type DeleteConfigurationInput = z.infer<typeof deleteConfigurationInputSchema>
export type RevEnvironmentInput = z.infer<typeof environmentSchema>
export type RevEnvironmentValidation = z.infer<typeof environmentValidationSchema>
export type SavedConfigurationRecord = z.infer<typeof savedConfigurationRecordSchema>
export type UpdateConfigurationInput = z.infer<typeof updateConfigurationInputSchema>
export type ValidateConfigurationInput = z.infer<typeof validateConfigurationInputSchema>
