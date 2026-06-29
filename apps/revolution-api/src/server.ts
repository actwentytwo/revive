import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import crypto from "node:crypto";
import { initializeAccessCatalogs } from "./access/catalog.repository.js";
import { connectToMongo } from "./db/mongo.js";
import { closeMongoConnection } from "./db/mongo.js";
import { appRouter } from "./router.js";
import {
  createOpenApiDocumentForBaseUrl,
  createOpenApiMiddleware,
  getRequestBaseUrl,
  registerSwaggerUi,
} from "./openapi/openapi.js";
import { createContext, createHeaderRequestFromExpressRequest } from "./trpc/trpc.context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});
dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
  override: true,
});

const app = express();
app.set("trust proxy", true);

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.json({
    service: "@revolution/api",
    trpc: "/trpc",
    openapi: "/openapi.json",
    docs: "/docs",
  });
});

app.get("/openapi.json", (req, res) => {
  const baseUrl = getRequestBaseUrl(req) ?? `http://localhost:${port}`;
  res.json(createOpenApiDocumentForBaseUrl(baseUrl));
});

registerSwaggerUi(app);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) =>
      createContext({
        req: createHeaderRequestFromExpressRequest(req),
        requestId: req.header("x-request-id") ?? crypto.randomUUID(),
      }),
  }),
);

app.use("/", createOpenApiMiddleware());

const port = Number(process.env.PORT ?? 3000);

async function start() {
  await connectToMongo();
  await initializeAccessCatalogs();

  app.listen(port, () => {
    console.log(`REVIVE API listening on http://localhost:${port}`);
  });
}

void start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`Failed to start REVIVE API: ${message}`);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void closeMongoConnection().finally(() => {
      process.exit(0);
    });
  });
}
