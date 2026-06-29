import { z } from "zod";

import { permissionSchema } from "./permissions.schemas.js";
import { roleSchema } from "./roles.schemas.js";

export const permissionScopeSchema = z.enum(["global", "environment", "environment-cluster"]);
export const permissionCategorySchema = z.enum(["operational", "developer"]);
export const roleGrantScopeSchema = z.enum(["global", "environment", "environment-cluster"]);
export const roleActorTypeSchema = z.enum(["human", "workload", "any"]);

export const permissionCatalogEntrySchema = z.object({
  key: permissionSchema,
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: permissionCategorySchema,
  scope: permissionScopeSchema,
});

export const roleCatalogEntrySchema = z.object({
  key: roleSchema,
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  grantScope: roleGrantScopeSchema,
  actorType: roleActorTypeSchema,
});

export const rolePermissionCatalogEntrySchema = z.object({
  roleKey: roleSchema,
  permissionKey: permissionSchema,
});

export const updateRolePermissionsInputSchema = z.object({
  roleKey: roleSchema,
  permissionKeys: z.array(permissionSchema),
});

export const updateRolePermissionsOutputSchema = z.object({
  roleKey: roleSchema,
  permissions: z.array(permissionSchema),
});

export const functionalGroupCatalogRecordSchema = z.object({
  key: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(128),
  description: z.string().trim().max(500).optional(),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().trim().min(1).max(512),
  updatedBy: z.string().trim().min(1).max(512),
});

export const accessGrantSubjectTypeSchema = z.enum(["human", "functional-group", "workload"]);

export const accessGrantCatalogEntrySchema = z
  .object({
    grantId: z.string().trim().min(1).max(256),
    subjectType: accessGrantSubjectTypeSchema,
    subject: z.string().trim().min(1).max(256),
    roleKey: roleSchema,
    scopeKey: z.string().trim().min(1).max(256),
    environmentKey: z.string().trim().min(1).max(64).optional(),
    clusterKey: z.string().trim().min(1).max(64).optional(),
    enabled: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().trim().min(1).max(512),
    updatedBy: z.string().trim().min(1).max(512),
  })
  .superRefine((value, context) => {
    if (value.clusterKey && !value.environmentKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "clusterKey requires environmentKey.",
        path: ["clusterKey"],
      });
    }
  });

export const listFunctionalGroupsInputSchema = z.object({
  includeDisabled: z.boolean().optional().default(false),
});

export const createFunctionalGroupInputSchema = z.object({
  key: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(128),
  description: z.string().trim().max(500).optional(),
  enabled: z.boolean().optional().default(true),
});

export const updateFunctionalGroupInputSchema = z.object({
  key: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(128).optional(),
  description: z.string().trim().max(500).optional(),
  enabled: z.boolean().optional(),
});

export const deleteFunctionalGroupInputSchema = z.object({
  key: z.string().trim().min(1).max(128),
});

export const listAccessGrantsInputSchema = z.object({
  includeDisabled: z.boolean().optional().default(false),
});

export const createAccessGrantInputSchema = z
  .object({
    subjectType: accessGrantSubjectTypeSchema,
    subject: z.string().trim().min(1).max(256),
    roleKey: roleSchema,
    environmentKey: z.string().trim().min(1).max(64).optional(),
    clusterKey: z.string().trim().min(1).max(64).optional(),
    enabled: z.boolean().optional().default(true),
  })
  .superRefine((value, context) => {
    if (value.clusterKey && !value.environmentKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "clusterKey requires environmentKey.",
        path: ["clusterKey"],
      });
    }
  });

export const updateAccessGrantInputSchema = z
  .object({
    grantId: z.string().trim().min(1).max(256),
    roleKey: roleSchema.optional(),
    environmentKey: z.string().trim().min(1).max(64).optional(),
    clusterKey: z.string().trim().min(1).max(64).optional(),
    enabled: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.clusterKey && !value.environmentKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "clusterKey requires environmentKey.",
        path: ["clusterKey"],
      });
    }
  });

export const disableAccessGrantInputSchema = z.object({
  grantId: z.string().trim().min(1).max(256),
});

export const deleteAccessGrantInputSchema = z.object({
  grantId: z.string().trim().min(1).max(256),
});

