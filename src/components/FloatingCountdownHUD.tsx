import React from "react";
import {
  Box,
  Fade,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import { NiceCountdown } from "../pages/GamePage/components/NiceCountdown";

export const FloatingCountdownHUD = ({
  visible,
  msLeft,
  label = "",
  onClick,
  topOffset = 0,
  showLabel = true,
  minimal = false,
}: {
  visible: boolean;
  msLeft: number | null;
  label: string;
  onClick: () => void;
  topOffset?: number;
  showLabel?: boolean;
  minimal?: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const canShow = visible && msLeft != null && msLeft > 0;

  // Softer neon (more subtle)
  const neon =
    theme.palette.mode === "dark"
      ? "rgba(120, 255, 214, 0.38)"
      : "rgba(0, 150, 120, 0.28)";

  const halo =
    theme.palette.mode === "dark"
      ? "rgba(120, 255, 214, 0.10)"
      : "rgba(0, 150, 120, 0.08)";

  const effectiveShowLabel = showLabel && !isMobile && label;

  return (
    <Fade in={canShow} unmountOnExit>
      <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        sx={{
          position: "fixed",
          zIndex: theme.zIndex.appBar + 1,
          cursor: "pointer",
          outline: "none",
          top: isMobile
            ? "auto"
            : `calc(env(safe-area-inset-top, 0px) + ${topOffset}px)`,
          right: isMobile ? "auto" : 10,
          bottom: isMobile
            ? `calc(env(safe-area-inset-bottom, 0px) + 10px)`
            : "auto",
          left: isMobile ? "50%" : "auto",
          transform: isMobile ? "translateX(-50%)" : "none",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 0.6,
            overflow: "hidden",
            height: "72px",
            backdropFilter: "blur(16px)",
            verticalAlign: "middle",
            alignContent: "center",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
                : "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 16px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",

            WebkitBackdropFilter: "blur(10px)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
              {effectiveShowLabel ? (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.55,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    lineHeight: 1.0,
                    fontSize: 9,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </Typography>
              ) : null}

              <Box
                sx={{
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  "& *": {
                    fontSize: isMobile ? "0.9rem" : "0.92rem",
                    fontWeight: 800,
                    lineHeight: 1.05,
                  },
                  "& .MuiStack-root": { flexWrap: "nowrap" },
                }}
              >
                <NiceCountdown msLeft={msLeft} compact minimal />
              </Box>
            </Stack>
          </Stack>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: "uppercase",
                opacity: 0.6,
                marginTop: 1,
                textAlign: "right",
              }}
            >
              Game Name
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};
