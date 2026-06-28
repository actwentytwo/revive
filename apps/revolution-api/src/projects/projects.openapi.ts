import type { OpenApiMeta } from "trpc-to-openapi";

export const listProjectsOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/projects",
    tags: ["projects"],
    summary: "List projects",
  },
};

export const createProjectOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/projects",
    tags: ["projects"],
    summary: "Create project",
  },
};

export const updateProjectOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "PUT",
    path: "/api/v1/projects/{projectId}",
    tags: ["projects"],
    summary: "Update project",
  },
};

export const deleteProjectOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "DELETE",
    path: "/api/v1/projects/{projectId}",
    tags: ["projects"],
    summary: "Delete project",
  },
};

export const assignProjectConfigurationsOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "POST",
    path: "/api/v1/projects/{projectId}/configurations",
    tags: ["projects"],
    summary: "Assign source and destination configurations",
  },
};
