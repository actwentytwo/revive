import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <Paper
    elevation={0}
    sx={{
      border: "1px solid rgba(15, 23, 42, 0.08)",
      p: 1.75,
      backgroundColor: "background.paper",
    }}
  >
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.4rem", md: "1.72rem" } }}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 840 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
        </Stack>
      ) : null}
    </Stack>
  </Paper>
);
