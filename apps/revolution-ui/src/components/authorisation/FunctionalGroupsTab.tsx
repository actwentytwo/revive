import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { AccessDeniedNotice } from "./AccessDeniedNotice";

type FunctionalGroupsTabProps = {
  canRead: boolean;
  canReadAccessGrants: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  initialSearch?: string | null;
  initialFilter?: { field: "key"; value: string } | null;
};

export const FunctionalGroupsTab = ({
  canRead,
  canCreate,
  canUpdate,
  canDelete,
}: FunctionalGroupsTabProps) => {
  const trpcUtils = trpc.useUtils();
  const query = trpc.access.functionalGroups.list.useQuery(
    { includeDisabled: true },
    { enabled: canRead, retry: false },
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const createMutation = trpc.access.functionalGroups.create.useMutation({
    onSuccess: async () => {
      setCreateOpen(false);
      setNewKey("");
      setNewName("");
      setNewDescription("");
      await trpcUtils.access.functionalGroups.list.invalidate();
    },
  });

  const updateMutation = trpc.access.functionalGroups.update.useMutation({
    onSuccess: async () => {
      setEditKey(null);
      await trpcUtils.access.functionalGroups.list.invalidate();
    },
  });

  const deleteMutation = trpc.access.functionalGroups.delete.useMutation({
    onSuccess: async () => {
      await trpcUtils.access.functionalGroups.list.invalidate();
      await trpcUtils.access.grants.list.invalidate();
      await trpcUtils.access.myAccess.invalidate();
    },
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  if (!canRead) {
    return <AccessDeniedNotice message="You do not have permission to view functional groups." />;
  }

  return (
    <Stack spacing={2}>
      {query.isLoading ? <Alert severity="info">Loading functional groups...</Alert> : null}
      {query.isError ? (
        <Alert severity="error">Functional groups could not be loaded.</Alert>
      ) : null}
      {createMutation.error ? <Alert severity="error">{createMutation.error.message}</Alert> : null}
      {updateMutation.error ? <Alert severity="error">{updateMutation.error.message}</Alert> : null}
      {deleteMutation.error ? <Alert severity="error">{deleteMutation.error.message}</Alert> : null}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Functional Groups</Typography>
            <Button variant="outlined" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
              Create
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((group) => (
                <TableRow key={group.key}>
                  <TableCell sx={{ fontWeight: 700 }}>{group.key}</TableCell>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>{group.description ?? "-"}</TableCell>
                  <TableCell>{group.enabled ? "Active" : "Inactive"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        disabled={!canUpdate}
                        onClick={() => {
                          setEditKey(group.key);
                          setEditName(group.name);
                          setEditDescription(group.description ?? "");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!canDelete}
                        onClick={() => {
                          void deleteMutation.mutateAsync({ key: group.key });
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
        <DialogTitle>Create functional group</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Key"
              value={newKey}
              onChange={(event) => setNewKey(event.target.value)}
            />
            <TextField
              label="Name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <TextField
              label="Description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              createMutation.isPending || newKey.trim().length === 0 || newName.trim().length === 0
            }
            onClick={() => {
              void createMutation.mutateAsync({
                key: newKey.trim(),
                name: newName.trim(),
                description: newDescription.trim() || undefined,
                enabled: true,
              });
            }}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editKey)} onClose={() => setEditKey(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit functional group</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditKey(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={updateMutation.isPending || !editKey}
            onClick={() => {
              if (!editKey) {
                return;
              }

              void updateMutation.mutateAsync({
                key: editKey,
                name: editName.trim() || undefined,
                description: editDescription.trim() || undefined,
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
