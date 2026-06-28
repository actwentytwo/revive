import { initTRPC } from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import superjson from "superjson";

const t = initTRPC.meta<OpenApiMeta>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
