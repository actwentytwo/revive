import { z } from "zod";

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
