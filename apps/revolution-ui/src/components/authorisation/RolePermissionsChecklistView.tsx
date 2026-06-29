import { Box, Checkbox, Chip, FormControlLabel, Stack, Typography } from "@mui/material";

import type { AuthorisationModelResponse } from "../../types/meta";

type RolePermission = AuthorisationModelResponse["permissions"][number];
type PermissionKey = RolePermission["key"];

type RolePermissionsChecklistViewProps = {
  permissions: RolePermission[];
  selectedPermissionKeys: PermissionKey[];
  pending: boolean;
  onTogglePermission: (permissionKey: PermissionKey) => void;
  getPermissionScopeLabel: (scope: RolePermission["scope"]) => string;
  getPermissionCategoryLabel: (category: RolePermission["category"]) => string;
};

export const RolePermissionsChecklistView = ({
  permissions,
  selectedPermissionKeys,
  pending,
  onTogglePermission,
  getPermissionScopeLabel,
  getPermissionCategoryLabel,
}: RolePermissionsChecklistViewProps) => {
  const selectedSet = new Set(selectedPermissionKeys);

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {permissions.map((permission) => (
        <Box
          key={permission.key}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSet.has(permission.key)}
                disabled={pending}
                onChange={() => onTogglePermission(permission.key)}
              />
            }
            label={
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography sx={{ fontWeight: 700 }}>{permission.key}</Typography>
                  <Chip
                    label={getPermissionCategoryLabel(permission.category)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={getPermissionScopeLabel(permission.scope)}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {permission.description}
                </Typography>
              </Stack>
            }
            sx={{ alignItems: "flex-start", width: "100%", m: 0 }}
          />
        </Box>
      ))}
      {permissions.length === 0 ? (
        <Box
          sx={{ display: "grid", minHeight: 160, placeItems: "center", color: "text.secondary" }}
        >
          <Typography>No permissions match the current filters.</Typography>
        </Box>
      ) : null}
    </Box>
  );
};
