import { publicProcedure, router } from "../trpc/trpc.js";
import { toBadRequest } from "../trpc/errors.js";
import { listSourceVideosInputSchema, sourceVideoPageSchema } from "./videos.schemas.js";
import { listSourceVideos } from "./videos.service.js";

export const videosRouter = router({
  listSource: publicProcedure
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
