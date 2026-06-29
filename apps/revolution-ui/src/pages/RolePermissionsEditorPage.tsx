import { useEffect, useMemo, useState } from "react";

import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import {
  Alert,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../components/PageHeader";
import { AccessDeniedNotice } from "../components/authorisation/AccessDeniedNotice";
import { PermissionFiltersDialog } from "../components/authorisation/PermissionFiltersDialog";
import { RolePermissionsChecklistView } from "../components/authorisation/RolePermissionsChecklistView";
import { RolePermissionsTransferView } from "../components/authorisation/RolePermissionsTransferView";
import { useAccessPermissions } from "../hooks/useAccessPermissions";
import { trpc } from "../main";
import type { AuthorisationModelResponse } from "../types/meta";

type RolePermission = AuthorisationModelResponse["permissions"][number];
type PermissionKey = RolePermission["key"];
type PermissionScope = RolePermission["scope"];
type PermissionCategory = RolePermission["category"];
type PermissionEditorLayout = "checklist" | "transfer";

const scopeFilterGroups: Array<{ scope: PermissionScope; label: string; shortLabel: string }> = [
  { scope: "global", label: "Applies globally", shortLabel: "Global" },
  { scope: "environment", label: "Can be scoped to environment", shortLabel: "Environment" },
  {
    scope: "environment-cluster",
    label: "Can be scoped to environment + cluster",
    shortLabel: "Environment + Cluster",
  },
];

const permissionCategoryLabels: Record<PermissionCategory, string> = {
  operational: "Operational",
  developer: "Developer",
};

const isLockedRole = (roleKey: string) => roleKey === "REVOLUTION_PLATFORM_ADMINS";

const getPermissionDomain = (permissionKey: string): string => {
  const separatorIndex = permissionKey.lastIndexOf(".");
  return separatorIndex === -1 ? permissionKey : permissionKey.slice(0, separatorIndex);
};

const formatPermissionDomain = (domain: string): string =>
  domain
    .split("-")
    .filter(Boolean)
    .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`)
    .join(" ");

const arePermissionSetsEqual = (left: PermissionKey[], right: PermissionKey[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((permissionKey) => rightSet.has(permissionKey));
};

const toggleListValue = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
const getPermissionScopeLabel = (scope: PermissionScope) =>
  scopeFilterGroups.find((group) => group.scope === scope)?.label ?? scope;
const getPermissionCategoryLabel = (category: PermissionCategory) =>
  permissionCategoryLabels[category] ?? category;

export const RolePermissionsEditorPage = () => {
  const { roleKey = "" } = useParams();
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();
  const { myAccess, can } = useAccessPermissions();
  const canReadModel = can("authorisation-model.read");
  const canUpdateModel = can("authorisation-model.update");
  const [search, setSearch] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<PermissionKey[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState<PermissionEditorLayout>("checklist");

  const authorisationModel = trpc.meta.authorisationModel.useQuery(undefined, {
    enabled: canReadModel,
    retry: false,
  });

  const role =
    authorisationModel.data?.roles.find((candidate) => candidate.key === roleKey) ?? null;
  const permissions = useMemo(
    () => authorisationModel.data?.permissions ?? [],
    [authorisationModel.data?.permissions],
  );
  const editablePermissions = useMemo(() => permissions, [permissions]);
  const initialPermissionKeys = useMemo(() => role?.permissions ?? [], [role?.permissions]);

  useEffect(() => {
    setSelectedPermissionKeys(initialPermissionKeys);
  }, [initialPermissionKeys]);

  const domainGroups = useMemo(
    () =>
      scopeFilterGroups
        .map((group) => ({
          ...group,
          domains: [
            ...new Set(
              editablePermissions
                .filter((permission) => permission.scope === group.scope)
                .map((permission) => getPermissionDomain(permission.key)),
            ),
          ].sort((left, right) =>
            formatPermissionDomain(left).localeCompare(formatPermissionDomain(right)),
          ),
        }))
        .filter((group) => group.domains.length > 0),
    [editablePermissions],
  );

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const domainFilteredPermissions =
      selectedDomains.length === 0
        ? editablePermissions
        : editablePermissions.filter((permission) =>
            selectedDomains.includes(getPermissionDomain(permission.key)),
          );

    if (!query) {
      return domainFilteredPermissions;
    }

    return domainFilteredPermissions.filter((permission) =>
      [
        permission.key,
        permission.description,
        permission.category,
        getPermissionCategoryLabel(permission.category),
        permission.scope,
        getPermissionScopeLabel(permission.scope),
        getPermissionDomain(permission.key),
        formatPermissionDomain(getPermissionDomain(permission.key)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [editablePermissions, search, selectedDomains]);

  const updateRolePermissionsMutation = trpc.access.rolePermissions.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcUtils.meta.authorisationModel.invalidate(),
        trpcUtils.access.myAccess.invalidate(),
      ]);
    },
  });

  const visiblePermissionKeys = useMemo(
    () => filteredPermissions.map((permission) => permission.key),
    [filteredPermissions],
  );
  const activeFilterCount = selectedDomains.length;
  const hasActiveFilter = activeFilterCount > 0 || search.trim().length > 0;
  const grantButtonLabel = hasActiveFilter ? "Grant Filtered" : "Grant All";
  const revokeButtonLabel = hasActiveFilter ? "Revoke Filtered" : "Revoke All";
  const isDirty = !arePermissionSetsEqual(selectedPermissionKeys, initialPermissionKeys);
  const pending = updateRolePermissionsMutation.isPending;

  if (!canReadModel || !canUpdateModel) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="Edit role permissions"
          description="Manage which permissions belong to a role."
        />
        <AccessDeniedNotice message="You do not have permission to edit role permissions." />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={role ? `Edit ${role.label}` : "Edit role permissions"}
        description={role?.description ?? "Manage which permissions belong to a role."}
        actions={
          role && !isLockedRole(role.key) ? (
            <>
              {isDirty ? (
                <IconButton
                  size="small"
                  color="inherit"
                  disabled={pending}
                  onClick={() => setSelectedPermissionKeys(initialPermissionKeys)}
                >
                  <UndoOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
              <Button
                variant="text"
                onClick={() => navigate("/configuration?tab=authorisation")}
                disabled={pending}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (!role) {
                    return;
                  }

                  void updateRolePermissionsMutation.mutateAsync({
                    roleKey: role.key,
                    permissionKeys: selectedPermissionKeys as typeof role.permissions,
                  });
                }}
                disabled={pending || !isDirty}
              >
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </>
          ) : null
        }
      />

      {myAccess.isError ? (
        <Alert severity="error">
          Your access profile could not be loaded. Permission-gated actions may be unavailable.
        </Alert>
      ) : null}
      {authorisationModel.isLoading ? (
        <Alert severity="info">Loading authorisation model...</Alert>
      ) : null}
      {authorisationModel.isError ? (
        <Alert severity="warning">The authorisation model could not be loaded from the API.</Alert>
      ) : null}
      {updateRolePermissionsMutation.error ? (
        <Alert severity="error">{updateRolePermissionsMutation.error.message}</Alert>
      ) : null}

      {!authorisationModel.isLoading && !role ? (
        <AccessDeniedNotice message="This role could not be found in the authorisation model." />
      ) : null}
      {role && isLockedRole(role.key) ? (
        <AccessDeniedNotice message="Platform admin permissions are fixed and cannot be edited." />
      ) : null}

      {role && !isLockedRole(role.key) ? (
        <>
          <Paper variant="outlined" sx={{ p: { xs: 1.75, md: 2.25 } }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1.25}
                useFlexGap
                sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
              >
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => setFiltersOpen(true)}
                  sx={{ whiteSpace: "nowrap", height: 32, minHeight: 32, borderColor: "divider" }}
                >
                  {activeFilterCount > 0
                    ? `Permission filters (${activeFilterCount})`
                    : "Permission filters"}
                  {activeFilterCount > 0 ? (
                    <FilterAltIcon fontSize="small" sx={{ ml: 0.75 }} />
                  ) : (
                    <FilterAltOutlinedIcon fontSize="small" sx={{ ml: 0.75 }} />
                  )}
                </Button>
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems="stretch"
                sx={{ width: "100%" }}
              >
                <TextField
                  label="Search permissions"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  disabled={pending}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Clear permission search"
                            edge="end"
                            size="small"
                            disabled={pending}
                            onClick={() => setSearch("")}
                          >
                            <ClearOutlinedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{
                    flex: 1,
                    minWidth: { xs: "100%", md: 0 },
                    "& .MuiInputBase-root": { minHeight: 36 },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setSelectedPermissionKeys((current) => [
                      ...new Set([...current, ...visiblePermissionKeys]),
                    ])
                  }
                  disabled={pending || visiblePermissionKeys.length === 0}
                  sx={{ minHeight: 36, minWidth: { xs: "100%", md: 136 }, whiteSpace: "nowrap" }}
                >
                  {grantButtonLabel}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setSelectedPermissionKeys((current) =>
                      current.filter(
                        (permissionKey) =>
                          !visiblePermissionKeys.includes(
                            permissionKey as (typeof visiblePermissionKeys)[number],
                          ),
                      ),
                    )
                  }
                  disabled={pending || visiblePermissionKeys.length === 0}
                  sx={{ minHeight: 36, minWidth: { xs: "100%", md: 152 }, whiteSpace: "nowrap" }}
                >
                  {revokeButtonLabel}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                useFlexGap
                sx={{ flexWrap: "wrap" }}
              >
                <Typography variant="h5">Permissions</Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={layout}
                  onChange={(_event, value: PermissionEditorLayout | null) =>
                    value && setLayout(value)
                  }
                  aria-label="Permission editor layout"
                  sx={{ "& .MuiToggleButton-root": { height: 24, minWidth: 34, px: 0.75 } }}
                >
                  <ToggleButton value="checklist" aria-label="Checklist view">
                    <ViewAgendaOutlinedIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="transfer" aria-label="Available and granted columns">
                    <ViewColumnOutlinedIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Divider />

              {layout === "checklist" ? (
                <RolePermissionsChecklistView
                  permissions={filteredPermissions}
                  selectedPermissionKeys={selectedPermissionKeys}
                  pending={pending}
                  onTogglePermission={(permissionKey) =>
                    setSelectedPermissionKeys((current) => toggleListValue(current, permissionKey))
                  }
                  getPermissionScopeLabel={getPermissionScopeLabel}
                  getPermissionCategoryLabel={getPermissionCategoryLabel}
                />
              ) : (
                <RolePermissionsTransferView
                  permissions={filteredPermissions}
                  selectedPermissionKeys={selectedPermissionKeys}
                  pending={pending}
                  onGrantPermissions={(permissionKeys) =>
                    setSelectedPermissionKeys((current) => [
                      ...new Set([...current, ...permissionKeys]),
                    ])
                  }
                  onRevokePermissions={(permissionKeys) =>
                    setSelectedPermissionKeys((current) =>
                      current.filter((permissionKey) => !permissionKeys.includes(permissionKey)),
                    )
                  }
                  getPermissionScopeLabel={getPermissionScopeLabel}
                  getPermissionCategoryLabel={getPermissionCategoryLabel}
                />
              )}
            </Stack>
          </Paper>

          <PermissionFiltersDialog
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            domainGroups={domainGroups}
            selectedDomains={selectedDomains}
            onToggleDomain={(domain) =>
              setSelectedDomains((current) => toggleListValue(current, domain))
            }
            onToggleDomainGroup={(domains) =>
              setSelectedDomains((current) => {
                const allSelected = domains.every((domain) => current.includes(domain));
                return allSelected
                  ? current.filter((domain) => !domains.includes(domain))
                  : [...new Set([...current, ...domains])];
              })
            }
            onClearFilters={() => {
              setSelectedDomains([]);
            }}
            formatDomain={formatPermissionDomain}
          />
        </>
      ) : null}
    </Stack>
  );
};
