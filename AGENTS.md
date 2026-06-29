# Revolution Agent Notes

Revolution follows the shared conventions baseline from:

- `shared-conventions/docs/README.md`
- `shared-conventions/docs/release-deploy-guidelines.md`

## Local Overrides

- Change documentation stays lightweight in this repo. We maintain a single in-app changelog source at `apps/revolution-ui/src/changelog.ts` rather than separate What's New / Release Notes / Technical Changelog documents.
- For each `Live` changelog entry, include one or more Git commit hashes in `commitRefs` so shipped behavior can be traced to source commits.
- If this file conflicts with shared conventions docs, this file is the local source of truth for Revolution.

## Cross-App Consistency Rules

- Default to Raven/TAP parity behavior for architecture, auth, RBAC, API shape, and process unless the user explicitly approves a deviation.
- If a deviation is proposed or implemented, mark it clearly as `DEVIATION` in the discussion/commit summary and explain why.
- For every approved deviation, include a propagation note stating whether the same change should be applied to Raven/TAP (`yes` or `no`) and why.
- Do not commit unapproved deviations from Raven/TAP parity.
