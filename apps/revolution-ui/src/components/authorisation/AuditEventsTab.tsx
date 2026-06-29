import {
  Alert,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { trpc } from "../../main";
import { AccessDeniedNotice } from "./AccessDeniedNotice";

type AuditEventsTabProps = {
  canRead: boolean;
};

export const AuditEventsTab = ({ canRead }: AuditEventsTabProps) => {
  const query = trpc.access.audit.list.useQuery({ limit: 100 }, { enabled: canRead, retry: false });

  if (!canRead) {
    return <AccessDeniedNotice message="You do not have permission to view audit events." />;
  }

  return (
    <Stack spacing={2}>
      {query.isLoading ? <Alert severity="info">Loading audit events...</Alert> : null}
      {query.isError ? <Alert severity="error">Audit events could not be loaded.</Alert> : null}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Audit Events</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(query.data ?? []).map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{new Date(event.createdAt).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{event.action}</TableCell>
                  <TableCell>{event.actor}</TableCell>
                  <TableCell>{`${event.targetType}:${event.targetKey}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};
