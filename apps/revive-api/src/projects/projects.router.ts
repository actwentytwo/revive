import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure } from '../trpc/trpc.js'
import {
  createProject,
  deleteProject,
  listProjects,
  listSourceVideosForProject,
  validateDestinationEnvironmentForProject,
  validateSourceEnvironmentForProject,
} from './projects.service.js'
import {
  createProjectInputSchema,
  deleteProjectInputSchema,
  listSourceVideosInputSchema,
  migrationProjectSchema,
  validateDestinationEnvironmentInputSchema,
  validateSourceEnvironmentInputSchema,
} from './projects.schemas.js'

function toBadRequest(error: unknown, fallbackMessage: string) {
  return new TRPCError({
    code: 'BAD_REQUEST',
    message: error instanceof Error ? error.message : fallbackMessage,
  })
}

export const projectsRouter = router({
  list: publicProcedure.output(migrationProjectSchema.array()).query(async () => listProjects()),
  create: publicProcedure
    .input(createProjectInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await createProject(input)
      } catch (error) {
        throw toBadRequest(error, 'Failed to create project')
      }
    }),
  delete: publicProcedure
    .input(deleteProjectInputSchema)
    .output(z.object({ deleted: z.boolean(), projectId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await deleteProject(input.projectId)
      } catch (error) {
        throw toBadRequest(error, 'Failed to delete project')
      }
    }),
  validateSourceEnvironment: publicProcedure
    .input(validateSourceEnvironmentInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await validateSourceEnvironmentForProject(input)
      } catch (error) {
        throw toBadRequest(error, 'Failed to validate Rev environment')
      }
    }),
  validateDestinationEnvironment: publicProcedure
    .input(validateDestinationEnvironmentInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await validateDestinationEnvironmentForProject(input)
      } catch (error) {
        throw toBadRequest(error, 'Failed to validate destination Rev environment')
      }
    }),
  listSourceVideos: publicProcedure
    .input(listSourceVideosInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await listSourceVideosForProject(input)
      } catch (error) {
        throw toBadRequest(error, 'Failed to list source videos')
      }
    }),
})
