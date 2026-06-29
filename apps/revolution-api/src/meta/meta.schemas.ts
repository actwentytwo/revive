import { z } from "zod";
import { authorisationModelResponseSchema } from "../access/catalog.schemas.js";

export const metaIdentitySchema = z.object({
  subject: z.string().min(1),
  issuer: z.string().optional(),
  sid: z.string().optional(),
  cn: z.string().optional(),
  emailAddress: z.string().optional(),
});

export const metaSessionSchema = z.object({
  actorType: z.enum(["human", "workload"]).nullable(),
  identity: metaIdentitySchema.nullable(),
  functionalGroups: z.array(z.string()),
  grants: z.array(z.string()),
  requestId: z.string(),
});

export const metaRefreshSessionAttributesRequestSchema = z.object({}).optional();

export const metaRefreshSessionAttributesResponseSchema = z.object({
  functionalGroups: z.array(z.string()),
  operatorEmail: z.string().nullable(),
});

export const metaAuthorisationModelSchema = authorisationModelResponseSchema;
