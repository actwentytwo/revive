import {
  Alert,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { MyAccessSummary } from "../../types/access";

type MyAccessTabProps = {
  myAccess: MyAccessSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export const MyAccessTab = ({ myAccess, isLoading, isError, error }: MyAccessTabProps) => (
  <Stack spacing={2}>
    {isLoading ? <Alert severity="info">Loading your access profile...</Alert> : null}
    {isError ? (
      <Alert severity="error">
        {toErrorMessage(error, "Your access profile could not be loaded.")}
      </Alert>
    ) : null}

    {myAccess ? (
      <>
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Summary</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`Subject: ${myAccess.subjectType}`} size="small" variant="outlined" />
              <Chip
                label={`Functional groups: ${myAccess.functionalGroups.length}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Access grants: ${myAccess.grants.length}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Permissions: ${myAccess.effectivePermissions.length}`}
                size="small"
                variant="outlined"
              />
              {myAccess.hasBootstrapSuperAdmin ? (
                <Chip
                  label="Bootstrap super-admin path"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ) : null}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Effective Permissions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  <TableCell>Grant Reasons</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myAccess.effectivePermissions.map((permission) => (
                  <TableRow key={permission.permission}>
                    <TableCell sx={{ fontWeight: 700 }}>{permission.permission}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>
                      {permission.reasons
                        .map(
                          (reason) =>
                            `${reason.roleKey} (${reason.scopeKey}) via ${reason.subjectType}:${reason.subject}${reason.grantSource === "bootstrap" ? " [bootstrap]" : ""}`,
                        )
                        .join("\n")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </Paper>
      </>
    ) : null}
  </Stack>
);
