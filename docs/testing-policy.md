# Testing Policy

Revolution uses app-level unit and integration test folders in both UI and API packages.

## Test Layout

- API unit tests: `apps/revolution-api/src/test/unit/**/*.test.ts`
- API integration tests: `apps/revolution-api/src/test/integration/**/*.test.ts`
- UI unit tests: `apps/revolution-ui/src/test/unit/**/*.test.ts`
- UI integration tests: `apps/revolution-ui/src/test/integration/**/*.test.ts`

## Scripts

- `pnpm test` runs all package tests with coverage enabled.
- `pnpm test:unit` runs unit suites in all packages.
- `pnpm test:integration` runs integration suites in all packages.

## Coverage Thresholds

- Each app enforces minimum non-zero global coverage thresholds in Vitest.
- Failure policy: if coverage drops below thresholds, `pnpm test` fails and CI fails.
