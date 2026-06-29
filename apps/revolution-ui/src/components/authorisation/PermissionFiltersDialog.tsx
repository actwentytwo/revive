import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import type { AuthorisationModelResponse } from "../../types/meta";

type RolePermission = AuthorisationModelResponse["permissions"][number];
type PermissionScope = RolePermission["scope"];

type PermissionFiltersDialogProps = {
  open: boolean;
  onClose: () => void;
  domainGroups: Array<{ scope: PermissionScope; label: string; domains: string[] }>;
  selectedDomains: string[];
  onToggleDomain: (domain: string) => void;
  onToggleDomainGroup: (domains: string[]) => void;
  onClearFilters: () => void;
  formatDomain: (domain: string) => string;
};

export const PermissionFiltersDialog = ({
  open,
  onClose,
  domainGroups,
  selectedDomains,
  onToggleDomain,
  onToggleDomainGroup,
  onClearFilters,
  formatDomain,
}: PermissionFiltersDialogProps) => {
  const activeFilterCount = selectedDomains.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Stack spacing={0.25}>
          <Typography variant="h6">Permission filters</Typography>
          <Typography variant="caption" color="text.secondary">
            Select one or more filters
          </Typography>
        </Stack>
        <IconButton aria-label="Close filters" onClick={onClose}>
          <CloseOutlinedIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Chip
                size="small"
                variant="outlined"
                label={activeFilterCount === 1 ? "1 selected" : `${activeFilterCount} selected`}
              />
              <Button
                onClick={onClearFilters}
                disabled={activeFilterCount === 0}
                sx={{ color: "warning.main", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Clear all
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            {domainGroups.map((group) => (
              <Stack key={group.scope} spacing={0.75}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "secondary.light" : "text.secondary",
                    }}
                  >
                    {group.label}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={`Toggle ${group.label} filters`}
                    onClick={() => onToggleDomainGroup(group.domains)}
                    sx={{ p: 0.25 }}
                  >
                    <Checkbox
                      checked={group.domains.every((domain) => selectedDomains.includes(domain))}
                      indeterminate={
                        group.domains.some((domain) => selectedDomains.includes(domain)) &&
                        !group.domains.every((domain) => selectedDomains.includes(domain))
                      }
                      tabIndex={-1}
                      disableRipple
                      sx={{ p: 0.25 }}
                    />
                  </IconButton>
                </Stack>
                <FormGroup
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    columnGap: 1.5,
                  }}
                >
                  {group.domains.map((domain) => (
                    <FormControlLabel
                      key={`${group.scope}:${domain}`}
                      control={
                        <Checkbox
                          checked={selectedDomains.includes(domain)}
                          onChange={() => onToggleDomain(domain)}
                        />
                      }
                      label={formatDomain(domain)}
                    />
                  ))}
                </FormGroup>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
