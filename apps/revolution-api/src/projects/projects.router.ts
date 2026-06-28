import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc/trpc.js";
import {
  assignProjectConfigurations,
  createProject,
  deleteProject,
  listProjects,
  listSourceVideosForProject,
  updateProject,
} from "./projects.service.js";
import {
  assignProjectConfigurationsInputSchema,
  createProjectInputSchema,
  deleteProjectInputSchema,
  listSourceVideosInputSchema,
  migrationProjectSchema,
  updateProjectInputSchema,
} from "./projects.schemas.js";

function toBadRequest(error: unknown, fallbackMessage: string) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: error instanceof Error ? error.message : fallbackMessage,
  });
}

export const projectsRouter = router({
  list: publicProcedure.output(migrationProjectSchema.array()).query(async () => listProjects()),
  create: publicProcedure
    .input(createProjectInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await createProject(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to create project");
      }
    }),
  update: publicProcedure
    .input(updateProjectInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await updateProject(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to update project");
      }
    }),
  delete: publicProcedure
    .input(deleteProjectInputSchema)
    .output(z.object({ deleted: z.boolean(), projectId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await deleteProject(input.projectId);
      } catch (error) {
        throw toBadRequest(error, "Failed to delete project");
      }
    }),
  assignConfigurations: publicProcedure
    .input(assignProjectConfigurationsInputSchema)
    .output(migrationProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await assignProjectConfigurations(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to update project configuration");
      }
    }),
  listSourceVideos: publicProcedure
    .input(listSourceVideosInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await listSourceVideosForProject(input);
      } catch (error) {
        throw toBadRequest(error, "Failed to list source videos");
      }
    }),
});
