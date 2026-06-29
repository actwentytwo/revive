import { useEffect, useState } from "react";
import {
  Alert,
  Button,
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
import { AccessDeniedNotice } from "./AccessDeniedNotice";

type EffectiveAccessTabProps = {
  canRead: boolean;
};

export const EffectiveAccessTab = ({ canRead }: EffectiveAccessTabProps) => {
  const session = trpc.meta.session.useQuery(undefined, { enabled: canRead, retry: false });
  const identitySubject = session.data?.identity?.subject ?? "";
  const actorType = session.data?.actorType ?? "human";

  const [subjectType, setSubjectType] = useState<"human" | "functional-group" | "workload">(
    actorType,
  );
  const [subjectInput, setSubjectInput] = useState(identitySubject);
  const [lookup, setLookup] = useState<{
    subjectType: "human" | "functional-group" | "workload";
    subject: string;
  } | null>(null);

  useEffect(() => {
    if (!identitySubject) {
      return;
    }

    setSubjectType(actorType);
    setSubjectInput(identitySubject);
    setLookup({ subjectType: actorType, subject: identitySubject });
  }, [actorType, identitySubject]);

  const query = trpc.access.effectiveAccess.bySubject.useQuery(
    lookup ?? { subjectType, subject: "" },
    {
      enabled: canRead && Boolean(lookup?.subject),
      retry: false,
    },
  );

  if (!canRead) {
    return <AccessDeniedNotice message="You do not have permission to inspect effective access." />;
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Lookup Subject</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              select
              label="Subject type"
              value={subjectType}
              onChange={(event) =>
                setSubjectType(event.target.value as "human" | "functional-group" | "workload")
              }
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <MenuItem value="human">human</MenuItem>
              <MenuItem value="functional-group">functional-group</MenuItem>
              <MenuItem value="workload">workload</MenuItem>
            </TextField>
            <TextField
              label="Subject"
              value={subjectInput}
              onChange={(event) => setSubjectInput(event.target.value)}
              sx={{ flex: 1 }}
              placeholder="CN=Alice,OU=users,O=Example Corp or REVOLUTION_OPERATORS"
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={subjectInput.trim().length === 0}
              onClick={() => setLookup({ subjectType, subject: subjectInput.trim() })}
            >
              Lookup
            </Button>
            <Button
              variant="outlined"
              disabled={!identitySubject}
              onClick={() => {
                setSubjectType(actorType);
                setSubjectInput(identitySubject);
                setLookup({ subjectType: actorType, subject: identitySubject });
              }}
            >
              Use my subject
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {query.isLoading ? <Alert severity="info">Loading effective access...</Alert> : null}
      {query.isError ? <Alert severity="error">Effective access could not be loaded.</Alert> : null}

      {query.data ? (
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
                {query.data.effectivePermissions.map((permission) => (
                  <TableRow key={permission.permission}>
                    <TableCell sx={{ fontWeight: 700 }}>{permission.permission}</TableCell>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>
                      {permission.reasons
                        .map(
                          (reason) =>
                            `${reason.roleKey} (${reason.scopeKey}) via ${reason.subjectType}:${reason.subject}`,
                        )
                        .join("\n")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
};
