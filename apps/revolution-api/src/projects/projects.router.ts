import { z } from "zod";
import { byPermissionedProc, router } from "../trpc/trpc.procedures.js";
import { toBadRequest } from "../trpc/errors.js";
import {
  assignProjectConfigurationsOpenApiMeta,
  createProjectOpenApiMeta,
  deleteProjectOpenApiMeta,
  listProjectsOpenApiMeta,
  updateProjectOpenApiMeta,
} from "./projects.openapi.js";
import {
  assignProjectConfigurations,
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "./projects.service.js";
import {
  assignProjectConfigurationsInputSchema,
  createProjectInputSchema,
  deleteProjectInputSchema,
  migrationProjectSchema,
  updateProjectInputSchema,
} from "./projects.schemas.js";

export const projectsRouter = router({
  list: byPermissionedProc("projects.read")
    .meta(listProjectsOpenApiMeta)
    .input(z.object({}).optional())
    .output(migrationProjectSchema.array())
    .query(async () => listProjects()),
  create: byPermissionedProc("projects.write")
    .meta(createProjectOpenApiMeta)
    .input(createProjectInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await createProject(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to create project");
      }
    }),
  update: byPermissionedProc("projects.write")
    .meta(updateProjectOpenApiMeta)
    .input(updateProjectInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await updateProject(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to update project");
      }
    }),
  delete: byPermissionedProc("projects.delete")
    .meta(deleteProjectOpenApiMeta)
    .input(deleteProjectInputSchema)
    .output(z.object({ deleted: z.boolean(), projectId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await deleteProject(input.projectId);
      } catch (error) {
        throw toBadRequest(error, "Failed to delete project");
      }
    }),
  assignConfigurations: byPermissionedProc("projects.assign")
    .meta(assignProjectConfigurationsOpenApiMeta)
    .input(assignProjectConfigurationsInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await assignProjectConfigurations(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to update project configuration");
      }
    }),
});
