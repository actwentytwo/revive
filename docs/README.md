# Revolution Docs

- `raven-parity-plan.md`: parity execution tracker against Raven standards.
- `release-process.md`: release commit and `vX.Y.Z` tagging flow.
- `shared-package-boundary.md`: contract boundary rules for `@revolution/shared`.
- `testing-policy.md`: test layout and coverage failure policy.

## Onboarding Checklist

1. `pnpm install`
2. `cp apps/revolution-api/.env.example apps/revolution-api/.env`
3. `cp apps/revolution-ui/.env.example apps/revolution-ui/.env`
4. `pnpm dev:mongo:check:full`
5. `pnpm dev`

## Quality Gates

Run from repo root before merge or release:

```bash
pnpm check
pnpm lint
pnpm test
pnpm format:check
pnpm version:check
```
