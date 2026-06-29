import { useEffect, useMemo, useState } from "react";
import { Alert, Paper, Stack, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { PageHeader } from "../components/PageHeader";
import { RouteContentTransition } from "../components/app-shell/RouteContentTransition";
import { AccessDeniedNotice } from "../components/authorisation/AccessDeniedNotice";
import { AuditEventsTab } from "../components/authorisation/AuditEventsTab";
import { AccessGrantsTab } from "../components/authorisation/AccessGrantsTab";
import { AuthorisationModelTab } from "../components/authorisation/AuthorisationModelTab";
import { EffectiveAccessTab } from "../components/authorisation/EffectiveAccessTab";
import { FunctionalGroupsTab } from "../components/authorisation/FunctionalGroupsTab";
import { useAccessPermissions } from "../hooks/useAccessPermissions";
import { trpc } from "../main";

const tabValues = [
  "model",
  "functional-groups",
  "access-grants",
  "audit-events",
  "effective-access",
] as const;
const AUTHORISATION_ACTIVE_TAB_STORAGE_KEY = "revolution-ui:authorisation-active-tab:v1";

type AuthorisationTabValue = (typeof tabValues)[number];
type AuthorisationFilterField = "key" | "grantId" | "environmentKey" | "clusterKey";

const tabLabelByValue: Record<AuthorisationTabValue, string> = {
  model: "Model",
  "functional-groups": "Functional Groups",
  "access-grants": "Access Grants",
  "audit-events": "Audit",
  "effective-access": "Effective Access",
};

const isAuthorisationTabValue = (value: string | null): value is AuthorisationTabValue =>
  Boolean(value && tabValues.includes(value as AuthorisationTabValue));

const readStoredActiveTab = (): AuthorisationTabValue => {
  if (typeof window === "undefined") {
    return "model";
  }

  const storedValue = window.sessionStorage.getItem(AUTHORISATION_ACTIVE_TAB_STORAGE_KEY);
  return isAuthorisationTabValue(storedValue) ? storedValue : "model";
};

const writeStoredActiveTab = (value: AuthorisationTabValue) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(AUTHORISATION_ACTIVE_TAB_STORAGE_KEY, value);
};

export const AuthorisationModelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedTab = searchParams.get("tab");
  const linkedSearch = searchParams.get("search");
  const linkedFilterField = searchParams.get("filterField");
  const linkedFilterValue = searchParams.get("filterValue");
  const [activeTab, setActiveTab] = useState<AuthorisationTabValue>(() =>
    isAuthorisationTabValue(linkedTab) ? linkedTab : readStoredActiveTab(),
  );
  const { myAccess, can } = useAccessPermissions();
  const canReadModel = can("authorisation-model.read");
  const canUpdateModel = can("authorisation-model.update");
  const canReadFunctionalGroups = can("functional-group.read");
  const canCreateFunctionalGroups = can("functional-group.create");
  const canUpdateFunctionalGroups = can("functional-group.update");
  const canDeleteFunctionalGroups = can("functional-group.disable");
  const canReadAccessGrants = can("access-grant.read");
  const canCreateAccessGrants = can("access-grant.create");
  const canUpdateAccessGrants = can("access-grant.update");
  const canDisableAccessGrants = can("access-grant.disable");
  const canReadAuditEvents = can("audit.read");
  const checkingPermissions = myAccess.isLoading && !myAccess.data;

  const authorisationModel = trpc.meta.authorisationModel.useQuery(undefined, {
    enabled: canReadModel,
    retry: false,
  });

  const roles = useMemo(
    () => authorisationModel.data?.roles ?? [],
    [authorisationModel.data?.roles],
  );

  useEffect(() => {
    if (!isAuthorisationTabValue(linkedTab) || linkedTab === activeTab) {
      return;
    }

    setActiveTab(linkedTab);
    writeStoredActiveTab(linkedTab);
  }, [activeTab, linkedTab]);

  const linkedFilter =
    linkedFilterField &&
    linkedFilterValue &&
    ["key", "grantId", "environmentKey", "clusterKey"].includes(linkedFilterField)
      ? ({
          field: linkedFilterField as AuthorisationFilterField,
          value: linkedFilterValue,
        } as const)
      : null;
  const functionalGroupFilter =
    linkedFilter?.field === "key" ? { field: "key" as const, value: linkedFilter.value } : null;
  const accessGrantFilter =
    linkedFilter?.field === "grantId" ||
    linkedFilter?.field === "environmentKey" ||
    linkedFilter?.field === "clusterKey"
      ? { field: linkedFilter.field, value: linkedFilter.value }
      : null;

  return (
    <Stack spacing={2.5} sx={{ minWidth: 0 }}>
      <PageHeader
        title="Authorisation"
        description="Review access policy and manage functional groups, access grants, and role permissions."
      />
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value: AuthorisationTabValue) => {
            setActiveTab(value);
            writeStoredActiveTab(value);
            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.set("tab", value);
            nextSearchParams.delete("search");
            nextSearchParams.delete("filterField");
            nextSearchParams.delete("filterValue");
            setSearchParams(nextSearchParams, { replace: true });
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabValues.map((tabValue) => (
            <Tab key={tabValue} value={tabValue} label={tabLabelByValue[tabValue]} />
          ))}
        </Tabs>
      </Paper>

      <RouteContentTransition>
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          {myAccess.isError ? (
            <Alert severity="error">
              Your access profile could not be loaded. Permission-gated actions may be unavailable.
            </Alert>
          ) : null}

          {checkingPermissions ? <Alert severity="info">Checking permissions...</Alert> : null}

          {!checkingPermissions && activeTab === "model" ? (
            canReadModel ? (
              <AuthorisationModelTab
                model={authorisationModel.data}
                loading={authorisationModel.isLoading}
                error={authorisationModel.isError}
                canUpdate={canUpdateModel}
              />
            ) : (
              <AccessDeniedNotice message="You do not have permission to view the authorisation model." />
            )
          ) : null}

          {!checkingPermissions && activeTab === "functional-groups" ? (
            <FunctionalGroupsTab
              canRead={canReadFunctionalGroups}
              canReadAccessGrants={canReadAccessGrants}
              canCreate={canCreateFunctionalGroups}
              canUpdate={canUpdateFunctionalGroups}
              canDelete={canDeleteFunctionalGroups}
              initialSearch={linkedSearch}
              initialFilter={functionalGroupFilter}
            />
          ) : null}

          {!checkingPermissions && activeTab === "access-grants" ? (
            <AccessGrantsTab
              roles={roles}
              canRead={canReadAccessGrants}
              canCreate={canCreateAccessGrants}
              canUpdate={canUpdateAccessGrants}
              canDisable={canDisableAccessGrants}
              initialSearch={linkedSearch}
              initialFilter={accessGrantFilter}
            />
          ) : null}

          {!checkingPermissions && activeTab === "audit-events" ? (
            <AuditEventsTab canRead={canReadAuditEvents} />
          ) : null}

          {!checkingPermissions && activeTab === "effective-access" ? (
            <EffectiveAccessTab canRead={canReadAccessGrants} />
          ) : null}
        </Stack>
      </RouteContentTransition>
    </Stack>
  );
};
