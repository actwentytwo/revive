# Shared Package Boundary

`@revolution/shared` is the cross-app contract layer for Revolution.

## Boundary Rules

- Keep this package framework-agnostic and runtime-agnostic.
- Export only shared contracts (types and contract-oriented shapes).
- Do not import UI, API, database, routing, or transport libraries.
- Do not access environment variables, filesystem, network, or process runtime behavior.
- Keep import direction one-way: `apps/* -> @revolution/shared`.

## Enforced Guardrail

- Run `pnpm boundary:check` from repo root.
- `pnpm check` includes `boundary:check` so CI and local checks enforce this rule.
- The guardrail fails when:
  - `packages/shared/package.json` declares runtime dependencies.
  - Source files under `packages/shared/src` import external modules.
  - Source files under `packages/shared/src` import paths outside the shared package.

## Ownership

- Shared contracts are owned in `packages/shared`.
- Product workflows, business logic, API transport details, and UI behavior are owned in `apps/revolution-api` and `apps/revolution-ui`.
