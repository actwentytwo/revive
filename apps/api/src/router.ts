import { initTRPC } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { z } from 'zod'
import { RevService } from './rev-service.js'

const t = initTRPC.create({
  transformer: superjson,
})

const revService = new RevService()

const environmentSchema = z.discriminatedUnion('authType', [
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

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    ok: true,
    generatedAt: new Date().toISOString(),
  })),
  validateSourceEnvironment: t.procedure
    .input(environmentSchema)
    .mutation(async ({ input }) => {
      try {
        return await revService.validateEnvironment(input)
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : 'Failed to validate Rev environment',
        })
      }
    }),
  listSourceVideos: t.procedure
    .input(
      z.object({
        environment: environmentSchema,
        search: z.string().trim().optional(),
        page: z.number().int().min(0).default(0),
        pageSize: z.number().int().min(1).max(100).default(25),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await revService.listVideos(input)
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Failed to list source videos',
        })
      }
    }),
})

export type AppRouter = typeof appRouter
