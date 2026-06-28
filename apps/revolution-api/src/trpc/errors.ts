import { TRPCError } from "@trpc/server";

export function toBadRequest(error: unknown, fallbackMessage: string) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: error instanceof Error ? error.message : fallbackMessage,
  });
}
