import type { Express, Request, RequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "../router.js";
import { createContext, createHeaderRequestFromExpressRequest } from "../trpc/trpc.context.js";

const openApiTags = ["meta", "configurations", "projects", "videos"] as const;

export const createOpenApiDocumentForBaseUrl = (baseUrl: string) =>
  ({
    ...generateOpenApiDocument(appRouter, {
      title: "Revolution API",
      description: "Revolution migration API.",
      version: process.env.npm_package_version ?? "0.2.0",
      baseUrl,
    }),
    tags: openApiTags.map((name) => ({ name })),
  }) as ReturnType<typeof generateOpenApiDocument>;

export const createOpenApiMiddleware = (): RequestHandler =>
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) =>
      createContext({
        req: createHeaderRequestFromExpressRequest(req),
        requestId: req.header("x-request-id") ?? "openapi-request",
      }),
  }) as RequestHandler;

export const registerSwaggerUi = (app: Express): void => {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      customSiteTitle: "REVOLUTION API Docs",
      explorer: false,
      swaggerOptions: {
        docExpansion: "none",
        url: "/openapi.json",
        validatorUrl: null,
      },
    }),
  );
};

export function getRequestBaseUrl(req: Request): string | null {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host;

  if (!hostHeader) {
    return null;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protoCandidate = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const protocol = protoCandidate?.split(",")[0]?.trim() || req.protocol || "http";

  return `${protocol}://${hostHeader}`;
}
