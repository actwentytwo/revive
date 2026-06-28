# REVOLUTION

REVOLUTION is a greenfield Vbrick Rev migration tool scaffolded from the supplied requirements document. The current foundation is intentionally focused on a real integration slice:

- `apps/revolution-ui`: React + TypeScript + Material UI operator console
- `apps/revolution-api`: Node + Express + tRPC backend
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
cp apps/revolution-api/.env.example apps/revolution-api/.env
cp apps/revolution-ui/.env.example apps/revolution-ui/.env
pnpm dev:mongo:check:full
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Swagger UI: `http://localhost:3000/docs`

Set these environment variables before starting the API:

- `MONGODB_URI`
- `MONGODB_DB_NAME`

The API reads them from `apps/revolution-api/.env`.

The UI reads optional Vite settings from `apps/revolution-ui/.env`.

- `VITE_VBRICK_VERSIONS`
  Example: `VITE_VBRICK_VERSIONS=v6.0,v7.3,v8.1,v8.6`

For the current local Docker-backed Mongo setup, use an authenticated URI like:

- `MONGODB_URI=mongodb://revolution:replace-me@127.0.0.1:27017/revolution?authSource=revolution&directConnection=true`

To match Raven/TAP local workflow, use these checks before starting the API:

- `pnpm dev:mongo:check` for TCP connectivity only.
- `pnpm dev:mongo:check:full` for authenticated Mongo ping using `MONGODB_URI`.

## Release workflow

- Run: `pnpm check && pnpm lint && pnpm test && pnpm format:check && pnpm version:check`
- Update the in-app changelog at `apps/revolution-ui/src/changelog.ts` with release details and `commitRefs`
- Tag release commits with `vX.Y.Z`
- See [docs/release-process.md](docs/release-process.md) for full details

## Shared contracts boundary

- `packages/shared` is reserved for framework-agnostic cross-app contracts.
- Validate boundary rules with `pnpm boundary:check` (also included in `pnpm check`).
- See [docs/shared-package-boundary.md](docs/shared-package-boundary.md).

## Testing

- `pnpm test` runs workspace tests with coverage.
- `pnpm test:unit` runs unit suites.
- `pnpm test:integration` runs integration suites.
- See [docs/testing-policy.md](docs/testing-policy.md) for layout and coverage policy.

## Documentation index

- See [docs/README.md](docs/README.md) for development, release, and parity docs.

## Suggested next steps

1. Add destination environment persistence and validation for each project.
2. Implement secure credential handling and encryption for stored secrets.
3. Introduce migration run/history collections and queue execution.
4. Build destination connectivity, metadata mapping, and single-video migration.
