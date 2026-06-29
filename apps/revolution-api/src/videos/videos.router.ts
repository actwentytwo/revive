import { byPermissionedProc, router } from "../trpc/trpc.procedures.js";
import { toBadRequest } from "../trpc/errors.js";
import { listSourceVideosInputSchema, sourceVideoPageSchema } from "./videos.schemas.js";
import { listSourceVideosOpenApiMeta } from "./videos.openapi.js";
import { listSourceVideos } from "./videos.service.js";

export const videosRouter = router({
  listSource: byPermissionedProc("videos.read")
    .meta(listSourceVideosOpenApiMeta)
    .input(listSourceVideosInputSchema)
    .output(sourceVideoPageSchema)
    .mutation(async ({ input }) => {
      try {
        return await listSourceVideos(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to list source videos");
      }
    }),
});
