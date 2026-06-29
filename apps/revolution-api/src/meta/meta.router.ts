import { z } from "zod";
import { authenticatedProc, router } from "../trpc/trpc.procedures.js";
import {
  metaAuthorisationModelOpenApiMeta,
  metaRefreshSessionAttributesOpenApiMeta,
  metaSessionOpenApiMeta,
  metaWhoAmIOpenApiMeta,
} from "./meta.openapi.js";
import {
  metaAuthorisationModelSchema,
  metaRefreshSessionAttributesRequestSchema,
  metaRefreshSessionAttributesResponseSchema,
  metaSessionSchema,
} from "./meta.schemas.js";
import { getAuthorisationModel } from "../access/catalog.service.js";

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
  refreshSessionAttributes: authenticatedProc
    .meta(metaRefreshSessionAttributesOpenApiMeta)
    .input(metaRefreshSessionAttributesRequestSchema)
    .output(metaRefreshSessionAttributesResponseSchema)
    .mutation(({ ctx }) => ({
      functionalGroups: ctx.functionalGroups,
      operatorEmail: ctx.identity?.emailAddress ?? null,
    })),
  authorisationModel: authenticatedProc
    .meta(metaAuthorisationModelOpenApiMeta)
    .input(z.object({}).optional())
    .output(metaAuthorisationModelSchema)
    .query(() => getAuthorisationModel()),
});
