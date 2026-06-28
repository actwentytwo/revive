import { Alert, Snackbar } from "@mui/material";

type AppNoticeSnackbarProps = {
  message: string | null;
  onClose: () => void;
};

export function AppNoticeSnackbar({ message, onClose }: AppNoticeSnackbarProps) {
  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={6000}
      onClose={(_event, reason) => {
        if (reason === "clickaway") {
          return;
        }

        onClose();
      }}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="error" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
