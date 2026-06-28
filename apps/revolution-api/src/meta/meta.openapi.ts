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
