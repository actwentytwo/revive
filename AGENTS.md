# Revolution Agent Notes

Revolution follows the shared conventions baseline from:

- `shared-conventions/docs/README.md`
- `shared-conventions/docs/release-deploy-guidelines.md`

## Local Overrides

- Change documentation stays lightweight in this repo. We maintain a single in-app changelog source at `apps/revolution-ui/src/changelog.ts` rather than separate What's New / Release Notes / Technical Changelog documents.
- For each `Live` changelog entry, include one or more Git commit hashes in `commitRefs` so shipped behavior can be traced to source commits.
- If this file conflicts with shared conventions docs, this file is the local source of truth for Revolution.
