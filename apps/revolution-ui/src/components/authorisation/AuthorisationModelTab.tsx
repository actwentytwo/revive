import {
  Alert,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Link as RouterLink } from "react-router-dom";
import type { AuthorisationModelResponse } from "../../types/meta";

type AuthorisationModelTabProps = {
  model: AuthorisationModelResponse | undefined;
  loading: boolean;
  error: boolean;
  canUpdate: boolean;
};

export const AuthorisationModelTab = ({
  model,
  loading,
  error,
  canUpdate,
}: AuthorisationModelTabProps) => (
  <Stack spacing={2.5}>
    {loading ? <Alert severity="info">Loading authorisation model...</Alert> : null}
    {error ? (
      <Alert severity="warning">The authorisation model could not be loaded from the API.</Alert>
    ) : null}

    {model ? (
      <>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Typography variant="h5">Roles</Typography>
            <Stack spacing={1.5}>
              {model.roles.map((role) => (
                <Paper key={role.key} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="h6">{role.label}</Typography>
                      {canUpdate ? (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip size="small" variant="outlined" label="Editable" />
                          <IconButton
                            component={RouterLink}
                            to={`/configuration/authorisation/roles/${role.key}/permissions`}
                            size="small"
                            color="default"
                            aria-label={`Edit permissions for ${role.label}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : null}
                    </Stack>
                    <Typography color="text.secondary">{role.description}</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip size="small" variant="outlined" label={`Scope: ${role.grantScope}`} />
                      <Chip size="small" variant="outlined" label={`Actor: ${role.actorType}`} />
                    </Stack>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {role.permissions.map((permission) => (
                        <Chip key={`${role.key}-${permission}`} label={permission} size="small" />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h5">Permissions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {model.permissions.map((permission) => (
                  <TableRow key={permission.key}>
                    <TableCell sx={{ fontWeight: 700 }}>{permission.key}</TableCell>
                    <TableCell>{permission.category}</TableCell>
                    <TableCell>{permission.scope}</TableCell>
                    <TableCell>{permission.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h5">Procedure Access</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Procedure</TableCell>
                  <TableCell>Access</TableCell>
                  <TableCell>Permission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {model.procedures.map((procedure) => (
                  <TableRow key={procedure.key}>
                    <TableCell sx={{ fontWeight: 700 }}>{procedure.key}</TableCell>
                    <TableCell>{procedure.accessKind}</TableCell>
                    <TableCell>{procedure.permission ?? "-"}</TableCell>
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
