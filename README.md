# REVIVE

REVIVE is a greenfield Vbrick Rev migration tool scaffolded from the supplied requirements document. The current foundation is intentionally focused on a real integration slice:

- `apps/web`: React + TypeScript + Material UI operator console
- `apps/api`: Node + Express + tRPC backend
- `packages/shared`: shared migration domain types

## What is implemented

- Mongo-backed project persistence using a `schemas -> repository -> service -> router` backend pattern
- Source Rev connection form
- Backend validation through the official `@vbrick/rev-client`
- Real source video listing with search and server-driven pagination inputs
- User-facing in-app change log for incremental rollout visibility
- Shared contracts for environment validation and source video discovery

Source environment details are now stored per project in MongoDB. The backend still creates a Rev client session per request, performs the action, and disconnects.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

Set these environment variables before starting the API:

- `MONGODB_URI`
- `MONGODB_DB_NAME`

## Suggested next steps

1. Add destination environment persistence and validation for each project.
2. Implement secure credential handling and encryption for stored secrets.
3. Introduce migration run/history collections and queue execution.
4. Build destination connectivity, metadata mapping, and single-video migration.
