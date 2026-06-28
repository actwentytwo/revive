# Revolution Release Process

This repository uses lightweight release tracking with Git tags and a single in-app changelog.

## Release Flow

1. Ensure quality gates pass from repo root:
   - `pnpm check`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm format:check`
   - `pnpm version:check`
2. Bump versions together where needed (`package.json`, workspace packages).
3. Update `apps/revolution-ui/src/changelog.ts`:
   - Add or update a `Live` entry for the shipped change.
   - Include at least one commit hash in `commitRefs`.
   - Keep the release date in `YYYY-MM-DD`.
4. Commit the release changes.
5. Tag the release commit as `vX.Y.Z`.

## Notes

- Git tags are the canonical release marker.
- Revolution intentionally uses one changelog surface (in-app changelog) instead of a three-document release suite.
