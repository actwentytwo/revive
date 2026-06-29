import type { OpenApiMeta } from "trpc-to-openapi";

export const metaHealthOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/health",
    tags: ["meta"],
    summary: "Health check",
    description: "Returns a lightweight service health payload.",
  },
};

export const metaWhoAmIOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/meta/whoami",
    tags: ["meta"],
    summary: "Return caller identity and effective grants",
  },
};

export const metaSessionOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/meta/session",
    tags: ["meta"],
    summary: "Return current session context",
  },
};
