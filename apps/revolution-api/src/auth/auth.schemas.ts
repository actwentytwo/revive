import { z } from "zod";

export const groupLookupResponseSchema = z.object({
  formalGroups: z.array(z.string()).optional(),
  DN: z.string().optional(),
  dn: z.string().optional(),
  distinguishedName: z.string().optional(),
  mail: z.string().optional(),
  email: z.string().optional(),
  emailAddress: z.string().optional(),
});
