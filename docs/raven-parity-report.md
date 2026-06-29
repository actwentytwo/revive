# Raven Parity Report (Revolution)

Date: 2026-06-29
Scope: access/auth/meta + platform authorisation/profile UI structure
Reference: `/Users/sandy71085/repos/raven`

## Structural Status

- `apps/revolution-api/src/access` now matches Raven file set 1:1.
- `apps/revolution-ui/src/components/authorisation` now matches Raven file set 1:1.
- `apps/revolution-api/src/access/catalog.ts` was removed to align with Raven pattern (`catalog.defaults.ts` as source of defaults/catalog constants).

## Completed Parity Work

- Added and wired `access.*` router surfaces:
  - `access.authorisationModel`
  - `access.functionalGroups.list`
  - `access.grants.list`
  - `access.audit.list`
  - `access.effectiveAccess.bySubject`
  - `access.myAccess`
  - `access.rolePermissions.update`
- Expanded access/meta schemas to Raven-like model shape:
  - permission `label/category/scope`
  - role `label/grantScope/actorType`
  - procedure catalog in authorisation model
  - effective access with reason records (`grantId`, `roleKey`, `scopeKey`, `grantSource`)
- Rewired UI authorisation tabs from placeholders to API-backed views:
  - `FunctionalGroupsTab`
  - `AccessGrantsTab`
  - `AuditEventsTab`
  - `EffectiveAccessTab`
- Updated profile access view (`MyAccessTab`) to include grants and reason detail like Raven’s summary style.
- Updated permission helper (`useAccessPermissions`) to reason-aware `can(permission, scope?)` semantics.
- Ported role-permission editor flow:
  - added route/page `/configuration/authorisation/roles/:roleKey/permissions`
  - replaced `PermissionFiltersDialog`, `RolePermissionsChecklistView`, and `RolePermissionsTransferView` stubs with functional components
  - wired update mutation to `access.rolePermissions.update`
  - authorisation model tab now links to per-role permission editor
- Replaced synthetic access read layer with Mongo-backed repository data:
  - functional groups now read from `functional-group-catalog`
  - access grants now read from `access-grants`
  - effective access now derives from persisted grants and role-permission catalog
  - audit tab now reads from `access-audit-events`
- Added persisted access audit event for role permission updates (`access.role-permissions.updated`).
- Added functional group and access grant CRUD surfaces (API + UI baseline flow):
  - API mutations: create/update/delete for functional groups; create/update/disable/delete for access grants
  - UI dialogs/actions in Functional Groups and Access Grants tabs now call those mutations
  - mutation actions invalidate access queries (`access.grants.list`, `access.functionalGroups.list`, `access.myAccess`) for immediate parity refresh behavior

## Remaining Differences (Behavioral)

- Role-permission editor behavior is close but not identical to Raven:
  - does not yet include Raven-specific `UnsavedChangesDialog` route blocker flow
  - does not yet include Raven preference persistence for checklist vs transfer layout
  - uses Revolution page-header primitives instead of Raven `EntityPageHeader`/tooltip stack
- Functional group/access-grant CRUD is now implemented, but behavior is still lighter than Raven:
  - no Raven-level integrity guardrails yet (e.g. protection rules before deleting referenced functional groups)
  - no Raven-equivalent advanced filtering/scope-aware editors in grids/dialogs

## Validation

- `pnpm check`: pass
- `pnpm test`: pass
- `pnpm format:check`: pass

## Next High-Impact Steps

1. Port Raven integrity constraints/validation semantics for functional group and access grant lifecycle operations.
2. Add full Raven-style unsaved-changes blocker and editor layout preference persistence in role-permission editor.
3. Align authorisation editor chrome and tab interactions to Raven `EntityPageHeader`/tooltip and grid-state patterns if strict UI parity is required.
