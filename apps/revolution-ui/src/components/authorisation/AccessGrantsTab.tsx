import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { trpc } from "../../main";
import type { AuthorisationModelResponse } from "../../types/meta";
import { AccessDeniedNotice } from "./AccessDeniedNotice";

type AccessGrantsTabProps = {
  roles: AuthorisationModelResponse["roles"];
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDisable: boolean;
  initialSearch?: string | null;
  initialFilter?: { field: "grantId" | "environmentKey" | "clusterKey"; value: string } | null;
};

const allowedRoleKeys = [
  "REVOLUTION_PLATFORM_ADMINS",
  "REVOLUTION_OPERATORS",
  "REVOLUTION_VIEWERS",
] as const;

type RoleKey = (typeof allowedRoleKeys)[number];

const isRoleKey = (value: string): value is RoleKey =>
  (allowedRoleKeys as readonly string[]).includes(value);

export const AccessGrantsTab = ({
  roles: _roles,
  canRead,
  canCreate,
  canUpdate,
  canDisable,
}: AccessGrantsTabProps) => {
  const trpcUtils = trpc.useUtils();
  const query = trpc.access.grants.list.useQuery(
    { includeDisabled: true },
    { enabled: canRead, retry: false },
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [subjectType, setSubjectType] = useState<"human" | "functional-group" | "workload">(
    "functional-group",
  );
  const [subject, setSubject] = useState("");
  const [roleKey, setRoleKey] = useState<RoleKey>("REVOLUTION_VIEWERS");
  const [editGrantId, setEditGrantId] = useState<string | null>(null);
  const [editRoleKey, setEditRoleKey] = useState<RoleKey>("REVOLUTION_VIEWERS");

  const createMutation = trpc.access.grants.create.useMutation({
    onSuccess: async () => {
      setCreateOpen(false);
      setSubject("");
      await trpcUtils.access.grants.list.invalidate();
      await trpcUtils.access.myAccess.invalidate();
    },
  });

  const updateMutation = trpc.access.grants.update.useMutation({
    onSuccess: async () => {
      setEditGrantId(null);
      await trpcUtils.access.grants.list.invalidate();
      await trpcUtils.access.myAccess.invalidate();
    },
  });

  const disableMutation = trpc.access.grants.disable.useMutation({
    onSuccess: async () => {
      await trpcUtils.access.grants.list.invalidate();
      await trpcUtils.access.myAccess.invalidate();
    },
  });

  const deleteMutation = trpc.access.grants.delete.useMutation({
    onSuccess: async () => {
      await trpcUtils.access.grants.list.invalidate();
      await trpcUtils.access.myAccess.invalidate();
    },
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  if (!canRead) {
    return <AccessDeniedNotice message="You do not have permission to view access grants." />;
  }

  return (
    <Stack spacing={2}>
      {query.isLoading ? <Alert severity="info">Loading access grants...</Alert> : null}
      {query.isError ? <Alert severity="error">Access grants could not be loaded.</Alert> : null}
      {createMutation.error ? <Alert severity="error">{createMutation.error.message}</Alert> : null}
      {updateMutation.error ? <Alert severity="error">{updateMutation.error.message}</Alert> : null}
      {disableMutation.error ? (
        <Alert severity="error">{disableMutation.error.message}</Alert>
      ) : null}
      {deleteMutation.error ? <Alert severity="error">{deleteMutation.error.message}</Alert> : null}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Access Grants</Typography>
            <Button variant="outlined" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              Create
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grant ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((grant) => (
                <TableRow key={grant.grantId}>
                  <TableCell sx={{ fontWeight: 700 }}>{grant.grantId}</TableCell>
                  <TableCell>{`${grant.subjectType}:${grant.subject}`}</TableCell>
                  <TableCell>{grant.roleKey}</TableCell>
                  <TableCell>{grant.scopeKey}</TableCell>
                  <TableCell>{grant.enabled ? "Active" : "Inactive"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        disabled={!canUpdate}
                        onClick={() => {
                          setEditGrantId(grant.grantId);
                          setEditRoleKey(
                            isRoleKey(grant.roleKey) ? grant.roleKey : "REVOLUTION_VIEWERS",
                          );
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        disabled={!canDisable || !grant.enabled}
                        onClick={() => {
                          void disableMutation.mutateAsync({ grantId: grant.grantId });
                        }}
                      >
                        Disable
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!canDisable}
                        onClick={() => {
                          void deleteMutation.mutateAsync({ grantId: grant.grantId });
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create access grant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              select
              label="Subject type"
              value={subjectType}
              onChange={(event) =>
                setSubjectType(event.target.value as "human" | "functional-group" | "workload")
              }
            >
              <MenuItem value="functional-group">functional-group</MenuItem>
              <MenuItem value="human">human</MenuItem>
              <MenuItem value="workload">workload</MenuItem>
            </TextField>
            <TextField
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <TextField
              select
              label="Role"
              value={roleKey}
              onChange={(event) => {
                const value = event.target.value;
                if (isRoleKey(value)) {
                  setRoleKey(value);
                }
              }}
            >
              {allowedRoleKeys.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              createMutation.isPending || subject.trim().length === 0 || roleKey.length === 0
            }
            onClick={() => {
              void createMutation.mutateAsync({
                subjectType,
                subject: subject.trim(),
                roleKey,
                enabled: true,
              });
            }}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editGrantId)}
        onClose={() => setEditGrantId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit access grant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              select
              label="Role"
              value={editRoleKey}
              onChange={(event) => {
                const value = event.target.value;
                if (isRoleKey(value)) {
                  setEditRoleKey(value);
                }
              }}
            >
              {allowedRoleKeys.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGrantId(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={updateMutation.isPending || !editGrantId || editRoleKey.length === 0}
            onClick={() => {
              if (!editGrantId) {
                return;
              }
              void updateMutation.mutateAsync({
                grantId: editGrantId,
                roleKey: editRoleKey,
              });
            }}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
