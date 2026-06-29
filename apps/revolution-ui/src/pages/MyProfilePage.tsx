import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Alert, Button, Chip, Paper, Stack, Typography } from "@mui/material";

import { PageHeader } from "../components/PageHeader";
import { RouteContentTransition } from "../components/app-shell/RouteContentTransition";
import { MyAccessTab } from "../components/authorisation/MyAccessTab";
import { useAccessPermissions } from "../hooks/useAccessPermissions";
import { trpc } from "../main";

const getIdentityLabel = (identity: { cn?: string; subject: string } | null | undefined) =>
  identity?.cn ?? identity?.subject ?? "Current user";

const formatCountLabel = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const MyProfilePage = () => {
  const trpcUtils = trpc.useUtils();
  const { myAccess } = useAccessPermissions();
  const session = trpc.meta.session.useQuery(undefined, {
    retry: false,
  });
  const refreshAttributes = trpc.meta.refreshSessionAttributes.useMutation({
    onSuccess: async (result) => {
      await Promise.all([
        trpcUtils.meta.session.invalidate(),
        trpcUtils.access.myAccess.invalidate(),
      ]);
      window.alert(
        `Session attributes refreshed: ${formatCountLabel(result.functionalGroups.length, "group", "groups")} loaded.`,
      );
    },
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title="My Profile"
        description="Review your REVOLUTION identity, groups, access grants, and effective permissions."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            disabled={refreshAttributes.isPending}
            onClick={() => refreshAttributes.mutate({})}
          >
            {refreshAttributes.isPending ? "Refreshing..." : "Refresh session attributes"}
          </Button>
        }
      />

      <RouteContentTransition>
        <Stack spacing={3}>
          {refreshAttributes.isError ? (
            <Alert severity="error">Session attributes could not be refreshed.</Alert>
          ) : null}

          <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <AccountCircleOutlinedIcon color="primary" />
                <Stack spacing={0.25}>
                  <Typography variant="h6">{getIdentityLabel(session.data?.identity)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {session.data?.identity?.subject ?? "Identity details are not available."}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={`Actor: ${session.data?.actorType ?? "unknown"}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Functional groups: ${session.data?.functionalGroups.length ?? 0}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              {session.data?.functionalGroups.length ? (
                <Stack spacing={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Functional groups
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {session.data.functionalGroups.map((group) => (
                      <Chip key={group} label={group} size="small" />
                    ))}
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </Paper>

          <MyAccessTab
            myAccess={myAccess.data}
            isLoading={myAccess.isLoading}
            isError={myAccess.isError}
            error={myAccess.error}
          />
        </Stack>
      </RouteContentTransition>
    </Stack>
  );
};
