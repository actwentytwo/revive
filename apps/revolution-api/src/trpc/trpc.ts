import { initTRPC } from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import superjson from "superjson";
import type { TrpcContext } from "./trpc.context.js";

const t = initTRPC.context<TrpcContext>().meta<OpenApiMeta>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;
