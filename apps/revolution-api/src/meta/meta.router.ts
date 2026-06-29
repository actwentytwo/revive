import { z } from "zod";
import { authenticatedProc, router } from "../trpc/trpc.procedures.js";
import { metaSessionOpenApiMeta, metaWhoAmIOpenApiMeta } from "./meta.openapi.js";
import { metaSessionSchema } from "./meta.schemas.js";

export const metaRouter = router({
  whoAmI: authenticatedProc
    .meta(metaWhoAmIOpenApiMeta)
    .input(z.object({}).optional())
    .output(metaSessionSchema)
    .query(({ ctx }) => ({
      actorType: ctx.actorType,
      identity: ctx.identity,
      functionalGroups: ctx.functionalGroups,
      grants: ctx.grants,
      requestId: ctx.requestId,
    })),
  session: authenticatedProc
    .meta(metaSessionOpenApiMeta)
    .input(z.object({}).optional())
    .output(metaSessionSchema)
    .query(({ ctx }) => ({
      actorType: ctx.actorType,
      identity: ctx.identity,
      functionalGroups: ctx.functionalGroups,
      grants: ctx.grants,
      requestId: ctx.requestId,
    })),
});
