# Revolution Raven Parity Plan

## Goal

Bring Revolution in line with Raven engineering standards for tooling, structure, quality gates, release/versioning, and architecture patterns, while preserving Revolution product-specific domain behavior.

## Scope Rules

- Match Raven by default unless Revolution has a clear product-specific reason to differ.
- Prefer incremental PR-sized changes over large rewrites.
- Preserve current working features while refactoring.

## Parity Matrix

| Area                    | Current Revolution State                                                     | Raven Target State                                                                | Decision             | Priority |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------- | -------- |
| Workspace orchestration | `pnpm -r` scripts only                                                       | Turbo-based root orchestration with scoped filters                                | Must match Raven     | P0       |
| Root scripts            | minimal (`dev`, `build`, `lint`)                                             | full standard set (`check`, `lint:fix`, `test*`, `format*`, targeted `dev:*`)     | Must match Raven     | P0       |
| Formatting + pre-commit | no root Prettier/lint-staged/husky                                           | Prettier + `format:check` + husky/lint-staged                                     | Must match Raven     | P0       |
| CI gates                | not standardized yet                                                         | lint/check/test/format gates via CI                                               | Must match Raven     | P0       |
| Versioning              | inconsistent package versions (`0.1.1` root, `0.1.0` API/shared, `0.0.1` UI) | aligned root/API/UI version with version check script                             | Must match Raven     | P0       |
| Release docs            | no formal release process docs                                               | single lightweight changelog + tagged release flow with commit-hash traceability  | Adapt for Revolution | P1       |
| Repo conventions        | no local `AGENTS.md` yet                                                     | repo-level instructions plus shared conventions linkage                           | Must match Raven     | P1       |
| UI architecture         | basic page/component split                                                   | route composition points, thin pages, reusable shell/components/hooks             | Must match Raven     | P1       |
| API architecture        | good base pattern present                                                    | consistent schema/repository/service/router + boundary validation + error mapping | Must match Raven     | P1       |
| Testing strategy        | no parity-grade unit/integration layout                                      | app-level unit + integration scripts and coverage expectations                    | Must match Raven     | P1       |
| Dev docs structure      | minimal docs                                                                 | structured docs (development/release/ops notes as needed)                         | Adapt for Revolution | P2       |
| Ops/deploy tooling      | not equivalent yet                                                           | only add what Revolution actually needs now                                       | Adapt for Revolution | P2       |

## Execution Plan

### Phase 0: Foundation and Guardrails

- [x] Add `turbo.json` and migrate root scripts to Turbo-driven workflow.
- [x] Add `.prettierrc.json`, `.prettierignore`, `.lintstagedrc.json`, `.husky/` setup.
- [x] Add root `check`, `lint:fix`, `format`, `format:check`, `test`, `test:unit`, `test:integration` scripts.
- [x] Add `.nvmrc` and align Node engine policy with Raven.
- [x] Add root `version:check` script and implement package version consistency check.

### Phase 1: Release and Process Parity

- [x] Add local `AGENTS.md` in Revolution linked to shared conventions.
- [x] Define release commit flow and tag flow (`vX.Y.Z`).
- [x] Keep lightweight single-changelog structure (explicit local override vs Raven tri-doc model).
- [x] Add initial release commit refs and commit-hash tracking strategy.

### Phase 2: Architecture Parity

- [x] UI: enforce thin page composition pattern and move reusable logic to hooks/components.
- [x] UI: standardize app shell and shared dialog/feedback/grid primitives where applicable.
- [x] API: normalize module shape (schema -> repository -> service -> router) across all domains.
- [x] API: standardize TRPC/OpenAPI metadata and error conversion patterns.
- [x] Shared package: confirm framework-agnostic boundaries and contract ownership.

### Phase 3: Testing and CI Parity

- [ ] Add API unit and integration test layout and scripts equivalent to Raven style.
- [ ] Add UI unit and integration test layout and scripts equivalent to Raven style.
- [x] Add CI pipeline enforcing lint/check/test/format gates.
- [ ] Add minimal coverage thresholds and failure policy.

### Phase 4: Hardening and Cleanup

- [ ] Remove obsolete scripts/config once parity path is stable.
- [ ] Normalize docs and onboarding instructions.
- [ ] Validate end-to-end dev workflow from clean clone.
- [ ] Cut parity milestone release and tag.

## First Work Chunk (Recommended)

1. Add Turbo orchestration and root script parity.
2. Add format + husky + lint-staged parity.
3. Add version consistency check and align package versions.

This chunk gives immediate engineering discipline parity and prevents drift while later architecture work is in progress.

## Success Criteria

- A new engineer can run one consistent local workflow (`pnpm lint`, `pnpm check`, `pnpm test`) with deterministic results.
- Root/API/UI versions are always aligned and validated pre-merge.
- Release notes process exists and is consistently updated per release.
- UI and API modules follow Raven-style separation and are test-covered by default.
- CI enforces the same gates used locally.
