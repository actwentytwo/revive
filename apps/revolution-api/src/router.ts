import { createConfigurationsRouter } from "./configurations/configurations.router.js";
import { metaHealthOpenApiMeta } from "./meta/meta.openapi.js";
import { router, publicProcedure } from "./trpc/trpc.js";
import { projectsRouter } from "./projects/projects.router.js";
import { isConfigurationInUse } from "./projects/projects.service.js";
import { videosRouter } from "./videos/videos.router.js";
import { z } from "zod";

const healthResponseSchema = z.object({
  ok: z.boolean(),
  generatedAt: z.string().datetime(),
});

export const appRouter = router({
  health: publicProcedure
    .meta(metaHealthOpenApiMeta)
    .input(z.object({}).optional())
    .output(healthResponseSchema)
    .query(() => ({
      ok: true,
      generatedAt: new Date().toISOString(),
    })),
  configurations: createConfigurationsRouter({
    isConfigurationInUse,
  }),
  projects: projectsRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;
