import type { PropsWithChildren } from "react";
import { Box, useMediaQuery } from "@mui/material";

type RouteContentTransitionProps = PropsWithChildren<{
  durationMs?: number;
  translateYPx?: number;
}>;

export const RouteContentTransition = ({
  children,
  durationMs = 650,
  translateYPx = 6,
}: RouteContentTransitionProps) => {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Box
      sx={
        prefersReducedMotion
          ? undefined
          : {
              animation: `route-content-enter ${durationMs}ms ease-out`,
              "@keyframes route-content-enter": {
                from: { opacity: 0, transform: `translateY(${translateYPx}px)` },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }
      }
    >
      {children}
    </Box>
  );
};
