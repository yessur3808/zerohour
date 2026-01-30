import React from "react";
import {
  Box,
  Fade,
  Paper,
  Portal, // ✅ add
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

  const effectiveShowLabel = Boolean(showLabel && label);

  const accent =
    theme.palette.mode === "dark"
      ? "rgba(120, 255, 214, 0.45)"
      : "rgba(0, 150, 120, 0.30)";

  return (
    <Portal>
      {" "}
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
            zIndex: theme.zIndex.appBar + 2,
            cursor: "pointer",
            outline: "none",

            top: `calc(env(safe-area-inset-top, 0px) + ${topOffset}px)`,
            right: isMobile ? "auto" : 12,

            left: isMobile ? "50%" : "auto",
            transform: isMobile ? "translateX(-50%)" : "none",

            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0,
              height: 72,
              display: "flex",
              alignItems: "center",

              minWidth: { xs: "min(92vw, 520px)", sm: 360 },
              maxWidth: { xs: "92vw", sm: 520 },

              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",

              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(180deg, rgba(18,20,24,0.88), rgba(18,20,24,0.72))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72))",
              backgroundImage: "none",

              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.10)"
                  : "1px solid rgba(0,0,0,0.08)",

              boxShadow:
                theme.palette.mode === "dark"
                  ? `0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px ${accent}`
                  : `0 18px 50px rgba(0,0,0,0.16), 0 0 0 1px ${accent}`,

              transition:
                "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 22px 60px rgba(0,0,0,0.65), 0 0 0 1px ${accent}, 0 0 0 6px rgba(120,255,214,0.08)`
                    : `0 22px 60px rgba(0,0,0,0.20), 0 0 0 1px ${accent}, 0 0 0 6px rgba(0,150,120,0.10)`,
              },
              "&:active": {
                transform: "translateY(0px) scale(0.99)",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ minWidth: 0, width: "100%" }}
            >
              <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "& *": {
                      fontWeight: 850,
                    },
                    "& .MuiStack-root": {
                      flexWrap: "nowrap",
                    },
                  }}
                >
                  <NiceCountdown msLeft={msLeft} compact minimal={minimal} />
                </Box>
              </Stack>

              {effectiveShowLabel ? (
                <Typography
                  variant="subtitle2"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    opacity: 0.65,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        </Box>
      </Fade>
    </Portal>
  );
};
