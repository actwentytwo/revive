import cors from 'cors'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './router.js'

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

app.listen(port, () => {
  console.log(`REVIVE API listening on http://localhost:${port}`)
})
