# REVIVE

REVIVE is a greenfield Vbrick Rev migration tool scaffolded from the supplied requirements document. The current foundation is intentionally focused on a real integration slice:

- `apps/web`: React + TypeScript + Material UI operator console
- `apps/api`: Node + Express + tRPC backend
- `packages/shared`: shared migration domain types

## What is implemented

- Source Rev connection form
- Backend validation through the official `@vbrick/rev-client`
- Real source video listing with search and server-driven pagination inputs
- User-facing in-app change log for incremental rollout visibility
- Shared contracts for environment validation and source video discovery

Credentials are not persisted yet. The backend creates a Rev client session per request, performs the action, and disconnects.

## Getting started

```bash
pnpm install
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

## Suggested next steps

1. Add persistent storage for environments, mappings, and migration history.
2. Implement secure credential handling and Rev API connectors.
3. Introduce persistent configuration and encrypted credential storage.
4. Build destination connectivity, metadata mapping, and single-video migration.
