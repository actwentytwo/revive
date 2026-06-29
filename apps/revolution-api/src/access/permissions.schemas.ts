import { z } from "zod";
import { PERMISSION_CATALOG } from "./catalog.defaults.js";

export const permissionSchema = z.enum(
  PERMISSION_CATALOG.map((permission) => permission.key) as [
    (typeof PERMISSION_CATALOG)[number]["key"],
    ...(typeof PERMISSION_CATALOG)[number]["key"][],
  ],
);

export type Permission = z.infer<typeof permissionSchema>;
