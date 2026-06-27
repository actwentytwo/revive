import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { connectToMongo } from './db/mongo.js'
import { closeMongoConnection } from './db/mongo.js'
import { appRouter } from './router.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
  }),
)

const port = Number(process.env.PORT ?? 3000)

async function start() {
  await connectToMongo()

  app.listen(port, () => {
    console.log(`REVIVE API listening on http://localhost:${port}`)
  })
}

void start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error'
  console.error(`Failed to start REVIVE API: ${message}`)
  process.exit(1)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void closeMongoConnection().finally(() => {
      process.exit(0)
    })
  })
}
