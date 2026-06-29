import type { OpenApiMeta } from "trpc-to-openapi";

export const accessAuthorisationModelOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/authorisation-model",
    tags: ["access"],
    summary: "Return access authorisation model",
  },
};

export const accessFunctionalGroupsListOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/functional-groups",
    tags: ["access"],
    summary: "List functional groups",
  },
};

export const accessCreateFunctionalGroupOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/access/functional-groups",
    tags: ["access"],
    summary: "Create functional group",
  },
};

export const accessUpdateFunctionalGroupOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/access/functional-groups",
    tags: ["access"],
    summary: "Update functional group",
  },
};

export const accessDeleteFunctionalGroupOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "DELETE",
    path: "/api/v1/access/functional-groups",
    tags: ["access"],
    summary: "Delete functional group",
  },
};

export const accessGrantsListOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/grants",
    tags: ["access"],
    summary: "List access grants",
  },
};

export const accessCreateAccessGrantOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/access/grants",
    tags: ["access"],
    summary: "Create access grant",
  },
};

export const accessUpdateAccessGrantOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/access/grants",
    tags: ["access"],
    summary: "Update access grant",
  },
};

export const accessDisableAccessGrantOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/access/grants/disable",
    tags: ["access"],
    summary: "Disable access grant",
  },
};

export const accessDeleteAccessGrantOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "DELETE",
    path: "/api/v1/access/grants",
    tags: ["access"],
    summary: "Delete access grant",
  },
};

export const accessAuditListOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/audit",
    tags: ["access"],
    summary: "List access audit events",
  },
};

export const accessEffectiveAccessBySubjectOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/effective-access",
    tags: ["access"],
    summary: "Get effective access by subject",
  },
};

export const accessMyAccessOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/access/my-access",
    tags: ["access"],
    summary: "Return caller access summary",
  },
};

export const accessRolePermissionsUpdateOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/access/role-permissions",
    tags: ["access"],
    summary: "Update role permission mapping",
  },
};
