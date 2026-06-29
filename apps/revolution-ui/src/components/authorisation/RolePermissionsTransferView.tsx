import { useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import { Box, Button, Chip, Paper, Stack, Typography, keyframes } from "@mui/material";

import type { AuthorisationModelResponse } from "../../types/meta";

type RolePermission = AuthorisationModelResponse["permissions"][number];
type PermissionKey = RolePermission["key"];
type TransferSide = "available" | "granted";

type RolePermissionsTransferViewProps = {
  permissions: RolePermission[];
  selectedPermissionKeys: PermissionKey[];
  pending: boolean;
  onGrantPermissions: (permissionKeys: PermissionKey[]) => void;
  onRevokePermissions: (permissionKeys: PermissionKey[]) => void;
  getPermissionScopeLabel: (scope: RolePermission["scope"]) => string;
  getPermissionCategoryLabel: (category: RolePermission["category"]) => string;
};

const getPermissionKeySet = (permissionKeys: PermissionKey[]) => new Set(permissionKeys);
const movedPulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.42);
    transform: translateY(-1px);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(6, 182, 212, 0);
    transform: translateY(0);
  }
`;

export const RolePermissionsTransferView = ({
  permissions,
  selectedPermissionKeys,
  pending,
  onGrantPermissions,
  onRevokePermissions,
  getPermissionScopeLabel,
  getPermissionCategoryLabel,
}: RolePermissionsTransferViewProps) => {
  const [highlightedAvailableKeys, setHighlightedAvailableKeys] = useState<PermissionKey[]>([]);
  const [highlightedGrantedKeys, setHighlightedGrantedKeys] = useState<PermissionKey[]>([]);
  const [dragOverSide, setDragOverSide] = useState<TransferSide | null>(null);
  const [draggingKeys, setDraggingKeys] = useState<PermissionKey[]>([]);
  const [recentlyMovedKeys, setRecentlyMovedKeys] = useState<PermissionKey[]>([]);
  const selectedPermissionSet = getPermissionKeySet(selectedPermissionKeys);
  const availablePermissions = permissions.filter(
    (permission) => !selectedPermissionSet.has(permission.key),
  );
  const grantedPermissions = permissions.filter((permission) =>
    selectedPermissionSet.has(permission.key),
  );
  const visibleAvailableKeys = availablePermissions.map((permission) => permission.key);
  const visibleGrantedKeys = grantedPermissions.map((permission) => permission.key);
  const selectedVisibleAvailableKeys = highlightedAvailableKeys.filter((permissionKey) =>
    visibleAvailableKeys.includes(permissionKey),
  );
  const selectedVisibleGrantedKeys = highlightedGrantedKeys.filter((permissionKey) =>
    visibleGrantedKeys.includes(permissionKey),
  );

  const toggleHighlightedKey = (side: TransferSide, permissionKey: PermissionKey) => {
    const setter = side === "available" ? setHighlightedAvailableKeys : setHighlightedGrantedKeys;
    setter((current) =>
      current.includes(permissionKey)
        ? current.filter((value) => value !== permissionKey)
        : [...current, permissionKey],
    );
  };

  const clearHighlightedKeys = (side: TransferSide) => {
    const setter = side === "available" ? setHighlightedAvailableKeys : setHighlightedGrantedKeys;
    setter([]);
  };

  const selectAllVisibleKeys = (side: TransferSide) => {
    const setter = side === "available" ? setHighlightedAvailableKeys : setHighlightedGrantedKeys;
    const permissionKeys = side === "available" ? visibleAvailableKeys : visibleGrantedKeys;
    setter(permissionKeys);
  };

  const markRecentlyMoved = (permissionKeys: PermissionKey[]) => {
    setRecentlyMovedKeys(permissionKeys);
    window.setTimeout(
      () =>
        setRecentlyMovedKeys((current) =>
          current.filter((permissionKey) => !permissionKeys.includes(permissionKey)),
        ),
      1800,
    );
  };

  const transferKeys = (side: TransferSide, permissionKeys: PermissionKey[]) => {
    if (permissionKeys.length === 0) {
      return;
    }

    if (side === "granted") {
      onGrantPermissions(permissionKeys);
      setHighlightedAvailableKeys((current) =>
        current.filter((permissionKey) => !permissionKeys.includes(permissionKey)),
      );
      setHighlightedGrantedKeys((current) => [...new Set([...current, ...permissionKeys])]);
      markRecentlyMoved(permissionKeys);
      return;
    }

    onRevokePermissions(permissionKeys);
    setHighlightedGrantedKeys((current) =>
      current.filter((permissionKey) => !permissionKeys.includes(permissionKey)),
    );
    setHighlightedAvailableKeys((current) => [...new Set([...current, ...permissionKeys])]);
    markRecentlyMoved(permissionKeys);
  };

  const getDraggedKeys = (side: TransferSide, permissionKey: PermissionKey) => {
    const highlightedKeys =
      side === "available" ? selectedVisibleAvailableKeys : selectedVisibleGrantedKeys;
    return highlightedKeys.includes(permissionKey) ? highlightedKeys : [permissionKey];
  };

  const renderPermissionCard = (permission: RolePermission, side: TransferSide) => {
    const highlightedKeys =
      side === "available" ? highlightedAvailableKeys : highlightedGrantedKeys;
    const isHighlighted = highlightedKeys.includes(permission.key);
    const wasRecentlyMoved = recentlyMovedKeys.includes(permission.key);
    const oppositeSide = side === "available" ? "granted" : "available";

    return (
      <Paper
        key={permission.key}
        variant="outlined"
        draggable={!pending}
        onDragStart={(event) => {
          const draggedKeys = getDraggedKeys(side, permission.key);
          event.dataTransfer.setData("application/x-raven-permission-side", side);
          event.dataTransfer.setData(
            "application/x-raven-permission-keys",
            JSON.stringify(draggedKeys),
          );
          event.dataTransfer.effectAllowed = "move";
          setDraggingKeys(draggedKeys);
        }}
        onDragEnd={() => {
          setDraggingKeys([]);
          setDragOverSide(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          toggleHighlightedKey(side, permission.key);
        }}
        onDoubleClick={() => transferKeys(oppositeSide, getDraggedKeys(side, permission.key))}
        sx={{
          cursor: pending ? "default" : "grab",
          px: 1.25,
          py: 1,
          borderColor: wasRecentlyMoved
            ? "info.main"
            : isHighlighted
              ? "secondary.main"
              : "divider",
          backgroundColor: wasRecentlyMoved
            ? "action.hover"
            : isHighlighted
              ? "action.selected"
              : "background.paper",
          animation: wasRecentlyMoved ? `${movedPulse} 700ms ease-out` : "none",
          transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
          "&:active": {
            cursor: pending ? "default" : "grabbing",
          },
        }}
      >
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={0.75} alignItems="flex-start">
            <DragIndicatorOutlinedIcon
              fontSize="small"
              color={isHighlighted || wasRecentlyMoved ? "secondary" : "disabled"}
              sx={{ mt: 0.15, flexShrink: 0 }}
            />
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
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
          </Stack>
        </Stack>
      </Paper>
    );
  };

  const renderColumn = (
    side: TransferSide,
    title: string,
    description: string,
    sidePermissions: RolePermission[],
  ) => (
    <Paper
      variant="outlined"
      onClick={() => clearHighlightedKeys(side)}
      onDragEnter={() => setDragOverSide(side)}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragOverSide(null);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOverSide(null);
        const sourceSide = event.dataTransfer.getData(
          "application/x-raven-permission-side",
        ) as TransferSide;
        if (sourceSide === side) {
          return;
        }

        const permissionKeys = JSON.parse(
          event.dataTransfer.getData("application/x-raven-permission-keys") || "[]",
        ) as PermissionKey[];
        setDraggingKeys([]);
        transferKeys(side, permissionKeys);
      }}
      sx={{
        p: 1.5,
        minHeight: 360,
        borderColor: dragOverSide === side ? "secondary.main" : "divider",
        backgroundColor: dragOverSide === side ? "action.hover" : "background.paper",
        transition: "border-color 160ms ease, background-color 160ms ease",
      }}
    >
      <Stack spacing={1.25}>
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            <Chip size="small" variant="outlined" label={sidePermissions.length} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Typography
            variant="caption"
            color={dragOverSide === side ? "secondary.main" : "text.secondary"}
            sx={{ fontWeight: dragOverSide === side ? 700 : 500 }}
          >
            {dragOverSide === side && draggingKeys.length > 0
              ? `${side === "granted" ? "Granting" : "Revoking"} ${draggingKeys.length} ${draggingKeys.length === 1 ? "permission" : "permissions"}`
              : side === "granted"
                ? "Drag permissions here to grant them, or double-click an available permission."
                : "Drag permissions here to revoke them, or double-click a granted permission."}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-end"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            size="small"
            variant="text"
            disabled={pending || sidePermissions.length === 0}
            onClick={() => selectAllVisibleKeys(side)}
          >
            Select all
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={
              pending ||
              (side === "available"
                ? selectedVisibleAvailableKeys.length === 0
                : selectedVisibleGrantedKeys.length === 0)
            }
            onClick={() => clearHighlightedKeys(side)}
          >
            Clear
          </Button>
        </Stack>

        <Box sx={{ display: "grid", gap: 1, minHeight: 120 }}>
          {sidePermissions.map((permission) => renderPermissionCard(permission, side))}
          {sidePermissions.length === 0 ? (
            <Box
              sx={{
                display: "grid",
                minHeight: 120,
                placeItems: "center",
                color: "text.secondary",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">No matching permissions.</Typography>
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddOutlinedIcon />}
          disabled={pending || selectedVisibleAvailableKeys.length === 0}
          onClick={() => transferKeys("granted", selectedVisibleAvailableKeys)}
        >
          Grant selected
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RemoveOutlinedIcon />}
          disabled={pending || selectedVisibleGrantedKeys.length === 0}
          onClick={() => transferKeys("available", selectedVisibleGrantedKeys)}
        >
          Revoke selected
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        {renderColumn(
          "available",
          "Available",
          "Permissions not currently granted by this role.",
          availablePermissions,
        )}
        {renderColumn(
          "granted",
          "Granted",
          "Permissions currently granted by this role.",
          grantedPermissions,
        )}
      </Box>
    </Stack>
  );
};
