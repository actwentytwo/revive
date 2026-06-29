import { TRPCError } from "@trpc/server";
import type { Permission as RevolutionPermission } from "../access/permissions.schemas.js";
import { procedure, router } from "./trpc.js";

export { router };

export const publicProcedure = procedure;

export const authenticatedProc = procedure.use(async ({ ctx, next }) => {
  if (!ctx.identity) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Valid client certificate identity required.",
    });
  }

  return next();
});

export const byPermissionedProc = (requiredPermission: RevolutionPermission) =>
  authenticatedProc.use(async ({ ctx, next }) => {
    if (ctx.grants.includes("*") || ctx.grants.includes(requiredPermission)) {
      return next();
    }

    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Missing required permission '${requiredPermission}'.`,
    });
  });
