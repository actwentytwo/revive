import type { OpenApiMeta } from "trpc-to-openapi";

export const listSourceVideosOpenApiMeta: OpenApiMeta = {
  openapi: {
    enabled: true,
    method: "GET",
    path: "/api/v1/videos/source",
    tags: ["videos"],
    summary: "List source videos for a project",
  },
};
