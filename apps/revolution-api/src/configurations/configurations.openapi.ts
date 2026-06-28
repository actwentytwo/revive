import type { OpenApiMeta } from "trpc-to-openapi";

export const listConfigurationsOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/configurations",
    tags: ["configurations"],
    summary: "List configurations",
  },
};

export const createConfigurationOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/configurations",
    tags: ["configurations"],
    summary: "Create configuration",
  },
};

export const updateConfigurationOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/configurations/{configurationId}",
    tags: ["configurations"],
    summary: "Update configuration",
  },
};

export const validateConfigurationOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/configurations/{configurationId}/validate",
    tags: ["configurations"],
    summary: "Validate configuration",
  },
};

export const deleteConfigurationOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "DELETE",
    path: "/api/v1/configurations/{configurationId}",
    tags: ["configurations"],
    summary: "Delete configuration",
  },
};
