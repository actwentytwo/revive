import { router, publicProcedure } from './trpc/trpc.js'
import { projectsRouter } from './projects/projects.router.js'

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    generatedAt: new Date().toISOString(),
  })),
  projects: projectsRouter,
})

export type AppRouter = typeof appRouter
