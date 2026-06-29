import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  AccessManagementConflictError,
  AccessManagementNotFoundError,
  AccessManagementValidationError,
  createAccessGrant,
  createFunctionalGroup,
  deleteAccessGrant,
  deleteFunctionalGroup,
  disableAccessGrant,
  getAccessAuthorisationModel,
  getEffectiveAccessBySubject,
  getMyAccess,
  listAccessAuditEvents,
  listAccessGrants,
  listFunctionalGroups,
  updateAccessGrant,
  updateFunctionalGroup,
  updateRolePermissions,
} from "./access.service.js";
import {
  accessAuditListOpenApiMeta,
  accessAuthorisationModelOpenApiMeta,
  accessCreateAccessGrantOpenApiMeta,
  accessCreateFunctionalGroupOpenApiMeta,
  accessDeleteAccessGrantOpenApiMeta,
  accessDeleteFunctionalGroupOpenApiMeta,
  accessDisableAccessGrantOpenApiMeta,
  accessEffectiveAccessBySubjectOpenApiMeta,
  accessFunctionalGroupsListOpenApiMeta,
  accessGrantsListOpenApiMeta,
  accessMyAccessOpenApiMeta,
  accessRolePermissionsUpdateOpenApiMeta,
  accessUpdateAccessGrantOpenApiMeta,
  accessUpdateFunctionalGroupOpenApiMeta,
} from "./access.openapi.js";
import {
  accessAuditEventSchema,
  accessGrantCatalogEntrySchema,
  authorisationModelResponseSchema,
  createAccessGrantInputSchema,
  createFunctionalGroupInputSchema,
  deleteAccessGrantInputSchema,
  deleteFunctionalGroupInputSchema,
  disableAccessGrantInputSchema,
  effectiveAccessBySubjectInputSchema,
  effectiveAccessSummarySchema,
  functionalGroupCatalogRecordSchema,
  listAccessAuditEventsInputSchema,
  listAccessGrantsInputSchema,
  listFunctionalGroupsInputSchema,
  updateAccessGrantInputSchema,
  updateFunctionalGroupInputSchema,
  updateRolePermissionsInputSchema,
  updateRolePermissionsOutputSchema,
} from "./catalog.schemas.js";
import { authenticatedProc, byPermissionedProc, router } from "../trpc/trpc.procedures.js";

const toTrpcError = (error: unknown): TRPCError => {
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof AccessManagementValidationError) {
    return new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }

  if (error instanceof AccessManagementNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message, cause: error });
  }

  if (error instanceof AccessManagementConflictError) {
    return new TRPCError({ code: "CONFLICT", message: error.message, cause: error });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unable to complete the access management request right now.",
    cause: error instanceof Error ? error : undefined,
  });
};

export const accessRouter = router({
  authorisationModel: byPermissionedProc("authorisation-model.read")
    .meta(accessAuthorisationModelOpenApiMeta)
    .input(z.object({}).optional())
    .output(authorisationModelResponseSchema)
    .query(async () => {
      try {
        return await getAccessAuthorisationModel();
      } catch (error) {
        throw toTrpcError(error);
      }
    }),
  functionalGroups: router({
    list: byPermissionedProc("functional-group.read")
      .meta(accessFunctionalGroupsListOpenApiMeta)
      .input(listFunctionalGroupsInputSchema.optional())
      .output(functionalGroupCatalogRecordSchema.array())
      .query(async ({ input }) => {
        try {
          return await listFunctionalGroups(input ?? { includeDisabled: false });
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    create: byPermissionedProc("functional-group.create")
      .meta(accessCreateFunctionalGroupOpenApiMeta)
      .input(createFunctionalGroupInputSchema)
      .output(functionalGroupCatalogRecordSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await createFunctionalGroup(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    update: byPermissionedProc("functional-group.update")
      .meta(accessUpdateFunctionalGroupOpenApiMeta)
      .input(updateFunctionalGroupInputSchema)
      .output(functionalGroupCatalogRecordSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await updateFunctionalGroup(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    delete: byPermissionedProc("functional-group.disable")
      .meta(accessDeleteFunctionalGroupOpenApiMeta)
      .input(deleteFunctionalGroupInputSchema)
      .output(z.object({ key: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await deleteFunctionalGroup(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
  }),
  grants: router({
    list: byPermissionedProc("access-grant.read")
      .meta(accessGrantsListOpenApiMeta)
      .input(listAccessGrantsInputSchema.optional())
      .output(accessGrantCatalogEntrySchema.array())
      .query(async ({ input }) => {
        try {
          return await listAccessGrants(input ?? { includeDisabled: false });
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    create: byPermissionedProc("access-grant.create")
      .meta(accessCreateAccessGrantOpenApiMeta)
      .input(createAccessGrantInputSchema)
      .output(accessGrantCatalogEntrySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await createAccessGrant(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    update: byPermissionedProc("access-grant.update")
      .meta(accessUpdateAccessGrantOpenApiMeta)
      .input(updateAccessGrantInputSchema)
      .output(accessGrantCatalogEntrySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await updateAccessGrant(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    disable: byPermissionedProc("access-grant.disable")
      .meta(accessDisableAccessGrantOpenApiMeta)
      .input(disableAccessGrantInputSchema)
      .output(accessGrantCatalogEntrySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await disableAccessGrant(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
    delete: byPermissionedProc("access-grant.disable")
      .meta(accessDeleteAccessGrantOpenApiMeta)
      .input(deleteAccessGrantInputSchema)
      .output(accessGrantCatalogEntrySchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await deleteAccessGrant(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
  }),
  audit: router({
    list: byPermissionedProc("audit.read")
      .meta(accessAuditListOpenApiMeta)
      .input(listAccessAuditEventsInputSchema.optional())
      .output(accessAuditEventSchema.array())
      .query(async ({ input }) => {
        try {
          return await listAccessAuditEvents(input ?? { limit: 100 });
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
  }),
  effectiveAccess: router({
    bySubject: byPermissionedProc("access-grant.read")
      .meta(accessEffectiveAccessBySubjectOpenApiMeta)
      .input(effectiveAccessBySubjectInputSchema)
      .output(effectiveAccessSummarySchema)
      .query(async ({ ctx, input }) => {
        try {
          return await getEffectiveAccessBySubject(input.subjectType, input.subject, {
            callerSubject: ctx.identity?.subject,
            callerFunctionalGroups: ctx.functionalGroups,
          });
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
  }),
  rolePermissions: router({
    update: byPermissionedProc("authorisation-model.update")
      .meta(accessRolePermissionsUpdateOpenApiMeta)
      .input(updateRolePermissionsInputSchema)
      .output(updateRolePermissionsOutputSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await updateRolePermissions(input, ctx.identity?.subject ?? "revolution-system");
        } catch (error) {
          throw toTrpcError(error);
        }
      }),
  }),
  myAccess: authenticatedProc
    .meta(accessMyAccessOpenApiMeta)
    .input(z.void())
    .output(effectiveAccessSummarySchema)
    .query(async ({ ctx }) => {
      if (!ctx.identity || (ctx.actorType !== "human" && ctx.actorType !== "workload")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unable to determine actor for access introspection.",
        });
      }

      try {
        return await getMyAccess(ctx.actorType, ctx.identity.subject, ctx.functionalGroups);
      } catch (error) {
        throw toTrpcError(error);
      }
    }),
});
