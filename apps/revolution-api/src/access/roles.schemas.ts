import { z } from "zod";
import { ROLE_CATALOG } from "./catalog.defaults.js";

export const roleSchema = z.enum(
  ROLE_CATALOG.map((role) => role.key) as [
    (typeof ROLE_CATALOG)[number]["key"],
    ...(typeof ROLE_CATALOG)[number]["key"][],
  ],
);

export type Role = z.infer<typeof roleSchema>;
