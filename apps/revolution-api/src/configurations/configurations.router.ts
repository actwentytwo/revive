import { z } from "zod";
import { byPermissionedProc, router } from "../trpc/trpc.procedures.js";
import { toBadRequest } from "../trpc/errors.js";
import {
  createConfigurationOpenApiMeta,
  deleteConfigurationOpenApiMeta,
  listConfigurationsOpenApiMeta,
  updateConfigurationOpenApiMeta,
  validateConfigurationOpenApiMeta,
} from "./configurations.openapi.js";
import {
  createConfiguration,
  deleteConfiguration,
  listConfigurations,
  updateConfiguration,
  validateConfiguration,
} from "./configurations.service.js";
import {
  createConfigurationInputSchema,
  deleteConfigurationInputSchema,
  savedConfigurationSchema,
  updateConfigurationInputSchema,
  validateConfigurationInputSchema,
} from "./configurations.schemas.js";

export function createConfigurationsRouter(options: {
  isConfigurationInUse: (configurationId: string) => Promise<boolean>;
}) {
  return router({
    list: byPermissionedProc("configurations.read")
      .meta(listConfigurationsOpenApiMeta)
      .input(z.object({}).optional())
      .output(savedConfigurationSchema.array())
      .query(async () => listConfigurations()),
    create: byPermissionedProc("configurations.write")
      .meta(createConfigurationOpenApiMeta)
      .input(createConfigurationInputSchema)
      .output(savedConfigurationSchema)
      .mutation(async ({ input }) => {
        try {
          return await createConfiguration(input);
        } catch (error) {
          throw toBadRequest(error, "Failed to create configuration");
        }
      }),
    update: byPermissionedProc("configurations.write")
      .meta(updateConfigurationOpenApiMeta)
      .input(updateConfigurationInputSchema)
      .output(savedConfigurationSchema)
      .mutation(async ({ input }) => {
        try {
          return await updateConfiguration(input);
        } catch (error) {
          throw toBadRequest(error, "Failed to update configuration");
        }
      }),
    validate: byPermissionedProc("configurations.validate")
      .meta(validateConfigurationOpenApiMeta)
      .input(validateConfigurationInputSchema)
      .output(savedConfigurationSchema)
      .mutation(async ({ input }) => {
        try {
          return await validateConfiguration(input.configurationId);
        } catch (error) {
          throw toBadRequest(error, "Failed to validate configuration");
        }
      }),
    delete: byPermissionedProc("configurations.delete")
      .meta(deleteConfigurationOpenApiMeta)
      .input(deleteConfigurationInputSchema)
      .output(z.object({ deleted: z.boolean(), configurationId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          return await deleteConfiguration({
            configurationId: input.configurationId,
            isInUse: options.isConfigurationInUse,
          });
        } catch (error) {
          throw toBadRequest(error, "Failed to delete configuration");
        }
      }),
  });
}