export const accessAuditTargetTypeSchema = z.enum([
  "functional-group",
  "access-grant",
  "role-permission",
]);

export const listAccessAuditEventsInputSchema = z.object({
  limit: z.number().int().min(1).max(500).optional().default(100),
});

export const effectiveAccessBySubjectInputSchema = z.object({
  subjectType: accessGrantSubjectTypeSchema,
  subject: z.string().trim().min(1).max(256),
});

export const accessGrantReasonSchema = z.object({
  grantId: z.string().trim().min(1).max(256),
  roleKey: roleSchema,
  scopeKey: z.string().trim().min(1).max(256),
  subjectType: accessGrantSubjectTypeSchema,
  subject: z.string().trim().min(1).max(256),
  grantSource: z.enum(["access-grant", "bootstrap"]).default("access-grant"),
});

export const effectivePermissionSchema = z.object({
  permission: permissionSchema,
  reasons: z.array(accessGrantReasonSchema),
});

export const effectiveAccessSummarySchema = z.object({
  subjectType: accessGrantSubjectTypeSchema,
  subject: z.string().trim().min(1).max(256),
  functionalGroups: z.array(z.string()),
  hasBootstrapSuperAdmin: z.boolean(),
  grants: z.array(accessGrantCatalogEntrySchema),
  effectivePermissions: z.array(effectivePermissionSchema),
});

export const procedureDefinitionSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  accessKind: z.enum(["public", "authenticated", "permission"]),
  permission: permissionSchema.optional(),
});

export const authorisationModelResponseSchema = z.object({
  permissions: z.array(permissionCatalogEntrySchema),
  roles: z.array(
    roleCatalogEntrySchema.extend({
      permissions: z.array(permissionSchema),
    }),
  ),
  procedures: z.array(procedureDefinitionSchema),
});

export const accessAuditEventSchema = z.object({
  id: z.string().trim().min(1),
  action: z.string().trim().min(1),
  actor: z.string().trim().min(1),
  targetType: accessAuditTargetTypeSchema,
  targetKey: z.string().trim().min(1).max(256),
  createdAt: z.string().datetime(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type PermissionCatalogEntry = z.infer<typeof permissionCatalogEntrySchema>;
export type RoleCatalogEntry = z.infer<typeof roleCatalogEntrySchema>;
export type RolePermissionCatalogEntry = z.infer<typeof rolePermissionCatalogEntrySchema>;
export type ProcedureDefinition = z.infer<typeof procedureDefinitionSchema>;
export type AuthorisationModelResponse = z.infer<typeof authorisationModelResponseSchema>;
export type FunctionalGroupCatalogRecord = z.infer<typeof functionalGroupCatalogRecordSchema>;
export type AccessGrantCatalogEntry = z.infer<typeof accessGrantCatalogEntrySchema>;
export type AccessGrantSubjectType = z.infer<typeof accessGrantSubjectTypeSchema>;
export type AccessGrantReason = z.infer<typeof accessGrantReasonSchema>;
export type EffectivePermission = z.infer<typeof effectivePermissionSchema>;
export type EffectiveAccessSummary = z.infer<typeof effectiveAccessSummarySchema>;
export type AccessAuditEvent = z.infer<typeof accessAuditEventSchema>;
export type ListAccessAuditEventsInput = z.infer<typeof listAccessAuditEventsInputSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsInputSchema>;
export type UpdateRolePermissionsOutput = z.infer<typeof updateRolePermissionsOutputSchema>;
export type CreateFunctionalGroupInput = z.infer<typeof createFunctionalGroupInputSchema>;
export type UpdateFunctionalGroupInput = z.infer<typeof updateFunctionalGroupInputSchema>;
export type DeleteFunctionalGroupInput = z.infer<typeof deleteFunctionalGroupInputSchema>;
export type CreateAccessGrantInput = z.infer<typeof createAccessGrantInputSchema>;
export type UpdateAccessGrantInput = z.infer<typeof updateAccessGrantInputSchema>;
export type DisableAccessGrantInput = z.infer<typeof disableAccessGrantInputSchema>;
export type DeleteAccessGrantInput = z.infer<typeof deleteAccessGrantInputSchema>;
