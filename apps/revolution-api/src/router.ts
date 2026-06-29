import { createConfigurationsRouter } from "./configurations/configurations.router.js";
import { metaHealthOpenApiMeta } from "./meta/meta.openapi.js";
import { metaRouter } from "./meta/meta.router.js";
import { projectsRouter } from "./projects/projects.router.js";
import { isConfigurationInUse } from "./projects/projects.service.js";
import { publicProcedure, router } from "./trpc/trpc.procedures.js";
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
  meta: metaRouter,
  projects: projectsRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;
