import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert } from "@mui/material";

type AccessDeniedNoticeProps = {
  message: string;
};

export const AccessDeniedNotice = ({ message }: AccessDeniedNoticeProps) => (
  <Alert severity="warning" icon={<LockOutlinedIcon fontSize="inherit" />}>
    {message}
  </Alert>
);
