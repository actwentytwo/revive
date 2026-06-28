import { createConfigurationsRouter } from "./configurations/configurations.router.js";
import { router, publicProcedure } from "./trpc/trpc.js";
import { projectsRouter } from "./projects/projects.router.js";
import { isConfigurationInUse } from "./projects/projects.service.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    generatedAt: new Date().toISOString(),
  })),
  configurations: createConfigurationsRouter({
    isConfigurationInUse,
  }),
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
