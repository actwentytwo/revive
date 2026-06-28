# REVIVE

REVIVE is a greenfield Vbrick Rev migration tool scaffolded from the supplied requirements document. The current foundation is intentionally focused on a real integration slice:

- `apps/revive-ui`: React + TypeScript + Material UI operator console
- `apps/revive-api`: Node + Express + tRPC backend
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
cp apps/revive-api/.env.example apps/revive-api/.env
cp apps/revive-ui/.env.example apps/revive-ui/.env
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

Set these environment variables before starting the API:

- `MONGODB_URI`
- `MONGODB_DB_NAME`

The API reads them from `apps/revive-api/.env`.

The UI reads optional Vite settings from `apps/revive-ui/.env`.

- `VITE_VBRICK_VERSIONS`
  Example: `VITE_VBRICK_VERSIONS=v6.0,v7.3,v8.1,v8.6`

For the current local Docker-backed Mongo setup, use an authenticated URI like:

- `MONGODB_URI=mongodb://revive:replace-me@127.0.0.1:27017/revive?authSource=revive&directConnection=true`

## Suggested next steps

1. Add destination environment persistence and validation for each project.
2. Implement secure credential handling and encryption for stored secrets.
3. Introduce migration run/history collections and queue execution.
4. Build destination connectivity, metadata mapping, and single-video migration.
