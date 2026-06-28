import { z } from "zod";
import {
  environmentSchema,
  environmentValidationSchema,
} from "../configurations/configurations.schemas.js";

export const projectTypeSchema = z.enum(["migration"]);

export const migrationProjectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  projectType: projectTypeSchema,
  summary: z.string().min(1),
  sourceConfigurationId: z.string().min(1).nullable(),
  destinationConfigurationId: z.string().min(1).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const migrationProjectRecordSchema = migrationProjectSchema.extend({
  sourceEnvironment: environmentSchema.nullable().optional(),
  sourceValidatedEnvironment: environmentValidationSchema.nullable().optional(),
  destinationEnvironment: environmentSchema.nullable().optional(),
  destinationValidatedEnvironment: environmentValidationSchema.nullable().optional(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(1),
  projectType: projectTypeSchema,
  summary: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
});

export const updateProjectInputSchema = z.object({
  projectId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
});

export const deleteProjectInputSchema = z.object({
  projectId: z.string().trim().min(1),
});

export const assignProjectConfigurationsInputSchema = z.object({
  projectId: z.string().trim().min(1),
  sourceConfigurationId: z.string().trim().min(1).nullable(),
  destinationConfigurationId: z.string().trim().min(1).nullable(),
});

export const listSourceVideosInputSchema = z.object({
  projectId: z.string().trim().min(1),
  search: z.string().trim().optional(),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectInputSchema>;
export type ListSourceVideosInput = z.infer<typeof listSourceVideosInputSchema>;
export type MigrationProjectRecord = z.infer<typeof migrationProjectRecordSchema>;
export type AssignProjectConfigurationsInput = z.infer<
  typeof assignProjectConfigurationsInputSchema
>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
